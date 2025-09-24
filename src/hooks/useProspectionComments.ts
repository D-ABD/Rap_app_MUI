// src/hooks/useProspectionComments.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/axios";
import axios from "axios";
import type {
  ProspectionCommentDTO,
  ProspectionCommentCreateInput,
  ProspectionCommentUpdateInput,
  ProspectionCommentListParams,
} from "../types/prospectionComment";

/* ──────────────────────────────────────────────────────────────────────────
   Endpoint unique (FR)
   ────────────────────────────────────────────────────────────────────────── */
const BASE = "/prospection-commentaires/";

/* ──────────────────────────────────────────────────────────────────────────
   Helpers de dé-sérialisation — tolérants (array, {data:[]}, {results:[]})
   ────────────────────────────────────────────────────────────────────────── */
type ApiArrayShape<T> = T[] | { data: T[] } | { results: T[] };
type ApiObjectShape<T> = T | { data: T };

function isArray<T>(d: unknown): d is T[] {
  return Array.isArray(d);
}
function hasDataArray<T>(d: unknown): d is { data: T[] } {
  return typeof d === "object" && d !== null && Array.isArray((d as { data?: unknown }).data);
}
function hasResultsArray<T>(d: unknown): d is { results: T[] } {
  return typeof d === "object" && d !== null && Array.isArray((d as { results?: unknown }).results);
}
function extractArray<T>(payload: ApiArrayShape<T>): T[] {
  if (isArray<T>(payload)) return payload;
  if (hasDataArray<T>(payload)) return payload.data;
  if (hasResultsArray<T>(payload)) return payload.results;
  return [];
}
function extractObject<T>(payload: ApiObjectShape<T>): T {
  if (typeof payload === "object" && payload !== null && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/* ──────────────────────────────────────────────────────────────────────────
   Normalisation & sérialisation des paramètres de liste
   ────────────────────────────────────────────────────────────────────────── */
type QueryDict = Record<string, string | number | boolean>;

function cleanString(x: unknown): string | undefined {
  if (typeof x !== "string") return undefined;
  const v = x.trim();
  return v === "" ? undefined : v;
}

function buildListQuery(p: ProspectionCommentListParams): QueryDict {
  const q: QueryDict = {};

  // IDs / booléens / tri
  if (typeof p.prospection === "number") q.prospection = p.prospection;
  if (typeof p.created_by === "number") q.created_by = p.created_by;
  if (typeof p.is_internal === "boolean") q.is_internal = p.is_internal;
  if (p.ordering) q.ordering = p.ordering;

  // Filtres par NOM (chaînes non vides uniquement)
  const formationNom = cleanString(p.formation_nom);
  const partenaireNom = cleanString(p.partenaire_nom);
  const authorUsername = cleanString(p.created_by_username);

  if (formationNom) q.formation_nom = formationNom;
  if (partenaireNom) q.partenaire_nom = partenaireNom;
  if (authorUsername) q.created_by_username = authorUsername;

  return q;
}

/* ──────────────────────────────────────────────────────────────────────────
   LISTE
   ────────────────────────────────────────────────────────────────────────── */
export function useListProspectionComments(
  params: ProspectionCommentListParams = {},
  reloadKey = 0
) {
  const [data, setData] = useState<ProspectionCommentDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Mémorise une clé stable des params
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchData = useCallback(() => {
    const parsedParams = JSON.parse(paramsKey) as unknown as ProspectionCommentListParams;
    const query = buildListQuery(parsedParams);

    const source = axios.CancelToken.source();
    setLoading(true);
    setError(null);

    api
      .get<ApiArrayShape<ProspectionCommentDTO>>(BASE, {
        params: query,
        cancelToken: source.token,
      })
      .then((res) => {
        const list = extractArray<ProspectionCommentDTO>(res.data);
        setData(list);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (axios.isAxiosError(err)) {
          setError(new Error(`HTTP ${err.response?.status ?? "?"}`));
        } else {
          setError(err as Error);
        }
        setData(null);
      })
      .finally(() => setLoading(false));

    // fonction d’annulation au besoin
    return () => source.cancel("list canceled");
  }, [paramsKey]);

  useEffect(() => {
    const cancel = fetchData();
    return () => {
      if (typeof cancel === "function") cancel();
    };
  }, [fetchData, reloadKey]);

  return { data, loading, error, refetch: fetchData };
}

/* ──────────────────────────────────────────────────────────────────────────
   DÉTAIL
   ────────────────────────────────────────────────────────────────────────── */
export function useProspectionComment(id: number | string | null) {
  const [data, setData] = useState<ProspectionCommentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setData(null);
      setLoading(false);
      return;
    }

    const source = axios.CancelToken.source();
    setLoading(true);
    setError(null);

    api
      .get<ApiObjectShape<ProspectionCommentDTO>>(`${BASE}${id}/`, {
        cancelToken: source.token,
      })
      .then((res) => {
        const obj = extractObject<ProspectionCommentDTO>(res.data);
        setData(obj);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (axios.isAxiosError(err)) {
          setError(new Error(`HTTP ${err.response?.status ?? "?"}`));
        } else {
          setError(err as Error);
        }
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => source.cancel("detail canceled");
  }, [id]);

  return { data, loading, error };
}

/* ──────────────────────────────────────────────────────────────────────────
   CRÉATION
   ────────────────────────────────────────────────────────────────────────── */
export function useCreateProspectionComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (payload: ProspectionCommentCreateInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiObjectShape<ProspectionCommentDTO>>(BASE, payload);
      const obj = extractObject<ProspectionCommentDTO>(res.data);
      return obj;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(new Error(`HTTP ${err.response?.status ?? "?"}`));
      } else {
        setError(err as Error);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

/* ──────────────────────────────────────────────────────────────────────────
   MISE À JOUR
   ────────────────────────────────────────────────────────────────────────── */
export function useUpdateProspectionComment(id: number | string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (payload: ProspectionCommentUpdateInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch<ApiObjectShape<ProspectionCommentDTO>>(`${BASE}${id}/`, payload);
      const obj = extractObject<ProspectionCommentDTO>(res.data);
      return obj;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(new Error(`HTTP ${err.response?.status ?? "?"}`));
      } else {
        setError(err as Error);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { update, loading, error };
}

/* ──────────────────────────────────────────────────────────────────────────
   SUPPRESSION
   ────────────────────────────────────────────────────────────────────────── */
export function useDeleteProspectionComment(id: number | string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete<void>(`${BASE}${id}/`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(new Error(`HTTP ${err.response?.status ?? "?"}`));
      } else {
        setError(err as Error);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { remove, loading, error };
}
