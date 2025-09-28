// ─────────────────────────────────────────────────────────────────────────────
// Types communs
// ─────────────────────────────────────────────────────────────────────────────

export interface Choice {
  value: string | number;
  label: string;
}

export type TypeOffreInfo = {
  id: number;
  nom?: string | null;
  libelle?: string | null;
  couleur?: string | null;
};

export type ChoiceOption = { label: string; value: string | number };

// ─────────────────────────────────────────────────────────────────────────────
// Formation (lite pour affichage)
// ─────────────────────────────────────────────────────────────────────────────

export interface FormationInfo {
  id: number;
  nom?: string | null;
  num_offre?: string | null;
  centre?: { id: number; nom: string } | null;
  type_offre?: TypeOffreInfo | null;
  date_debut?: string | null; // ✅ exposé par le backend
  date_fin?: string | null;   // ✅ exposé par le backend
}

/** Valeurs autorisées pour le statut de CV (aligne strictement avec le backend). */
export type CVStatutValue = 'oui' | 'en_cours' | 'a_modifier';

// ─────────────────────────────────────────────────────────────────────────────
// Appairage (lite) – dernier appairage du candidat
// ─────────────────────────────────────────────────────────────────────────────

/** 🔹 Commentaire lié à un appairage (lite) */
export interface CommentaireAppairage {
  id: number;
  body: string;
  is_internal: boolean;
  created_at: string; // ISO
  created_by: number | null;
  created_by_nom: string | null;
}

export interface AppairageLite {
  id: number;
  partenaire: number;                 // id FK
  partenaire_nom: string | null;      // libellé partenaire
  date_appairage: string;             // ISO
  statut: string;                     // value (ex: "accepte")
  statut_display: string;             // label (ex: "Accepté")
  retour_partenaire?: string | null;
  date_retour?: string | null;        // ISO
  created_at: string;                 // ISO
  updated_at: string;                 // ISO
  created_by_nom: string | null;      // libellé créateur

  /** 🔹 Dernier commentaire (string simple, rétro-compatibilité) */
  commentaire: string | null;

