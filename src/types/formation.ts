// 🔷 Utilitaires génériques

export interface NomId {
  id: number;
  nom: string;
}

export interface CouleurLibelleNom extends NomId {
  libelle: string;
  couleur: string;
}

// 🔷 Entités liées

import type { Commentaire } from './commentaire';
import type { Document } from './document';
import type { Evenement } from './evenement';
import type { Prospection } from './prospection';
import { HistoriqueFormation } from './historique';

// 🔷 Donnée principale : Formation (lecture complète)

export interface Formation {
  id: number;
  nom: string;

  centre?: NomId | null;
  type_offre?: CouleurLibelleNom | null;
  statut?: CouleurLibelleNom | null;

  start_date?: string;
  end_date?: string;
  num_kairos?: string | null;
  num_offre?: string | null;
  num_produit?: string | null;
  assistante?: string | null;
  convocation_envoie?: boolean;

  prevus_crif?: number;
  prevus_mp?: number;
  inscrits_crif?: number;
  inscrits_mp?: number;

  cap?: number | null;
  entree_formation?: number;
  nombre_candidats?: number;
  nombre_entretiens?: number;
  nombre_evenements?: number;

  saturation?: number | null;
  saturation_badge?: string;
  taux_transformation?: number | null;
  transformation_badge?: string;

  total_places?: number;
  inscrits_total?: number;
  prevus_total?: number;
  places_restantes?: number | null;
  a_recruter?: number;
  is_a_recruter?: boolean;

  dernier_commentaire?: string | null;

  created_at?: string;
  updated_at?: string;

  commentaires?: Commentaire[];
  documents?: Document[];
  evenements?: Evenement[];
  prospections?: Prospection[];
  historique?: HistoriqueFormation[];

  // Propriétés calculées (issues du modèle)
  is_active?: boolean;
  is_future?: boolean;
  is_past?: boolean;
  status_temporel?: 'active' | 'past' | 'future' | 'unknown';
  saturation_badge_label?: string;
}

// 🔷 Formulaire de création / édition

export interface FormationFormData {
  nom: string;
  centre_id: number | null;
  type_offre_id: number | null;
  statut_id: number | null;

  start_date?: string;
  end_date?: string;
  num_kairos?: string;
  num_offre?: string;
  num_produit?: string;

  prevus_crif?: number;
  prevus_mp?: number;
  inscrits_crif?: number;
  inscrits_mp?: number;

  assistante?: string;
  cap?: number;
  convocation_envoie?: boolean;
  entree_formation?: number;
  nombre_candidats?: number;
  nombre_entretiens?: number;
  dernier_commentaire?: string;
}

export type FormationFormDataRaw = {
  [key: string]: string | number | boolean | null | undefined;
} & FormationFormData;

export type FormationFormErrors = Partial<Record<keyof FormationFormData, string>>;

// 🔷 Filtres pour les recherches de formations

export interface FiltresFormationsData {
  centres: NomId[];
  statuts: NomId[];
  type_offres: NomId[];
  formations?: { id: number; nom: string }[]; // ✅ Ajout facultatif si présent dans les filtres
}

export interface FiltresFormationsValues {
  texte?: string;
  centre?: number;
  statut?: number;
  type_offre?: number;
  date_debut?: string;
  date_fin?: string;
  places_disponibles?: boolean;
  tri?: string;
  page?: number; // ✅ support pagination DRF
}

// 🔷 Résumé compact (ex: pour badge, cards)

export interface FormationResume {
  formation_nom: string;
  centre_nom: string;
  type_offre: string;
  num_offre: string;
  statut: string;
  start_date: string;
  end_date: string;
  saturation_formation: number | null;
  saturation_badge: string;
}

// 🔷 Liste simplifiée (ex: menu déroulant)

export interface FormationSimple {
  id: number;
  nom: string;
  num_offre?: string | null;
  centre?: NomId | null;
  type_offre?: CouleurLibelleNom | null;
  statut?: CouleurLibelleNom | null;
}

// 🔷 Pagination standard

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 🔷 Réponses d'API

export interface FormationAPIResponse {
  success: boolean;
  message: string;
  data: Formation;
}

export interface FormationsListAPIResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    results: Formation[];
  };
}

// 🔷 Statistiques mensuelles

export interface FormationStatsParMois {
  [mois: number]: {
    label: string;
    count: number;
    inscrits: number;
  };
}

// 🔷 Formats d’export disponibles
export type FormationExportFormat = 'csv' | 'pdf' | 'word';

// 🔷 Données globales retournées par /formations/meta/
export interface FormationMeta {
  total_formations: number;
  total_inscrits: number;
  total_prevus: number;
  saturation_moyenne: number;
  taux_transformation_moyen: number;
}

// 🔷 Entrée d’historique de formation
