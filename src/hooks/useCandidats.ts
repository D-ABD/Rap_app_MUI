// hooks/useCandidats.ts
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import type {
  Candidat,
  CandidatFiltresOptions,
  CandidatFiltresValues,
  CandidatFormData,
  CandidatListResponse,
  CandidatMeta,
  CVStatutValue,
} from "../types/candidat";

// --------- Helpers (typés) ----------
const API_BASE = ""; // si ton axios a baseURL="/api", laisse vide. Sinon: '/api'

type ApiEnvelope<T> = { success?: boolean; message?: string; data: T };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiEnvelope<T>(v: unknown): v is ApiEnvelope<T> {
  return isObject(v) && "data" in v;
}

/** Dé-sérialise T ou {success,message,data:T} */
function unwrap<T>(payload: unknown): T {
  return isApiEnvelope<T>(payload) ? (payload as ApiEnvelope<T>).data : (payload as T);
}

/** Clé stable pour les deps (évite le warning deps complexes) */
export function jsonKey(v: unknown): string {
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return "[[unserializable]]";
  }
}

/** Recrée l’objet de params à partir de la clé */
function parseKey<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(key) as T;
  } catch {
    return fallback;
  }
}

/** Normalise les headers axios en Record<string,string> (pour filename) */
function normalizeHeaders(headers: unknown): Record<string, string> {
  if (!isObject(headers)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return out;
}

function blobDownload(blob: Blob, fallbackName: string, rawHeaders?: unknown) {
  const headers = normalizeHeaders(rawHeaders);
  let filename = fallbackName;
  const cd = headers["content-disposition"] || headers["Content-Disposition"];
  if (cd) {
    const m = /filename="?([^"]+)"?/i.exec(cd);
    if (m?.[1]) filename = m[1];
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Gardes de types pour différentes enveloppes */
type ResultsEnvelope<T> = { results: T[] };
type DataResultsEnvelope<T> = { data: { results: T[] } };
type DataArrayEnvelope<T> = { data: T[] };

function isResultsEnvelope<T>(v: unknown): v is ResultsEnvelope<T> {
  return isObject(v) && Array.isArray((v as Record<string, unknown>).results);
}
function isDataResultsEnvelope<T>(v: unknown): v is DataResultsEnvelope<T> {
  if (!isObject(v)) return false;
  const d = (v as Record<string, unknown>).data;
  return isObject(d) && Array.isArray((d as Record<string, unknown>).results);
}
function isDataArrayEnvelope<T>(v: unknown): v is DataArrayEnvelope<T> {
  if (!isObject(v)) return false;
  const d = (v as Record<string, unknown>).data;
  return Array.isArray(d);
}

/** 🔎 Récupère un tableau quelle que soit la forme de réponse */
function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (isResultsEnvelope<T>(payload)) return payload.results as T[];
  if (isDataResultsEnvelope<T>(payload)) return payload.data.results as T[];
  if (isDataArrayEnvelope<T>(payload)) return payload.data as T[];
  return [];
}

/* ────────────────────────────────────────────────────────────────────────────
   🧩 Normalisation meta (accepte snake_case et camelCase)
   ──────────────────────────────────────────────────────────────────────────── */
type Choice = { value: string | number; label: string };
type CvChoice = { value: CVStatutValue; label: string };

type MetaRawSnake = {
  statut_choices?: Choice[];
  cv_statut_choices?: CvChoice[];
  type_contrat_choices?: Choice[];
  disponibilite_choices?: Choice[];
  resultat_placement_choices?: Choice[];
  contrat_signe_choices?: Choice[];
  niveau_choices?: Choice[];
  centre_choices?: Choice[];
  formation_choices?: Choice[];
};

type MetaRawCamel = {
  statutChoices?: Choice[];
  cvStatutChoices?: CvChoice[];
  typeContratChoices?: Choice[];
  disponibiliteChoices?: Choice[];
  resultatPlacementChoices?: Choice[];
  contratSigneChoices?: Choice[];
  niveauChoices?: Choice[];
  centreChoices?: Choice[];
  formationChoices?: Choice[];
};

type MetaRaw = Partial<MetaRawSnake & MetaRawCamel> & Record<string, unknown>;

function isChoiceArray(val: unknown): val is Choice[] {
  return (
    Array.isArray(val) &&
    val.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      const label = rec["label"];
      const value = rec["value"];
      return typeof label === "string" && (typeof value === "string" || typeof value === "number");
    })
  );
}

const CV_VALUES = new Set<CVStatutValue>(["oui", "en_cours", "a_modifier"]);
function isCvChoiceArray(val: unknown): val is CvChoice[] {
  return (
    Array.isArray(val) &&
    val.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      const label = rec["label"];
      const value = rec["value"];
      return (
        typeof label === "string" &&
        typeof value === "string" &&
        CV_VALUES.has(value as CVStatutValue)
      );
    })
  );
}

