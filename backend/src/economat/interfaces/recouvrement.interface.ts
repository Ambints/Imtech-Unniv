export interface RecouvrementStats {
  nb_inscriptions: number;
  montant_attendu: number;
  montant_recouvre: number;
  montant_impaye: number;
  taux_recouvrement: number;
}

export interface InscriptionImpayee {
  inscription_id: string;
  matricule: string;
  nom: string;
  prenom: string;
  parcours: string;
  niveau: string;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  statut: string;
  derniere_echeance?: Date;
}

export interface RecouvrementByParcours {
  parcours: string;
  nb_etudiants: number;
  montant_attendu: number;
  montant_recouvre: number;
  taux: number;
}

export interface RecouvrementByNiveau {
  niveau: string;
  nb_etudiants: number;
  montant_attendu: number;
  montant_recouvre: number;
  taux: number;
}

export interface PaiementDetail {
  id: string;
  recu_numero: string;
  montant: number;
  date_paiement: Date;
  mode_paiement: string;
  reference?: string;
  matricule: string;
  nom: string;
  prenom: string;
  caissier?: string;
}

// Made with Bob
