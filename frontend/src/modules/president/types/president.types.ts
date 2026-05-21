/**
 * Types TypeScript pour le module Président
 * Frontend IMTECH University
 */

// ========== DASHBOARD KPI ==========

export interface KpiDashboard {
  // Académique
  totalEtudiants: number;
  tauxReussiteGlobal: number;
  tauxAbsenceMoyen: number;
  parcoursActifs: number;
  soutenancesPrevues: number;

  // Financier
  recettesTotales: number;
  impayesTotal: number;
  tauxRecouvrementScolarite: number;
  depensesTotalesMois: number;
  budgetConsomme: number;

  // RH
  totalEnseignants: number;
  totalPersonnelAdmin: number;
  congesEnCours: number;
  recrutementsEnAttente: number;
  contratsSurPointExpirer: number;

  // Discipline
  incidentsOuverts: number;
  conseilsDisciplineEnAttente: number;

  // Pastoral
  evenementsPastorauxMois: number;

  // Logistique
  ticketsMaintenanceOuverts: number;
  stocksAlerteCritique: number;

  // Scolarité
  inscriptionsEnCours: number;
  diplomesAGenerer: number;
  transfertsEnAttente: number;
  pvDeliberationEnAttente: number;
}

export interface DirectionSummary {
  academique: {
    parcoursTotal: number;
    enseignantsAffectes: number;
    examensEnCours: number;
    pvEnAttente: number;
  };
  scolarite: {
    inscriptionsEnCours: number;
    diplomesAGenerer: number;
    transfertsEnAttente: number;
  };
  finances: {
    budgetConsomme: number;
    achatsEnAttentValidation: number;
    caisseJournaliereClôturee: boolean;
  };
  rh: {
    contratsSurPointExpirer: number;
    fichePaieGenereeMois: boolean;
    evalAnnuellesEnCours: number;
  };
  logistique: {
    ticketsMaintenanceOuverts: number;
    stocksAlerteCritique: number;
  };
}

export interface AuditAction {
  id: string;
  action: string;
  entite: string;
  entiteId: string; // UUID
  details: Record<string, any>;
  createdAt: string;
  utilisateurNom: string;
}

// ========== RECRUTEMENTS ==========

export type TypeContrat = 'CDI' | 'CDD' | 'vacataire';
export type DecisionRecrutement = 'approuve' | 'rejete' | 'en_attente';

export interface RecrutementEnAttente {
  id: string; // UUID
  nom_candidat: string;
  poste: string;
  type_contrat: TypeContrat;
  salaire_propose: number;
  departement: string;
  soumis_le: string;
  par_rh: string;
  cv?: string;
}

export interface ValidateRecruitmentPayload {
  decision: DecisionRecrutement;
  commentaire: string;
  conditionsSpeciales?: string;
}

// ========== INVESTISSEMENTS ==========

export type DecisionInvestissement = 'approuve' | 'rejete' | 'en_attente';

export interface InvestissementEnAttente {
  id: string; // UUID
  intitule: string;
  montant: number;
  fournisseur: string;
  categorie: string;
  justification: string;
  soumis_le: string;
  par_economat: string;
}

export interface ValidateInvestmentPayload {
  decision: DecisionInvestissement;
  motif: string;
  montantAjuste?: number;
  conditionsSpeciales?: string;
}

// ========== DIPLOMES ==========

export interface DiplomeASigner {
  id: string; // UUID
  etudiant_nom: string;
  etudiant_prenom: string;
  parcours: string;
  mention: string;
  promotion_annee: string;
  date_limite_sig: string;
}

export interface SignDiplomaPayload {
  codeSignature: string;
  mentionSpeciale?: string;
}

export interface SignDiplomasInBulkPayload {
  ids: string[]; // UUID[]
  codeSignature: string;
  mentionSpeciale?: string;
}

// ========== CONVENTIONS ==========