function pickArr(
  raw: MetaRaw | null | undefined,
  snake: keyof MetaRawSnake & string,
  camel: keyof MetaRawCamel & string
): Choice[] {
  const snakeVal = raw?.[snake as keyof MetaRaw];
  const camelVal = raw?.[camel as keyof MetaRaw];
  if (isChoiceArray(snakeVal)) return snakeVal;
  if (isChoiceArray(camelVal)) return camelVal;
  return [];
}

function pickCvArr(
  raw: MetaRaw | null | undefined,
  snake: keyof MetaRawSnake & string,
  camel: keyof MetaRawCamel & string
): CvChoice[] {
  const snakeVal = raw?.[snake as keyof MetaRaw];
  const camelVal = raw?.[camel as keyof MetaRaw];
  if (isCvChoiceArray(snakeVal)) return snakeVal;
  if (isCvChoiceArray(camelVal)) return camelVal;
  return [];
}

function normalizeMetaLike(
  raw: unknown
): CandidatMeta & { centre_choices?: Choice[]; formation_choices?: Choice[] } {
  const r: MetaRaw = (typeof raw === "object" && raw !== null ? raw : {}) as MetaRaw;

  return {
    statut_choices: pickArr(r, "statut_choices", "statutChoices"),
    cv_statut_choices: pickCvArr(r, "cv_statut_choices", "cvStatutChoices"),
    type_contrat_choices: pickArr(r, "type_contrat_choices", "typeContratChoices"),
    disponibilite_choices: pickArr(r, "disponibilite_choices", "disponibiliteChoices"),
    resultat_placement_choices: pickArr(
      r,
      "resultat_placement_choices",
      "resultatPlacementChoices"
    ),
    contrat_signe_choices: pickArr(r, "contrat_signe_choices", "contratSigneChoices"),
    niveau_choices: pickArr(r, "niveau_choices", "niveauChoices"),
    // ✅ champs backend supplémentaires utilisés par le front
    centre_choices: pickArr(r, "centre_choices", "centreChoices"),
    formation_choices: pickArr(r, "formation_choices", "formationChoices"),
  };
}

// ===================================================
// 🔍 Liste paginée des candidats
// ===================================================
export function useCandidats(params: CandidatFiltresValues = {}) {
  const [data, setData] = useState<CandidatListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey: string = jsonKey(params);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedParams = parseKey<CandidatFiltresValues>(paramsKey, {});
        const res = await api.get(`${API_BASE}/candidats/`, {
          params: parsedParams,
        });
        const payload = unwrap<CandidatListResponse>(res.data as unknown);
        if (!alive) return;
        setData(payload);
      } catch (e) {
        if (!alive) return;
        setError(e as Error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [paramsKey]);

  return { data, loading, error };
}

