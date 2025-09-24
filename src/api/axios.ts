// src/api/axios.ts
import axios from "axios";
import { triggerGlobalLogout } from "./globalLogout";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// 🔑 Ajouter automatiquement le token si dispo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    if (config.headers?.set) {
      // ✅ AxiosHeaders (Axios v1)
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      // ✅ fallback pour compatibilité
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// 🚨 Gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("🔒 Session expirée");
      triggerGlobalLogout(); // 👉 gère déconnexion + toast côté AuthProvider
    }

    if (status === 403) {
      console.warn("⛔️ Accès interdit");
      // ⚠️ Pas de toast ici → on laisse la gestion à l'app si besoin
    }

    return Promise.reject(error);
  }
);

export default api;
