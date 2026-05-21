export interface RapportJournalier {
  date: Date;
  paiements: PaiementJournalier[];
  total_paiements: number;
  nb_paiements: number;
  par_mode_paiement: ModesPaiementStats[];
}

export interface PaiementJournalier {
  recu_numero: string;
  montant: number;
  mode_paiement: string;
  matricule: string;
  nom: string;
  prenom: string;
  caissier?: string;
  heure: string;
}

export interface ModesPaiementStats {
  mode_paiement: string;
  nb_transactions: number;
  montant_total: number;
}

export interface RapportMensuel {
  mois: string;
  annee: number;
  par_jour: JourStats[];
  total_mois: number;
  nb_paiements: number;
  moyenne_journaliere: number;
  total_recettes?: number;
  total_depenses?: number;
  solde?: number;
}

export interface JourStats {
  jour: Date;
  nb_paiements: number;
  montant_total: number;
}

export interface RapportAnnuel {
  annee_academique: string;
  recettes_totales: number;
  depenses_totales: number;
  solde: number;
  par_mois: MoisStats[];
  par_categorie_depense: CategorieDepenseStats[];
  par_source_recette: SourceRecetteStats[];
}

export interface MoisStats {
  mois: string;
  recettes: number;
  depenses: number;
  solde: number;
}

export interface CategorieDepenseStats {
  categorie: string;
  montant: number;
  pourcentage: number;
  nb_depenses: number;
}

export interface SourceRecetteStats {
  source: string;
  montant: number;
  pourcentage: number;
}

export interface BilanFinancier {
  periode: string;
  recettes: {
    scolarite: number;
    inscription: number;
    subventions: number;
    autres: number;
    total: number;
  };
  depenses: {
    personnel: number;
    equipement: number;
    fonctionnement: number;
    autres: number;
    total: number;
  };
  resultat: number;
  taux_execution_budget: number;
}

// Made with Bob
