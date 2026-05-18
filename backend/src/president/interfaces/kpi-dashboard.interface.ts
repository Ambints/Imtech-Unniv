/**
 * Interface pour le dashboard KPI du président
 * Consolidation de tous les indicateurs stratégiques
 */
export interface KpiDashboard {
  // ========== ACADÉMIQUE ==========
  totalEtudiants: number;
  tauxReussiteGlobal: number;         // en %
  tauxAbsenceMoyen: number;           // en %
  parcoursActifs: number;
  soutenancesPrevues: number;

  // ========== FINANCIER ==========
  recettesTotales: number;            // somme paiements confirmés
  impayesTotal: number;               // somme échéanciers en retard
  tauxRecouvrementScolarite: number;  // en %
  depensesTotalesMois: number;
  budgetConsomme: number;             // en %

  // ========== RESSOURCES HUMAINES ==========
  totalEnseignants: number;
  totalPersonnelAdmin: number;
  congesEnCours: number;
  recrutementsEnAttente: number;
  contratsSurPointExpirer: number;    // < 30 jours

  // ========== DISCIPLINE ==========
  incidentsOuverts: number;
  conseilsDisciplineEnAttente: number;

  // ========== PASTORAL (spécifique université catholique) ==========
  evenementsPastorauxMois: number;

  // ========== LOGISTIQUE ==========
  ticketsMaintenanceOuverts: number;
  stocksAlerteCritique: number;

  // ========== SCOLARITÉ ==========
  inscriptionsEnCours: number;
  diplomesAGenerer: number;
  transfertsEnAttente: number;
  pvDeliberationEnAttente: number;
}

/**
 * Interface pour la supervision des directions
 */
export interface DirectionSummary {
  academique: {
    parcoursTotal: number;
    enseignantsAffectes: number;
    examensEnCours: number;
    pvEnAttente: number;           // PV de délibération non validés
  };
  scolarite: {
    inscriptionsEnCours: number;
    diplomesAGenerer: number;
    transfertsEnAttente: number;
  };
  finances: {
    budgetConsomme: number;        // en %
    achatsEnAttentValidation: number;
    caisseJournaliereClôturee: boolean;
  };
  rh: {
    contratsSurPointExpirer: number;  // < 30 jours
    fichePaieGenereeMois: boolean;
    evalAnnuellesEnCours: number;
  };
  logistique: {
    ticketsMaintenanceOuverts: number;
    stocksAlerteCritique: number;
  };
}

/**
 * Interface pour les actions récentes du président
 */
export interface AuditAction {
  id: string;
  action: string;
  entite: string;
  entiteId: number;
  details: Record<string, any>;
  createdAt: Date;
  utilisateurNom: string;
}

// Made with Bob
