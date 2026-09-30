export interface Equipement {
  id: number;
  type_equipement_id: number;
  type_equipement_nom: string | null;
  date_debut: string; // YYYY-MM-DD
  date_fin: string;
  nombre: number;
}

export interface EquipementInput {
  type_equipement_id: number;
  date_debut: string;
  date_fin: string;
  nombre: number;
}
