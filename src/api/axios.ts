import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { triggerGlobalLogout } from "./globalLogout";
import { getTokens, storeTokens, clearTokens } from "./tokenStorage";

// 🌍 Base URL depuis les variables d’environnement
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

// 🔧 Créer une instance Axios principale
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 🔑 Ajout automatique du token d’accès
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// ⚙️ Gestion du rafraîchissement de token
let isRefreshing = false;
let failedQueue: { resolve: (token?: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token || undefined);
  });
  failedQueue = [];
};

// 🧩 Instance sans interceptors pour éviter les boucles lors du refresh
const axiosNoAuth = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 🛑 Cas d’erreur 401 (token expiré)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refresh } = getTokens();

      if (!refresh) {
        clearTokens();
        triggerGlobalLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // En attente du refresh en cours
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ⚙️ Utiliser axiosNoAuth pour éviter le double interceptor
        const res = await axiosNoAuth.post("/token/refresh/", { refresh });
        const newAccess = res.data.access;

        storeTokens(newAccess, refresh);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        // Relancer la requête initiale
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        triggerGlobalLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