  /** 🔹 Liste complète des commentaires */
  commentaires?: CommentaireAppairage[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidat
// ─────────────────────────────────────────────────────────────────────────────
export type AtelierCounts = {
  atelier1?: number;
  atelier2?: number;
  atelier3?: number;
  atelier4?: number;
  atelier5?: number;
  atelier6?: number;
  atelier7?: number;
  autre?: number;
};

export interface Candidat {
  id: number;
  nom: string;
  prenom: string;

  email?: string | null;
  telephone?: string | null;
  ville?: string | null;
  code_postal?: string | null;

  compte_utilisateur?: number | { id: number; full_name?: string } | null;
  inscrit_gespers: boolean;
  entretien_done: boolean;
  test_is_ok: boolean;

  statut: string;

  // ✅ Nouveau : statut de CV (valeurs strictes)
  cv_statut?: CVStatutValue | null;     // value: 'oui' | 'en_cours' | 'a_modifier'
  cv_statut_display?: string | null;    // label lisible

  formation?: number | null;
  centre_id?: number | null;
  centre_nom?: string | null;
  evenement?: number | null;
  ateliers_counts?: AtelierCounts;

  notes?: string | null;
  origine_sourcing?: string | null;

  date_inscription: string; // ISO
  date_naissance?: string | null; // ISO

  rqth: boolean;
  type_contrat?: string | null;
  disponibilite?: string | null;
  permis_b: boolean;

  communication?: number | null;
  experience?: number | null;
  csp?: number | null;

  vu_par?: number | null;
  responsable_placement?: number | null;

  date_placement?: string | null; // ISO
  entreprise_placement?: number | null;
  resultat_placement?: string | null;
  entreprise_validee?: number | null;
  contrat_signe?: string | null;

  courrier_rentree: boolean;
  date_rentree?: string | null; // ISO

  admissible: boolean;

  // ⚠️ Libellés pour l’affichage
  responsable_placement_nom?: string | null;
  entreprise_placement_nom?: string | null;
  entreprise_validee_nom?: string | null;
  vu_par_nom?: string | null;
  resultat_placement_display?: string | null;

  // ✅ Dernier appairage (objet lite renvoyé par le backend)
  last_appairage?: AppairageLite | null;

  // champs système (détail uniquement)
  created_at?: string;
  updated_at?: string;
  created_by?: number | { id: number; full_name?: string } | null;
  updated_by?: number | { id: number; full_name?: string } | null;

  // calculés (read-only)
  nom_complet: string;
  age?: number | null;
  nb_appairages?: number;
  nb_prospections?: number;
  role_utilisateur?: string;
  ateliers_resume?: string;
  peut_modifier?: boolean;

  // divers
  numero_osia?: string | null;

  // infos formation prêtes pour l’UI (liste)
  formation_info?: FormationInfo | null;
}

export interface CandidatListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Candidat[];
}

// Payload d'édition/création côté front (on omet les champs calculés/serveur)
export type CandidatFormData = Partial<
  Omit<
    Candidat,
      | 'id'
      | 'nom_complet'
      | 'age'
      | 'nb_appairages'
      | 'nb_prospections'
      | 'role_utilisateur'
      | 'ateliers_resume'
      | 'peut_modifier'
      | 'created_at'
      | 'updated_at'
      | 'created_by'
      | 'updated_by'
      | 'formation_info'
      | 'date_inscription'
      | 'last_appairage'                 // ✅ read-only
      // ⚠️ on exclut aussi les libellés read-only
      | 'responsable_placement_nom'
      | 'entreprise_placement_nom'
      | 'entreprise_validee_nom'
      | 'vu_par_nom'
      | 'resultat_placement_display'
      | 'cv_statut_display'
  >
>;

// ─────────────────────────────────────────────────────────────────────────────
export interface CandidatMeta {
  statut_choices: Choice[];
  /** Source backend (snake_case). */
  cv_statut_choices: Array<{ value: CVStatutValue; label: string }>; // ✅
  /** Alias camelCase optionnel si exposé par le backend. */
  cvStatutChoices?: Array<{ value: CVStatutValue; label: string }>;
  type_contrat_choices: Choice[];
  disponibilite_choices: Choice[];
  resultat_placement_choices: Choice[];
  contrat_signe_choices: Choice[];
  niveau_choices: Choice[];
  // ✅ aussi renvoyés par /candidats/meta
  centre_choices?: Choice[];
  formation_choices?: Choice[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Historique de placement
// ─────────────────────────────────────────────────────────────────────────────

export interface HistoriquePlacement {
  id: number;
  candidat: number;
  candidat_nom: string;
  entreprise: number | null;
  entreprise_nom: string | null;
  responsable: number | null;
  responsable_nom: string | null;
  resultat: string;
  date_placement: string; // ISO
  commentaire?: string | null;
  created_at: string; // ISO
}

export interface HistoriquePlacementListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HistoriquePlacement[];
}

export interface HistoriquePlacementMeta {
  resultat_choices: Choice[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtres + params de liste (UI)
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidatFiltresValues {
  centre?: number;
  formation?: number;
  ville?: string;
  code_postal?: string;
  statut?: string;
  cv_statut?: CVStatutValue; // ✅ fortement typé
  type_contrat?: string;
  disponibilite?: string;
  resultat_placement?: string;
  contrat_signe?: string;
  responsable_placement?: number;

  rqth?: boolean | 'true' | 'false';
  permis_b?: boolean | 'true' | 'false';
  admissible?: boolean | 'true' | 'false';
  has_osia?: boolean | 'true' | 'false';
  entretien_done?: boolean | 'true' | 'false';
  test_is_ok?: boolean | 'true' | 'false';

  date_min?: string; // ISO (>= date_inscription)
  date_max?: string; // ISO (<= date_inscription)

  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string; // ex: "-date_inscription"
}

export type CandidatFiltresOptions = Partial<Record<keyof CandidatFiltresValues, ChoiceOption[]>>;

// … (tes types existants)
export interface CandidatReadMinimal {
  id: number;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  formation?: number | null;
  statut: string;
  cv_statut: CVStatutValue | null; // ✅ plutôt que répéter les string
  created_at: string; // ISO
  updated_at: string; // ISO
}

