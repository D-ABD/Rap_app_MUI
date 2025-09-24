// ── Utilitaires ───────────────────────────────────────────────────────────────
export interface Choice {
  value: string | number;
  label: string;
}

// Aligné sur models.TextChoices
export type TypeAtelier =
  | "atelier_1" | "atelier_2" | "atelier_3" | "atelier_4"
  | "atelier_5" | "atelier_6" | "atelier_7" | "autre";

export interface BasicUserRef { id: number; full_name?: string; }

export interface BaseMeta {
  created_by?: number | BasicUserRef | null;
  created_at?: string | null; // ISO
  updated_at?: string | null; // ISO
  is_active?: boolean;
}

// ── Présence ─────────────────────────────────────────────────────────────────
export type PresenceStatut = "present" | "absent" | "excuse" | "non_renseigne";

export interface ParticipantAtelier {
  id: number;
  nom: string;              // nom complet
  presence: PresenceStatut; // statut de présence pour cet atelier
}

// ── AtelierTRE (liste + détail) ──────────────────────────────────────────────
export interface AtelierTRE extends BaseMeta {
  id: number;

  type_atelier: TypeAtelier;
  type_atelier_display: string;

  date_atelier: string | null; // ISO ex. "2025-09-10T09:00:00Z" ou null

  centre: number | null;
  centre_detail?: { id: number; label: string } | null;

  // M2M (écriture via ids)
  candidats: number[];

  // Lecture conviviale (ancienne & nouvelle forme)
  candidats_detail?: { id: number; nom: string }[]; // ← conservé pour compat
  participants_detail?: ParticipantAtelier[];       // ← recommandé pour la présence

  // Stats
  nb_inscrits: number;
  presence_counts?: {
    present: number;
    absent: number;
    excuse: number;
    non_renseigne: number;
  };
}

export interface AtelierTREFormData {
  type_atelier: TypeAtelier;
  date_atelier?: string | null; // ISO; peut être null si autorisé
  centre?: number | null;
  candidats?: number[];         // optionnel
}

// ── Réponses API ─────────────────────────────────────────────────────────────
export interface AtelierTREListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AtelierTRE[];
}

export interface AtelierTREMeta {
  type_atelier_choices: Choice[];
  centre_choices: Choice[];
  candidat_choices: Choice[];
  // optionnel si tu exposes aussi les statuts de présence côté /meta
  presence_choices?: Choice[]; // [{value:"present", label:"Présent"}, ...]
}

// ── Filtres liste (inchangé) ────────────────────────────────────────────────
export interface AtelierTREFiltresValues {
  type_atelier?: TypeAtelier;
  date_atelier_min?: string; // "YYYY-MM-DD"
  date_atelier_max?: string; // "YYYY-MM-DD"
  centre?: number;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string; // e.g. "-date_atelier"
}
