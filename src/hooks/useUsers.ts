import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  CustomUserRole,
  RoleChoice,
  SimpleUser,
  User,
  UserFiltresOptions,
  MeResponse,
} from "../types/User";

// 👤 Données de l’utilisateur connecté
export function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api
      .get<MeResponse>("/users/me/")
      .then((res) => setUser(res.data.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}

// 📄 Tous les utilisateurs (liste complète)
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api
      .get<{ results: User[] }>("/users/")
      .then((res) => setUsers(res.data.results || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

// 📋 Liste simplifiée pour les selects
export function useSimpleUsers() {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api
      .get<{ data: SimpleUser[] }>("/users/liste-simple/")
      .then((res) => setUsers(res.data.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

// 🧩 Rôles disponibles (valeur + label)
export function useUserRoles() {
  const [roles, setRoles] = useState<RoleChoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api
      .get<{ data: Record<string, string> }>("/users/roles/")
      .then((res) => {
        const entries = Object.entries(res.data.data);
        const formatted: RoleChoice[] = entries.map(([value, label]) => ({
          value: value as CustomUserRole,
          label: String(label),
        }));
        setRoles(formatted);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading, error };
}

// 🔎 Filtres utilisateurs pour <FiltresPanel />
export default function useUserFiltres() {
  const [filtresOptions, setFiltresOptions] = useState<UserFiltresOptions>({
    role: [],
    is_active: [],
    formation: [],
    centre: [],
    type_offre: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: UserFiltresOptions }>("/users/filtres/")
      .then((res) => {
        const data = res.data?.data || {};
        setFiltresOptions({
          role: data.role ?? [],
          is_active: data.is_active ?? [],
          formation: data.formation ?? [],
          centre: data.centre ?? [],
          type_offre: data.type_offre ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { filtresOptions, loading };
}
