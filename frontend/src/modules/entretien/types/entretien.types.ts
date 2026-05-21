// ============================================================================
// TYPES ENTRETIEN MODULE - IMTECH UNIVERSITY SAAS
// ============================================================================

// Type de nettoyage
export type TypeNettoyage = 'quotidien' | 'hebdomadaire' | 'mensuel' | 'apres_evenement' | 'desinfection';

// Statut rapport entretien
export type StatutRapport = 'realise' | 'partiel' | 'non_realise';

// Statut ticket maintenance
export type StatutTicket = 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'annule';

// Type maintenance
export type TypeMaintenance = 'preventive' | 'curative' | 'urgence';

// Priorité ticket
export type PrioriteTicket = 'basse' | 'normale' | 'haute' | 'urgente';

// Type mouvement stock
export type TypeMouvement = 'entree' | 'sortie' | 'ajustement';

// Catégories stock
export type CategorieStock = 'bureau' | 'nettoyage' | 'informatique' | 'pedagogique' | 'energie' | 'autre';

// Statut réservation
export type StatutReservation = 'en_attente' | 'approuvee' | 'refusee' | 'annulee';

// Type ressource
export type TypeRessource = 'salle' | 'materiel' | 'laboratoire' | 'equipement' | 'autre';

// Statut demande ressource
export type StatutDemandeRessource = 'soumise' | 'en_cours' | 'approuvee' | 'rejetee' | 'livree';

// ============================================================================
// INTERFACES
// ============================================================================

// Dashboard KPI
export interface KpiEntretien {
  tickets_ouverts: number;
  tickets_urgents_non_resolus: number;
  articles_sous_seuil: number;
  plannings_actifs_aujourd_hui: number;
  reservations_en_attente: number;
  taux_execution_30j: number;
  depenses_entretien_mois: number;
}

// Planning entretien
export interface PlanningEntretien {
  id: string;
  salle_id?: string;
  batiment_id?: string;
  zone?: string;
  type_nettoyage: TypeNettoyage;
  responsable_id?: string;
  jour_semaine: number; // 1-7
  heure_debut?: string;
  duree_minutes?: number;
  actif: boolean;
  created_at: string;
  // Jointures
  salle_nom?: string;
  salle_code?: string;
  batiment_nom?: string;
  responsable_nom?: string;
}

// Planning hebdomadaire groupé
export interface PlanningHebdomadaire {
  [jour: number]: PlanningEntretien[];
}

// Rapport entretien
export interface RapportEntretien {
  id: string;
  planning_id?: string;
  realise_par: string;
  date_realisation: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: StatutRapport;
  observations?: string;
  created_at: string;
  // Jointures
  type_nettoyage?: string;
  zone?: string;
  salle_nom?: string;
  batiment_nom?: string;
  realise_par_nom?: string;
}

// Statistiques rapports
export interface StatsRapports {
  total: number;
  realises: number;
  partiels: number;
  non_realises: number;
  taux_execution: number;
}

// Ticket maintenance
export interface TicketMaintenance {
  id: string;
  batiment_id?: string;
  salle_id?: string;
  titre: string;
  description: string;
  type_maintenance: TypeMaintenance;
  priorite: PrioriteTicket;
  statut: StatutTicket;
  signale_par: string;
  assigne_a?: string;
  date_signalement: string;
  date_resolution?: string;
  photos_url?: string[];
  cout_reparation?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
  // Jointures
  batiment_nom?: string;
  salle_nom?: string;
  salle_code?: string;
  signale_par_nom?: string;
  assigne_a_nom?: string;
}

// Statistiques tickets
export interface StatsTickets {
  par_statut: { statut: string; total: number; delai_moyen_heures?: number }[];
  par_priorite: { priorite: string; total: number }[];
  par_type: { type_maintenance: string; total: number }[];
}

// Article stock
export interface StockArticle {
  id: string;
  reference: string;
  libelle: string;
  categorie: CategorieStock;
  unite: string;
  quantite_stock: number;
  seuil_alerte: number;
  prix_unitaire?: number;
  fournisseur?: string;
  emplacement?: string;
  derniere_mise_a_jour: string;
  created_at: string;
  // Calculé
  en_alerte?: boolean;
  deficit?: number;
}

// Mouvement stock
export interface MouvementStock {
  id: string;
  stock_id: string;
  type_mouvement: TypeMouvement;
  quantite: number;
  motif?: string;
  reference_doc?: string;
  utilisateur_id: string;
  date_mouvement: string;
  // Jointures
  operateur?: string;
  article_libelle?: string;
}

