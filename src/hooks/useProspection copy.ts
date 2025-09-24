import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

import type {
  Prospection,
  ProspectionFiltresValues,
  ProspectionFormData,
  ChangerStatutPayload,
  HistoriqueProspection,
  PaginatedResults,
  ApiResponse,
  ProspectionStatut,
  ProspectionObjectif,
  ProspectionMotif,
  ProspectionTypeProspection,
  ProspectionMoyenContact,
  Choice,
} from '../types/prospection';
import type { ProspectionChoicesResponse } from '../types/prospection';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useProspections — liste paginée + filtres
// ─────────────────────────────────────────────────────────────────────────────
export function useProspections(params: ProspectionFiltresValues = {}, reloadKey: number = 0) {
  const [pageData, setPageData] = useState<PaginatedResults<Prospection> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchData = useCallback(() => {
    const parsedParams = JSON.parse(paramsKey);
    console.log('[useProspections] 📤 Envoi requête avec params :', parsedParams);

    setLoading(true);
    setError(null);

    api
      .get<ApiResponse<PaginatedResults<Prospection>>>('/prospections/', {
        params: parsedParams,
      })
      .then((res) => {
        setPageData(res.data.data);
      })
      .catch((err) => {
        console.error('[useProspections] ❌ Erreur API :', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData, reloadKey]); // ✅ ajout du reloadKey ici

  return {
    pageData,
    loading,
    error,
    refetch: fetchData,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useProspection — détail
// ─────────────────────────────────────────────────────────────────────────────
export function useProspection(id: number | string | null) {
  const [data, setData] = useState<Prospection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .get<ApiResponse<Prospection>>(`prospections/${id}/`)
      .then(res => setData(res.data.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useCreateProspection — création avec gestion loading/error
// ─────────────────────────────────────────────────────────────────────────────
export function useCreateProspection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (payload: ProspectionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<Prospection>>('prospections/', payload);
      return res.data.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useUpdateProspection — mise à jour avec gestion loading/error
// ─────────────────────────────────────────────────────────────────────────────
export function useUpdateProspection(id: number | string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (payload: ProspectionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== null)
      );

      const res = await api.patch<ApiResponse<Prospection>>(
        `prospections/${id}/`,
        cleanPayload
      );

      return res.data.data;
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error('❌ Erreur lors de la mise à jour :', err);
    console.error('💥 Détail erreur API :', err.response?.data);
    setError(err);
  } else {
    console.error('❌ Erreur inconnue :', err);
    setError(new Error('Une erreur inconnue est survenue.'));
  }
  throw err;
}
      
      finally {
      setLoading(false);
    }
  }, [id]);

  return { update, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useDeleteProspection — suppression logique
// ─────────────────────────────────────────────────────────────────────────────
export function useDeleteProspection(id: number | string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete<void>(`prospections/${id}/`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { remove, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useChangerStatut — action custom “changer-statut” avec gestion loading/error
// ─────────────────────────────────────────────────────────────────────────────
export function useChangerStatut(id: number | string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const changeStatus = useCallback(async (payload: ChangerStatutPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<Prospection>>(
        `prospections/${id}/changer-statut/`,
        payload
      );
      return res.data.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { changeStatus, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useHistoriqueProspections — récupère l’historique d’une prospection
// ─────────────────────────────────────────────────────────────────────────────
export function useHistoriqueProspections(id: number | string | null) {
  const [data, setData] = useState<HistoriqueProspection[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .get<ApiResponse<HistoriqueProspection[]>>(`prospections/${id}/historiques/`)
      .then(res => setData(res.data.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔹 useProspectionChoices — récupère les listes de choix
// ─────────────────────────────────────────────────────────────────────────────
export function useProspectionChoices() {
  const [choices, setChoices] = useState<ProspectionChoicesResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<ProspectionChoicesResponse>('prospections/choices/')
      .then(res => setChoices(res.data.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { choices, loading, error };
}



export default function useFiltresProspections() {
  const [filtres, setFiltres] = useState<{
    statut: Choice<ProspectionStatut>[];
    objectif: Choice<ProspectionObjectif>[];
    motif: Choice<ProspectionMotif>[];
    type_prospection: Choice<ProspectionTypeProspection>[];
    moyen_contact: Choice<ProspectionMoyenContact>[];
    owners?: Choice<number>[];
    formations?: Choice<number>[];
    partenaires?: Choice<number>[];
    user_role?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFiltres = async () => {
      try {
        console.log('[useFiltresProspections] 🚀 Requête en cours...');
        setLoading(true);
        setError(null);

        const res = await api.get<ApiResponse<typeof filtres>>('/prospections/filtres/');
        
        console.log('[useFiltresProspections] ✅ Filtres reçus :', res.data.data);
        setFiltres(res.data.data);
      } catch (err) {
        console.error('[useFiltresProspections] ❌ Erreur lors du fetch :', err);
        setError(err as Error);
        setFiltres(null);
      } finally {
        setLoading(false);
        console.log('[useFiltresProspections] ⏹️ Chargement terminé');
      }
    };

    fetchFiltres();
  }, []);

  return { filtres, loading, error };
}
