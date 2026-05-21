export interface DashboardLogistique {
  ticketsOuverts: number;
  ticketsUrgents: number;
  ticketsNonAssignes: number;
  ticketsResolusAujourdHui: number;
  articlesEnAlerteCritique: number;
  mouvementsAujourdHui: number;
  sallesDisponibles: number;
  reservationsAujourdHui: number;
  reservationsEnAttente: number;
  planningsActifs: number;
  rapportsAujourdHui: number;
  totalBatiments: number;
  totalSalles: number;
}

export type PrioriteTicket = 'basse' | 'normale' | 'haute' | 'urgente';
export type StatutTicket = 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'annule';
export type TypeMaintenance = 'preventive' | 'curative' | 'urgence';

export interface Ticket {
  id: string;
  titre: string;
  description: string;
  type_maintenance: TypeMaintenance;
  priorite: PrioriteTicket;
  statut: StatutTicket;
  date_signalement: string;
  date_resolution?: string;
  cout_reparation?: number;
  observations?: string;
  batiment_nom?: string;
  salle_nom?: string;
  salle_code?: string;
  signale_par_nom: string;
  assigne_a_nom?: string;
}

export type CategorieStock = 'bureau' | 'nettoyage' | 'informatique' | 'pedagogique' | 'energie' | 'autre';

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
  en_alerte: boolean;
  deficit?: number; // Only present in alertes endpoint
}

export interface MouvementStock {
  id: string;
  type_mouvement: 'entree' | 'sortie' | 'ajustement';
  quantite: number;
  motif?: string;
  reference_doc?: string;
  date_mouvement: string;
  operateur: string;
}

export type TypeSalle = 'cours' | 'amphitheatre' | 'laboratoire' | 'salle_info' | 'salle_reunion' | 'bibliotheque';

export interface Salle {
  id: string;
  nom: string;
  code?: string;
  capacite: number;
  type_salle: TypeSalle;
  equipements: Record<string, unknown>;
  disponible: boolean;
  etage: number;
  batiment_id?: string;
  batiment_nom?: string;
  batiment_code?: string;
}

export interface SalleDetail extends Salle {
  tickets: Ticket[];
  reservations: Reservation[];
}

export interface Batiment {
  id: string;
  nom: string;
  code?: string;
  adresse?: string;
  actif: boolean;
  nb_salles: number;
  salles_disponibles: number;
}

export type StatutReservation = 'en_attente' | 'approuvee' | 'refusee' | 'annulee';

export interface Reservation {
  id: string;
  titre: string;
  description?: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  statut: StatutReservation;
  salle_nom: string;
  salle_code?: string;
  capacite: number;
  type_salle: TypeSalle;
  batiment_nom?: string;
  demandeur: string;
  demandeur_role: string;
  approuve_par_nom?: string;
}

export type TypeNettoyage = 'quotidien' | 'hebdomadaire' | 'mensuel' | 'apres_evenement' | 'desinfection';

export interface PlanningEntretien {
  id: string;
  zone?: string;
  type_nettoyage: TypeNettoyage;
  jour_semaine: number; // 1-7
  heure_debut?: string;
  duree_minutes?: number;
  actif: boolean;
  salle_nom?: string;
  salle_code?: string;
  batiment_nom?: string;
  responsable_nom?: string;
}

export interface RapportEntretien {
  id: string;
  date_realisation: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: 'realise' | 'partiel' | 'non_realise';
  observations?: string;
  type_nettoyage?: string;
  zone?: string;
  salle_nom?: string;
  batiment_nom?: string;
  realise_par_nom: string;
}

export interface CreateTicketDto {
  batiment_id?: string;
  salle_id?: string;
  titre: string;
  description: string;
  type_maintenance: TypeMaintenance;
  priorite?: PrioriteTicket;
  assigne_a?: string;
}

export interface UpdateTicketDto {
  statut?: StatutTicket;
  priorite?: PrioriteTicket;
  assigne_a?: string;
  cout_reparation?: number;
  observations?: string;
}

export interface CreateStockDto {
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

export interface MouvementStockDto {
  type_mouvement: 'entree' | 'sortie' | 'ajustement';
  quantite: number;
  motif?: string;
  reference_doc?: string;
}

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

export interface CreateRapportEntretienDto {
  planning_id?: string;
  realise_par: string;
  date_realisation: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: 'realise' | 'partiel' | 'non_realise';
  observations?: string;
}

export interface CreateBatimentDto {
  nom: string;
  code?: string;
  adresse?: string;
  actif?: boolean;
}

export interface CreateSalleDto {
  batiment_id: string;
  nom: string;
  code?: string;
  capacite: number;
  type_salle: TypeSalle;
  equipements?: Record<string, unknown>;
  disponible?: boolean;
  etage?: number;
}

export interface InventaireSalles {
  type_salle: TypeSalle;
  total: number;
  disponibles: number;
  capacite_totale: number;
}

export interface InventaireStocks {
  categorie: CategorieStock;
  nb_references: number;
  en_alerte: number;
  valeur_stock_totale: number;
}

export interface DemandeRessource {
  id: string;
  type_ressource: string;
  date_souhaitee: string;
  heure_debut?: string;
  heure_fin?: string;
  motif?: string;
  nb_participants?: number;
  materiel_requis?: string;
  statut: string;
  commentaire_rejet?: string;
  date_traitement?: string;
  demandeur_nom: string;
  demandeur_role: string;
  traite_par_nom?: string;
}

export interface CalendrierEvent {
  salle_id: string;
  salle_nom: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  titre: string;
  statut: string;
  source: 'reservation' | 'cours';
  ue_nom?: string;
  enseignant_nom?: string;
  parcours_nom?: string;
  type_seance?: string;
  annee_academique_nom?: string;
}

// Made with Bob
