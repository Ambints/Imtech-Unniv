export interface Budget {
  id: string;
  annee_academique_id: string;
  departement_id?: string;
  categorie: string;
  montant_prevu: number;
  montant_realise: number;
  description?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetWithDetails extends Budget {
  departement?: string;
  annee?: string;
  taux_execution: number;
  solde: number;
}

export interface BudgetStats {
  budget_total: number;
  depense_totale: number;
  solde: number;
  taux_execution: number;
}

export interface BudgetByDepartement {
  departement: string;
  budget_total: number;
  depense_totale: number;
  solde: number;
  taux_execution: number;
}

// Made with Bob
