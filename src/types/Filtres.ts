export interface FiltresData {
  centres: { id: number; nom: string }[];
  statuts: { id: number; nom: string }[];
  type_offres: { id: number; nom: string }[];
  formation_etats: { value: string; label: string }[]; // ⬅️ Ajouté
}
export interface FiltresValues {
  centre_id?: number;
  statut_id?: number;
  type_offre_id?: number;
  formation_etat?: string; 
  [key: string]: string | number | undefined; 
  
}
