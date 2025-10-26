import { useState, useEffect, useMemo, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import api from "../api/axios";

import type {
  Formation,
  FormationFormData,
  FormationFormErrors,
  FormationExportFormat,
  FormationMeta,
  FormationStatsParMois,
  PaginatedResponse,
  NomId,
} from "../types/formation";
import type { Commentaire } from "../types/commentaire";
import type { Evenement } from "../types/evenement";
import type { Prospection } from "../types/prospection";
import type { HistoriqueFormation } from "../types/historique";

// Type minimal d'écriture : uniquement les champs acceptés en POST
export type FormationWritePayload = {
  nom?: string;
  centre_id?: number | null;
  type_offre_id?: number | null;
  statut_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  num_kairos?: string | null;
  num_offre?: string | null;
  num_produit?: string | null;
  assistante?: string | null;
  prevus_crif?: number | null;
  prevus_mp?: number | null;
  inscrits_crif?: number | null;
  inscrits_mp?: number | null;
  cap?: number | null;
  convocation_envoie?: boolean;
  entree_formation?: number | null;
  nombre_candidats?: number | null;
  nombre_entretiens?: number | null;
  intitule_diplome?: string | null;
  code_diplome?: string | null;
  code_rncp?: string | null;
  total_heures?: number | null;
  heures_distanciel?: number | null;
};

function cleanFormationPayload(input: FormationFormData): FormationWritePayload {
  const payload = {
    ...input,
    centre_id: input.centre_id ? Number(input.centre_id) || null : null,
    type_offre_id: input.type_offre_id ? Number(input.type_offre_id) || null : null,
    statut_id: input.statut_id ? Number(input.statut_id) || null : null,
  } as Record<string, string | number | boolean | null | undefined>;

  // 🔧 Nettoyage : chaîne vide → null
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (typeof val === "string" && val.trim() === "") {
      payload[key] = null;
    }
  }

  // 🧩 Cast final vers le type attendu
  return payload as FormationWritePayload;
}

export interface FormationOption {
  value: number;
  label: string;
}

export interface UseFormationChoicesResult {
  centres: NomId[];
  statuts: NomId[];
  typeOffres: NomId[];
  loading: boolean;
  refresh: () => void; // volontairement sync côté signature
}