// ===================================================
// 🔎 Détail d’un candidat
// ===================================================
export function useCandidat(id?: number) {
  const [data, setData] = useState<Candidat | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`${API_BASE}/candidats/${id}/`);
        const payload = unwrap<Candidat>(res.data as unknown);
        if (!alive) return;
        setData(payload);
      } catch (e) {
        if (!alive) return;
        setError(e as Error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return { data, loading, error };
}

// ===================================================
// ➕ Créer / ✏️ Modifier / 🗑 Supprimer
// ===================================================
export function useCreateCandidat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (payload: CandidatFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`${API_BASE}/candidats/`, payload);
      return unwrap<Candidat>(res.data as unknown);
    } catch (e: any) {
      setError(e);
      // ✅ Laisse passer l’erreur 400 (validation DRF) pour gestion dans <CandidatForm />
      if (e?.response?.status === 400) throw e;
      // ⚠️ Autres erreurs : on journalise quand même
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateCandidat(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (payload: CandidatFormData, method: "PATCH" | "PUT" = "PATCH") => {
    setLoading(true);
    setError(null);
    try {
      const res =
        method === "PUT"
          ? await api.put(`${API_BASE}/candidats/${id}/`, payload)
          : await api.patch(`${API_BASE}/candidats/${id}/`, payload);
      return unwrap<Candidat>(res.data as unknown);
    } catch (e: any) {
      setError(e);
      if (e?.response?.status === 400) throw e; // ✅ Laisse les 400 être gérées par <CandidatForm />
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
export function useDeleteCandidat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`${API_BASE}/candidats/${id}/`);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}

// ===================================================
// ⚙️ Métadonnées pour les candidats
// ===================================================
export function useCandidatMeta() {
  const [data, setData] = useState<CandidatMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`${API_BASE}/candidats/meta/`);
        const raw = unwrap<unknown>(res.data as unknown);
        const payload = normalizeMetaLike(raw);
        if (!alive) return;
        setData(payload);
      } catch (e) {
        if (!alive) return;
        setError(e as Error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}

// ===================================================
// 📄 Export CSV/PDF des candidats (déclenche download)
// ===================================================
export function useCandidatExportCSV() {
  const exporter = async (params: CandidatFiltresValues = {}) => {
    const res = await api.get(`${API_BASE}/candidats/export-csv/`, {
      params,
      responseType: "blob",
    });
    blobDownload(res.data as Blob, "candidats.csv", res.headers);
  };
  return { exporter };
}

export function useCandidatExportPDF() {
  const exporter = async (params: CandidatFiltresValues = {}) => {
    const res = await api.get(`${API_BASE}/candidats/export-pdf/`, {
      params,
      responseType: "blob",
    });
    blobDownload(res.data as Blob, "candidats.pdf", res.headers);
  };
  return { exporter };
}

// ===================================================
// 🎛️ Filtres candidats (métadonnées → options complètes)
// (version sans `any`)
// ===================================================

type FormationSimple = {
  id: number;
  nom?: string | null;
  num_offre?: string | null;
  centre?: { id: number; nom: string } | null;
};

type SimpleUser = { id: number; nom: string };

// Métadonnées normalisées attendues depuis /candidats/meta/
type MetaNormalized = {
  statut_choices?: Choice[];
  cv_statut_choices?: Choice[];
  type_contrat_choices?: Choice[];
  disponibilite_choices?: Choice[];
  resultat_placement_choices?: Choice[];
  contrat_signe_choices?: Choice[];
  centre_choices?: Choice[];
  // formation_choices?: Choice[]; // dispo si besoin plus tard
};

export function useCandidatFiltres() {
  const [options, setOptions] = useState<CandidatFiltresOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fallbackTriggeredRef = useRef(false); // ✅ évite le double fallback en dev (StrictMode)

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const DEV = import.meta.env.DEV;

        const [metaRes, formationsRes, usersRes] = await Promise.all([
          api.get(`${API_BASE}/candidats/meta/`),
          api.get(`${API_BASE}/formations/liste-simple/`),
          api.get(`${API_BASE}/users/liste-simple/`),
        ]);

        const metaRaw = unwrap<unknown>(metaRes.data);
        const meta = normalizeMetaLike(metaRaw) as MetaNormalized;

        const formations = toArray<FormationSimple>(unwrap(formationsRes.data));
        const usersSimple = toArray<SimpleUser>(unwrap(usersRes.data));

        // ─────────────────────────────────────────────
        // 🏫 CENTRES — 1) meta.centre_choices → 2) formations → 3) fallback /centres/
        // ─────────────────────────────────────────────
        let centre: Array<{ value: number; label: string }> = [];

        const centresFromMeta: Choice[] = isChoiceArray(meta.centre_choices)
          ? meta.centre_choices
          : [];
        if (centresFromMeta.length) {
          centre = centresFromMeta
            .map((c) => ({
              value: typeof c.value === "number" ? c.value : Number(c.value),
              label: c.label,
            }))
            .filter((c) => Number.isFinite(c.value) && c.label.trim().length > 0)
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          centre = Array.from(
            formations.reduce<Map<number, string>>((acc, f) => {
              if (f.centre?.id && f.centre.nom) acc.set(f.centre.id, f.centre.nom);
              return acc;
            }, new Map<number, string>())
          )
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label));

          if (!centre.length) {
            try {
              if (fallbackTriggeredRef.current) {
                if (DEV) {
                  // eslint-disable-next-line no-console
                  console.debug("[useCandidatFiltres] fallback déjà déclenché (StrictMode)");
                }
              } else {
                fallbackTriggeredRef.current = true;
                const centresRes = await api.get(`${API_BASE}/centres/`, {
                  params: { page_size: 1000 },
                });
                const centresList = toArray<{ id: number; nom: string }>(unwrap(centresRes.data));
                centre = centresList
                  .map((c) => ({ value: c.id, label: c.nom }))
                  .sort((a, b) => a.label.localeCompare(b.label));
              }
            } catch (err) {
              if (DEV) {
                // eslint-disable-next-line no-console
                console.debug("[useCandidatFiltres] erreur fallback /centres/", err);
              }
            }
          }
        }

        // 🎓 Formations (affichage "Nom — N°offre (Centre)")
        const formation = formations.map((f) => {
          const main = [f.nom ?? undefined, f.num_offre ?? undefined].filter(Boolean).join(" — ");
          const suffix = f.centre?.nom ? ` (${f.centre.nom})` : "";
          return {
            value: f.id,
            label: main ? `${main}${suffix}` : `#${f.id}${suffix}`,
          };
        });

        // 👤 Responsables (users simples)
        const responsable_placement = usersSimple.map((u) => ({
          value: u.id,
          label: u.nom,
        }));

        // Assemblage des options
        const full: CandidatFiltresOptions = {
          centre,
          formation,
          ville: [],
          code_postal: [],
          statut: meta.statut_choices ?? [],
          type_contrat: meta.type_contrat_choices ?? [],
          disponibilite: meta.disponibilite_choices ?? [],
          resultat_placement: meta.resultat_placement_choices ?? [],
          contrat_signe: meta.contrat_signe_choices ?? [],
          responsable_placement,
          date_min: [],
          date_max: [],
          search: [],
          page: [],
          page_size: [],
          ordering: [],
        };

        if (!alive) return;
        setOptions(full);
      } catch (e) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug("[useCandidatFiltres] erreur lors du chargement des filtres :", e);
        }
        if (!alive) return;
        setError(e as Error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { options, loading, error };
}
