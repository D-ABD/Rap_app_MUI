import axios, { AxiosError } from "axios";
import { triggerGlobalLogout } from "./globalLogout";
import { getTokens, storeTokens, clearTokens } from "./tokenStorage";

// 🌍 Utiliser la variable d'environnement (définie dans .env.local ou .env.production)
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// 🔑 Ajouter automatiquement le token d’accès
api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${access}`;
  }
  return config;
});

// 🚨 Rafraîchissement automatique du token expiré
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si 401 et pas déjà en cours de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refresh } = getTokens();
      if (!refresh) {
        triggerGlobalLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh });
        const newAccess = res.data.access;
        storeTokens(newAccess, refresh);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
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