export type TypePartenaire = 'eglise' | 'diocese' | 'etat' | 'entreprise' | 'universite';

export interface ConventionEnAttente {
  id: string; // UUID
  intitule: string;
  partenaire: string;
  type_partenaire: TypePartenaire;
  objet_convention: string;
  date_proposee: string;
  document_url?: string;
}

export interface SignConventionPayload {
  codeSignature: string;
  representantPartenaire: string;
  dateEffet: string;
  remarques?: string;
}

// ========== DISCIPLINE ==========

export type DecisionDiscipline = 
  | 'avertissement' 
  | 'suspension_temporaire' 
  | 'exclusion_definitive' 
  | 'classement_sans_suite';

export type GraviteIncident = 'mineure' | 'majeure' | 'critique';

export interface ConseilDiscipline {
  id: string; // UUID
  etudiant_nom: string;
  motif: string;
  date_incident: string;
  rapport_surveillant: string;
  proposition_secretariat: string;
  gravite: GraviteIncident;
}

export interface ArbitrateDisciplinePayload {
  decision: DecisionDiscipline;
  motivationDecision: string;
  dureeSuspensionJours?: number;
  notifierParents?: boolean;
  mesuresAccompagnement?: string;
}

// ========== PARCOURS ==========

export type NiveauParcours = 'licence' | 'master' | 'doctorat';
export type StatutParcours = 'ouvert' | 'ferme' | 'suspendu';
export type ActionParcours = 'ouvrir' | 'fermer' | 'suspendre';

export interface Parcours {
  id: string; // UUID
  intitule: string;
  niveau: NiveauParcours;
  statut: StatutParcours;
  effectif_actuel: number;
  responsable_pedagogique: string;
}

export interface ValidateParcoursPayload {
  action: ActionParcours;
  motif: string;
  dateEffet?: string;
  conditions?: string;
}

// ========== CALENDRIER ACADEMIQUE ==========

export type TypeEvenement = 'rentree' | 'examens' | 'vacances' | 'soutenances' | 'pastoral';
export type StatutEvenement = 'en_attente_validation' | 'valide' | 'modifie';

export interface EvenementCalendrier {
  id: string; // UUID
  intitule: string;
  type: TypeEvenement;
  date_debut: string;
  date_fin: string;
  statut: StatutEvenement;
}

export interface ModificationEvenement {
  evenementId: string; // UUID
  nouvelleDateDebut: string;
  nouvelleDateFin: string;
  motif?: string;
}

export interface ValidateCalendarPayload {
  commentaire?: string;
  modificationsProposees?: ModificationEvenement[];
}

// ========== DELEGATIONS ==========

export type StatutDelegation = 'active' | 'revoquee' | 'expiree';

export interface Delegation {
  id: string; // UUID
  delegataire: string;
  types_actes: string[];
  date_debut: string;
  date_fin: string;
  statut: StatutDelegation;
}

export interface DelegateSignaturePayload {
  delegataireId: string; // UUID
  typesActes: string[];
  dateDebut: string;
  dateFin: string;
  conditions?: string;
}

// ========== RESPONSES API ==========

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SignatureResponse {
  success: boolean;
  message: string;
  signatureHash?: string;
  signedCount?: number;
  skippedCount?: number;
}

// ========== UI HELPERS ==========

export type TrendDirection = 'up' | 'down' | 'neutral';
export type KpiColor = 'blue' | 'green' | 'amber' | 'red' | 'purple';
export type UrgenceLevel = 'faible' | 'moyenne' | 'haute';

export interface KpiCardData {
  label: string;
  value: number | string;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: string;
  color?: KpiColor;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface WorkflowItem {
  id: string; // UUID
  title: string;
  subtitle?: string;
  meta?: Array<{ label: string; value: string }>;
  urgence?: UrgenceLevel;
  type: 'recrutement' | 'investissement' | 'diplome' | 'convention' | 'discipline' | 'parcours' | 'calendrier';
}

// Made with Bob
