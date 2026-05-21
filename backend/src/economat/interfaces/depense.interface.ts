export interface Depense {
  id: string;
  budget_id?: string;
  annee_academique_id: string;
  libelle: string;
  montant: number;
  categorie?: string;
  date_depense: Date;
  fournisseur?: string;
  numero_facture?: string;
  facture_url?: string;
  statut: 'en_attente' | 'approuve' | 'paye' | 'rejete';
  demande_par?: string;
  approuve_par?: string;
  date_approbation?: Date;
  observations?: string;
  valide_par_president?: string;
  valide_le?: Date;
  motif_decision?: string;
  conditions_speciales?: string;
  created_at: Date;
}

export interface DepenseWithDetails extends Depense {
  budget_categorie?: string;
  demandeur?: string;
  approbateur?: string;
  annee?: string;
}

export interface DepenseStats {
  nb_en_attente: number;
  montant_total: number;
  nb_approuve: number;
  nb_paye: number;
  nb_rejete: number;
}

export interface DepenseByFournisseur {
  fournisseur: string;
  nb_factures: number;
  montant_total: number;
  montant_moyen: number;
  derniere_transaction: Date;
}

export interface DepenseByCategorie {
  categorie: string;
  nb_depenses: number;
  montant_total: number;
  pourcentage: number;
}

// Made with Bob
