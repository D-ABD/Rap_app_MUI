export interface AppairageCommentDTO {
  id: number;
  appairage: number;
  appairage_label: string;
  body: string;
  created_by_username: string;
  auteur_nom: string;
  created_at: string;
  updated_at: string;

  // Champs enrichis (optionnels selon contexte)
  candidat_nom?: string | null;
  candidat_prenom?: string | null;
  partenaire_nom?: string | null;

  formation_nom?: string | null;
  formation_numero_offre?: string | null;
  formation_centre?: string | null;
  formation_type_offre?: string | null;

  statut_snapshot?: string | null;
  appairage_statut_display?: string | null;
}

export interface AppairageCommentCreateInput {
  appairage: number; // obligatoire
  body: string;
}

export interface AppairageCommentUpdateInput {
  body?: string;
  appairage?: number; // optionnel (si on veut déplacer le commentaire)
}

export interface AppairageCommentListParams {
  appairage?: number;
  created_by?: number;
  ordering?: "created_at" | "-created_at" | "id" | "-id";

  // Filtres UI
  candidat_nom?: string;
  partenaire_nom?: string;
  formation_nom?: string;
  created_by_username?: string;

  // Pagination
  page?: number;
}
