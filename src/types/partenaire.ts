// types/partenaire.ts

export type PartenaireType = "entreprise" | "partenaire" | "personne";

export type PartenaireAction =
  | "recrutement_emploi"
  | "recrutement_stage"
  | "recrutement_apprentissage"
  | "presentation_metier_entreprise"
  | "visite_entreprise"
  | "coaching"
  | "partenariat"
  | "autre"
  | "non_definie";

export type CentreLite = { id: number; nom: string };

export interface Partenaire {
  id: number;
  nom: string;
  type: PartenaireType;
  type_display: string;

  secteur_activite?: string | null;
  street_name?: string | null;
  zip_code?: string | null;
  city?: string | null;
  country?: string | null;

  // 🧭 Centre par défaut (nouveau côté back)
  /** Le back peut renvoyer l’objet complet… */
  default_centre?: CentreLite | null;
  /** …ou seulement l’id… */
  default_centre_id?: number | null;
  /** …ou uniquement le libellé (selon endpoint). */
  default_centre_nom?: string | null;

  contact_nom?: string | null;
  contact_poste?: string | null;
  contact_telephone?: string | null;
  contact_email?: string | null;

  website?: string | null;
  social_network_url?: string | null;

  actions?: PartenaireAction | null;
  actions_display?: string | null;
  action_description?: string | null;
  description?: string | null;

  slug: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;

  created_by?: {
    id: number;
    full_name: string;
  } | null;

  // Champs calculés
  full_address: string;
  contact_info: string;
  has_contact: boolean;
  has_address: boolean;
  has_web: boolean;

  // Compteurs (objets { count }) renvoyés par l'API
  prospections: { count: number };
  appairages: { count: number };
  formations: { count: number };
  candidats: { count: number };

  // Annotations numériques possibles côté liste
  prospections_count?: number;
  appairages_count?: number;
  formations_count?: number;
  candidats_count?: number;
}

// ⬇️ Alias pour éviter l’interface vide (eslint no-empty-object-type)
export type PartenaireWithRelations = Partenaire;

export interface PartenaireChoice {
  value: string;
  label: string;
}

export interface PartenaireChoicesResponse {
  types: PartenaireChoice[];
  actions: PartenaireChoice[];
}

// Pagination générique
export type Paginated<T> = { results: T[]; count: number };

export interface PartenaireMinimal {
  id: number;
  nom: string;
  type: string;
  secteur_activite?: string | null;
  city?: string | null;
  zip_code?: string | null;

  // 🧭 Optionnel selon endpoint
  default_centre_id?: number | null;
  default_centre_nom?: string | null;

  contact_nom?: string | null;
  contact_email?: string | null;
  contact_telephone?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string; // ISO
  updated_at: string; // ISO
}
