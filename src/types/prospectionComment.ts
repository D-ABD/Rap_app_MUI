// src/types/prospectionComment.ts

export interface ProspectionCommentDTO {
  id: number;
  prospection: number;                      // id en lecture (renvoyé par DRF)
  body: string;
  is_internal: boolean;
  created_by_username: string;
  created_at: string;
  updated_at: string;

  // 🔹 Champs enrichis (read-only)
  partenaire_nom: string | null;
  formation_nom: string | null;
  prospection_text?: string | null;

  // ✅ Nouveaux champs alignés avec l’API
  prospection_owner: number | null;         // prospection.owner_id
  prospection_owner_username: string | null;
  prospection_partenaire: number | null;    // prospection.partenaire_id
}

// ⚠️ le serializer attend prospection_id (write-only -> source="prospection")
export interface ProspectionCommentCreateInput {
  prospection_id: number;                   // <- remplace 'prospection'
  body: string;
  is_internal?: boolean;
}

export interface ProspectionCommentUpdateInput {
  body?: string;
  is_internal?: boolean;
}

export interface ProspectionCommentListParams {
  prospection?: number;
  is_internal?: boolean;
  created_by?: number;
  ordering?: "created_at" | "-created_at" | "id" | "-id";

  // 🔹 filtres pratiques côté UI (facultatifs)
  formation_nom?: string;
  partenaire_nom?: string;
  created_by_username?: string;

  // ✅ nouveaux filtres possibles si exposés côté API
  prospection_owner?: number;
  prospection_partenaire?: number;
}