export function useFormationChoices(): UseFormationChoicesResult {
  const [centres, setCentres] = useState<NomId[]>([]);
  const [statuts, setStatuts] = useState<NomId[]>([]);
  const [typeOffres, setTypeOffres] = useState<NomId[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Callback stable
  const fetchChoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/formations/filtres/");
      const data = res.data?.data ?? {};

      setCentres(Array.isArray(data.centres) ? data.centres : []);
      setStatuts(Array.isArray(data.statuts) ? data.statuts : []);
      setTypeOffres(Array.isArray(data.type_offres) ? data.type_offres : []);
    } catch {
      toast.error("Erreur lors du chargement des choix de formulaire");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Monté une seule fois
  useEffect(() => {
    if (centres.length === 0 && statuts.length === 0 && typeOffres.length === 0) {
      fetchChoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ on monte une seule fois

  // ✅ Fonction refresh stable (ne change plus jamais)
  const refresh = useCallback(() => {
    fetchChoices();
  }, [fetchChoices]);

  // ✅ Retourne des valeurs mémoïsées (références stables)
  return useMemo(
    () => ({
      centres,
      statuts,
      typeOffres,
      loading,
      refresh,
    }),
    [centres, statuts, typeOffres, loading, refresh]
  );
}
interface UseFormationsOptions {
  search?: string;
  page?: number;
  ordering?: string;
  centre?: number;
  statut?: number;
  type_offre?: number;
  start_date?: string;
  end_date?: string;
  page_size?: number;
  avec_archivees?: boolean;
  activite?: string;
}

interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// ✅ Liste paginée
export function useFormations(filters: UseFormationsOptions = {}) {
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const [data, setData] = useState<PaginatedResponse<Formation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const parsedFilters = JSON.parse(filtersKey);
      const response = await api.get<PaginatedResponse<Formation>>("/formations/", {
        params: parsedFilters,
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// ✅ Lecture
export function useFormation(id: number) {
  const [data, setData] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<WrappedResponse<Formation>>(`/formations/${id}/`)
      .then((res) => {
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

// ✅ Création
export function useCreateFormation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  // useCallback → stabilise la référence
  const createFormation = useCallback(async (formData: FormationFormData) => {
    setLoading(true);
    try {
      const cleaned = cleanFormationPayload(formData);
      const response = await api.post<WrappedResponse<Formation>>("/formations/", cleaned);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Objet de retour stable
  return { createFormation, loading, error };
}

// ✅ Mise à jour
export function useUpdateFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const updateFormation = useCallback(
    async (formData: FormationFormData) => {
      setLoading(true);
      try {
        const cleaned = cleanFormationPayload(formData);
        const response = await api.patch<WrappedResponse<Formation>>(`/formations/${id}/`, cleaned);
        setError(null);
        return response.data.data;
      } catch (err) {
        setError(err as AxiosError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  return { updateFormation, loading, error };
}

// ✅ Suppression
export function useDeleteFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const deleteFormation = async () => {
    setLoading(true);
    try {
      await api.delete(`/formations/${id}/`);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteFormation, loading, error };
}

// ✅ Formulaire
export function useFormationForm(initialValues: FormationFormData) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormationFormErrors>({});

  const handleChange = <K extends keyof FormationFormData>(
    field: K,
    value: FormationFormData[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, setValues, errors, setErrors, handleChange, reset };
}

// ✅ Détails étendus (formation + entités liées)
// ✅ Détails étendus (formation + entités liées)
export function useFormationDetails(id: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  const [formation, setFormation] = useState<Formation | null>(null);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [prospections, setProspections] = useState<Prospection[]>([]);
  const [historique, setHistorique] = useState<HistoriqueFormation[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [fRes, cRes, dRes, eRes, prRes, hRes] = await Promise.all([
          api.get<ApiSuccessResponse<Formation>>(`/formations/${id}/`),
          api.get<ApiSuccessResponse<Commentaire[]>>(`/formations/${id}/commentaires/`),
          api.get<ApiSuccessResponse<Document[]>>(`/formations/${id}/documents/`),
          api.get<ApiSuccessResponse<Evenement[]>>(`/formations/${id}/evenements/`),
          api.get<ApiSuccessResponse<Prospection[]>>(`/formations/${id}/prospections/`),
          api.get<ApiSuccessResponse<HistoriqueFormation[]>>(`/formations/${id}/historique/`),
        ]);

        setFormation(fRes.data.data);
        setCommentaires(cRes.data.data);
        setDocuments(dRes.data.data);
        setEvenements(eRes.data.data);
        setProspections(prRes.data.data);
        setHistorique(hRes.data.data);
        setError(null);
      } catch (err) {
        setError(err as AxiosError);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  return {
    loading,
    error,
    formation,
    commentaires,
    documents,
    evenements,
    prospections,
    historique,
  };
}

// ✅ Duplication
export function useDupliquerFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const dupliquer = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ data: Formation }>(`/formations/${id}/dupliquer/`);
      toast.success("Formation dupliquée");
      return res.data.data;
    } catch (err) {
      setError(err as AxiosError);
      toast.error("Erreur lors de la duplication");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { dupliquer, loading, error };
}

// ✅ Export CSV/PDF/Word
export function useExportFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const exporter = async (format: FormationExportFormat) => {
    setLoading(true);
    try {
      const response = await api.get(`/formations/${id}/export_${format}/`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `formation_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export terminé");
    } catch (err) {
      setError(err as AxiosError);
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  return { exporter, loading, error };
}

// ✅ Métadonnées
export function useFormationMeta() {
  const [meta, setMeta] = useState<FormationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    api
      .get<{ data: FormationMeta }>("/formations/meta/")
      .then((res) => setMeta(res.data.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { meta, loading, error };
}

// ✅ Statistiques
export function useFormationStatsParMois() {
  const [stats, setStats] = useState<FormationStatsParMois>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    api
      .get<{ data: FormationStatsParMois }>("/formations/stats_par_mois/")
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

export function useHistoriqueFormation(formationId?: number) {
  const [data, setData] = useState<HistoriqueFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    const url = formationId ? `/formations/${formationId}/historique/` : `/formations/historique/`;

    api
      .get<{ data: HistoriqueFormation[] }>(url)
      .then((res) => {
        // ✅ suppression du forEach inutile
        setData(res.data.data);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [formationId]);

  return { data, loading, error };
}

export function useProspectionsByFormation(formationId: number) {
  const [prospections, setProspections] = useState<Prospection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formationId) return;

    setLoading(true);

    api
      .get(`/prospections/`, {
        params: { formation: formationId }, // ⬅️ clé de filtre côté API
      })
      .then((res) => {
        setProspections(res.data?.data?.results || []);
      })
      .catch(() => {
        // ✅ suppression du paramètre err inutilisé
        setProspections([]);
      })
      .finally(() => setLoading(false));
  }, [formationId]);

  return { prospections, loading };
}

// =============================================
// hooks/useFormations.ts
// (Options simples pour <select>)
// =============================================

export function useFormationsOptions() {
  const [options, setOptions] = useState<FormationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Adapte l'endpoint à ton backend (ex: /formations/liste-simple/)
        const res = await api.get("/formations/liste-simple/");
        const data = res.data?.data || res.data || [];
        const opts: FormationOption[] = Array.isArray(data)
          ? data.map((f: { id: number; nom: string; num_offre?: string | null }) => ({
              value: f.id,
              label: f.num_offre ? `${f.num_offre} — ${f.nom}` : f.nom,
            }))
          : [];

        if (!alive) return;
        setOptions(opts);
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

  return { options, loading, error };
}
// ✅ Archiver une formation
export function useArchiverFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const archiver = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ status: string; detail?: string }>(
        `/formations/${id}/archiver/`
      );
      toast.success("Formation archivée");
      return res.data;
    } catch (err) {
      setError(err as AxiosError);
      toast.error("Erreur lors de l'archivage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { archiver, loading, error };
}

// ✅ Désarchiver une formation
export function useDesarchiverFormation(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const desarchiver = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ status: string; detail?: string }>(
        `/formations/${id}/desarchiver/`
      );
      toast.success("Formation restaurée");
      return res.data;
    } catch (err) {
      setError(err as AxiosError);
      toast.error("Erreur lors de la restauration");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { desarchiver, loading, error };
}