// Historique énergie
export interface HistoriqueEnergie {
  mois: string;
  annee: number;
  total_entrees: number;
  total_sorties: number;
  consommation: number;
}

// Réservation salle
export interface ReservationSalle {
  id: string;
  salle_id: string;
  titre: string;
  description?: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  demande_par: string;
  approuve_par?: string;
  statut: StatutReservation;
  created_at: string;
  // Jointures
  salle_nom?: string;
  salle_code?: string;
  capacite?: number;
  type_salle?: string;
  batiment_nom?: string;
  demandeur_nom?: string;
  approuve_par_nom?: string;
}

// Événement calendrier (réservation + EDT)
export interface EvenementCalendrier {
  id: string;
  salle_id: string;
  salle_nom: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  titre: string;
  statut: string;
  source: 'reservation' | 'cours';
  type?: string;
}

// Demande ressource
export interface DemandeRessource {
  id: string;
  type_ressource: TypeRessource;
  date_souhaitee: string;
  heure_debut?: string;
  heure_fin?: string;
  motif?: string;
  nb_participants?: number;
  materiel_requis?: string;
  demandeur_id: string;
  statut: StatutDemandeRessource;
  traite_par?: string;
  date_traitement?: string;
  commentaire_rejet?: string;
  created_at: string;
  updated_at: string;
  // Jointures
  demandeur_nom?: string;
  demandeur_role?: string;
  traite_par_nom?: string;
}

// Inventaire bâtiment
export interface InventaireBatiment {
  id: string;
  nom: string;
  code?: string;
  nb_salles: number;
  tickets_ouverts: number;
  plannings_actifs: number;
}

// Inventaire salles par type
export interface InventaireSallesType {
  type_salle: string;
  total: number;
  disponibles: number;
  capacite_totale: number;
}

// Inventaire stocks par catégorie
export interface InventaireStocksCategorie {
  categorie: string;
  nb_references: number;
  en_alerte: number;
  valeur_stock_totale: number;
}

// ============================================================================
// DTOs (pour formulaires)
// ============================================================================

export interface CreatePlanningEntretienDto {
  salle_id?: string;
  batiment_id?: string;
  zone?: string;
  type_nettoyage: TypeNettoyage;
  responsable_id?: string;
  jour_semaine: number;
  heure_debut?: string;
  duree_minutes?: number;
}

export interface UpdatePlanningEntretienDto {
  salle_id?: string;
  batiment_id?: string;
  zone?: string;
  type_nettoyage?: TypeNettoyage;
  responsable_id?: string;
  jour_semaine?: number;
  heure_debut?: string;
  duree_minutes?: number;
  actif?: boolean;
}

export interface CreateRapportEntretienDto {
  planning_id?: string;
  realise_par: string;
  date_realisation: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: StatutRapport;
  observations?: string;
}

export interface UpdateRapportEntretienDto {
  statut?: StatutRapport;
  observations?: string;
  heure_debut?: string;
  heure_fin?: string;
}

export interface CreateTicketMaintenanceDto {
  batiment_id?: string;
  salle_id?: string;
  titre: string;
  description: string;
  type_maintenance: TypeMaintenance;
  priorite?: PrioriteTicket;
  assigne_a?: string;
}

export interface UpdateTicketMaintenanceDto {
  statut?: StatutTicket;
  priorite?: PrioriteTicket;
  assigne_a?: string;
  cout_reparation?: number;
  observations?: string;
}

export interface CreateStockEntretienDto {
  reference: string;
  libelle: string;
  categorie: CategorieStock;
  unite: string;
  quantite_stock: number;
  seuil_alerte: number;
  prix_unitaire?: number;
  fournisseur?: string;
  emplacement?: string;
}

export interface UpdateStockEntretienDto {
  libelle?: string;
  seuil_alerte?: number;
  prix_unitaire?: number;
  fournisseur?: string;
  emplacement?: string;
}

export interface MouvementStockEntretienDto {
  type_mouvement: TypeMouvement;
  quantite: number;
  motif?: string;
  reference_doc?: string;
}

export interface TraiterReservationDto {
  statut: 'approuvee' | 'refusee';
  motif_refus?: string;
}

export interface TraiterDemandeRessourceDto {
  statut: 'approuvee' | 'rejetee';
  commentaire_rejet?: string;
}

// Made with Bob
