export interface Commentaire {
  id: number;
  formation_id: number;
  formation_nom: string;
  num_offre?: string;
  centre_nom?: string;
  statut?: string;
  type_offre?: string;
  contenu: string;
  auteur: string;
  date: string;
  heure?: string;
  saturation?: number; // Valeur éventuellement saisie manuellement
  saturation_formation?: number; // ✅ Valeur copiée de la formation au moment du commentaire
  is_recent?: boolean;
  is_edited?: boolean;
  created_at?: string;
  updated_at?: string;
  start_date?: string; // 👈
  end_date?: string;   // 👈
}


export interface CommentaireFormData {
  formation: number;
  contenu: string;
  saturation?: number;
}

export type CommentaireFormErrors = Partial<Record<keyof CommentaireFormData, string>>;

export interface CommentaireMeta {
  saturation_min: number;
  saturation_max: number;
  preview_default_length: number;
  recent_default_days: number;
}

export interface CommentaireResponse {
  success: boolean;
  message: string;
  data: Commentaire;
}

export interface PaginatedCommentairesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommentaireResponse[];
}
