import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Appairage,
  AppairageCreatePayload,
  AppairageListItem,
  AppairageMeta,
  AppairageUpdatePayload,
  HistoriqueAppairage,
  PaginatedResults,
  AppairageFiltresValues,
  CommentaireAppairage,
} from "../types/appairage";

export function useListAppairages(
  params: AppairageFiltresValues = {},
  reloadKey?: number
) {
  const [data, setData] = useState<PaginatedResults<AppairageListItem> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Nettoyage des params avant envoi
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );

    api
      .get("/appairages/", { params: cleanParams })
      .then((res) => {
        const actualData = res.data.data || res.data;
        setData(actualData as PaginatedResults<AppairageListItem>);
      })
      .catch((err) => {
        console.error("❌ [useListAppairages] Error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(params), reloadKey]); // 👈 stringify pour bien détecter tout changement

  return { data, loading, error };
}

/* ✅ Correction principale : id peut être null ou undefined */
export function useAppairage(id?: number | null) {
  const [data, setData] = useState<Appairage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // ⛔ Ignore si id invalide
    if (!id || id <= 0) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get(`/appairages/${id}/`)
      .then((res) => {
        setData(res.data as Appairage);
      })
      .catch((err) => {
        console.error("❌ [useAppairage] Error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export function useCreateAppairage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (payload: AppairageCreatePayload) => {
    setLoading(true);
    try {
      const res = await api.post("/appairages/", payload);
      return res.data as Appairage;
    } catch (err) {
      console.error("❌ [useCreateAppairage] Error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateAppairage(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (payload: AppairageUpdatePayload) => {
    setLoading(true);
    try {
      const res = await api.patch(`/appairages/${id}/`, payload);
      return res.data as Appairage;
    } catch (err) {
      console.error("❌ [useUpdateAppairage] Error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteAppairage(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = async () => {
    setLoading(true);
    try {
      await api.delete(`/appairages/${id}/`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}

export function useAppairageMeta() {
  const [data, setData] = useState<AppairageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/appairages/meta/")
      .then((res) => {
        const metaData = res.data.data || res.data;
        setData(metaData as AppairageMeta);
      })
      .catch((err) => {
        console.error("❌ [useAppairageMeta] Error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useAppairageHistoriques(appairageId: number) {
  const [data, setData] = useState<HistoriqueAppairage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get(`/appairages/${appairageId}/historiques/`)
      .then((res) => {
        setData(res.data as HistoriqueAppairage[]);
      })
      .catch((err) => {
        console.error("❌ [useAppairageHistoriques] Error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [appairageId]);

  return { data, loading, error };
}

export function useAppairageComments(appairageId: number) {
  const [data, setData] = useState<CommentaireAppairage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!appairageId) return;
    setLoading(true);
    api
      .get(`/appairages/${appairageId}/commentaires/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [appairageId]);

  const addComment = async (payload: { body: string; is_internal?: boolean }) => {
    const res = await api.post(
      `/appairages/${appairageId}/commentaires/`,
      payload
    );
    setData((prev) => (prev ? [res.data, ...prev] : [res.data]));
    return res.data;
  };

  return { data, loading, error, addComment };
}
