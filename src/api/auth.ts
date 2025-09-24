// src/api/auth.ts

import type { User } from '../types/User';
import api from './axios';

/**
 * 🔐 login(email, password)
 *
 * Fonction d’authentification : envoie les identifiants à l’API Django.
 * L’API retourne un token JWT d'accès (`access`) et un token de rafraîchissement (`refresh`).
 *
 * @param email - L’email de l’utilisateur
 * @param password - Le mot de passe de l’utilisateur
 * @returns Un objet contenant les tokens JWT (access & refresh)
 *
 * Note : Le paramètre `withCredentials: true` est important si le backend utilise des cookies
 */
export const login = async (email: string, password: string) => {
  const res = await api.post('/token/', { email, password }, { withCredentials: true });
  return res.data; // { access, refresh }
};

/**
 * 🙋 getUserProfile()
 *
 * Récupère les informations de l’utilisateur connecté.
 * Cette requête utilise le token JWT stocké dans le `localStorage` pour s’authentifier.
 *
 * @returns Un objet `User` avec les données de l’utilisateur (ex: id, email, nom, etc.)
 *
 * Important : Le token JWT doit être déjà stocké dans le `localStorage` sous la clé `access`
 */
export const getUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem('access');
  const res = await api.get('/users/me/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data; // ✅ extraire seulement l'objet User
};

