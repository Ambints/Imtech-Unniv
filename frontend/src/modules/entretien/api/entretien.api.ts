// ============================================================================
// API CLIENT ENTRETIEN MODULE - IMTECH UNIVERSITY SAAS
// ============================================================================

import { api } from '@/api/client';
import type {
  KpiEntretien,
  PlanningEntretien,
  PlanningHebdomadaire,
  RapportEntretien,
  StatsRapports,
  TicketMaintenance,
  StatsTickets,
  StockArticle,
  MouvementStock,
  HistoriqueEnergie,
  ReservationSalle,
  EvenementCalendrier,
  DemandeRessource,
  InventaireBatiment,
  InventaireSallesType,
  InventaireStocksCategorie,
  CreatePlanningEntretienDto,
  UpdatePlanningEntretienDto,
  CreateRapportEntretienDto,
  UpdateRapportEntretienDto,
  CreateTicketMaintenanceDto,
  UpdateTicketMaintenanceDto,
  CreateStockEntretienDto,
  UpdateStockEntretienDto,
  MouvementStockEntretienDto,
  TraiterReservationDto,
  TraiterDemandeRessourceDto,
} from '../types/entretien.types';

const BASE = '/entretien';

export const entretienApi = {
  // ============================================================================
  // DASHBOARD
  // ============================================================================
  getDashboard: () =>
    api.get<KpiEntretien>(`${BASE}/dashboard`),

  // ============================================================================
  // PLANNING ENTRETIEN
  // ============================================================================
  getPlanning: (params?: { actif?: boolean; type_nettoyage?: string; batiment_id?: string }) =>
    api.get<PlanningEntretien[]>(`${BASE}/planning`, { params }),

  getPlanningHebdomadaire: (semaine?: string) =>
    api.get<PlanningHebdomadaire>(`${BASE}/planning/hebdomadaire`, {
      params: { semaine },
    }),

  createPlanning: (data: CreatePlanningEntretienDto) =>
    api.post<PlanningEntretien>(`${BASE}/planning`, data),

  updatePlanning: (id: string, data: UpdatePlanningEntretienDto) =>
    api.put<PlanningEntretien>(`${BASE}/planning/${id}`, data),

  togglePlanning: (id: string) =>
    api.put<PlanningEntretien>(`${BASE}/planning/${id}/toggle`),

  // ============================================================================
  // RAPPORTS ENTRETIEN
  // ============================================================================
  getRapports: (params?: {
    dateDebut?: string;
    dateFin?: string;
    statut?: string;
    planning_id?: string;
  }) =>
    api.get<RapportEntretien[]>(`${BASE}/rapports`, { params }),

  getRapportsStats: (jours = 30) =>
    api.get<StatsRapports>(`${BASE}/rapports/stats`, { params: { jours } }),

  createRapport: (data: CreateRapportEntretienDto) =>
    api.post<RapportEntretien>(`${BASE}/rapports`, data),

  updateRapport: (id: string, data: UpdateRapportEntretienDto) =>
    api.put<RapportEntretien>(`${BASE}/rapports/${id}`, data),

  // ============================================================================
  // TICKETS MAINTENANCE
  // ============================================================================
  getTickets: (params?: {
    statut?: string;
    priorite?: string;
    type?: string;
    batiment_id?: string;
  }) =>
    api.get<TicketMaintenance[]>(`${BASE}/tickets`, { params }),

  getTicketsUrgents: () =>
    api.get<TicketMaintenance[]>(`${BASE}/tickets/urgents`),

  getTicketsStats: (jours = 30) =>
    api.get<StatsTickets>(`${BASE}/tickets/stats`, { params: { jours } }),

  createTicket: (data: CreateTicketMaintenanceDto) =>
    api.post<TicketMaintenance>(`${BASE}/tickets`, data),

  updateTicket: (id: string, data: UpdateTicketMaintenanceDto) =>
    api.put<TicketMaintenance>(`${BASE}/tickets/${id}`, data),

  // ============================================================================
  // STOCK
  // ============================================================================
  getStock: (params?: { categorie?: string; alerte_only?: boolean }) =>
    api.get<StockArticle[]>(`${BASE}/stock`, { params }),

  getStockAlertes: () =>
    api.get<StockArticle[]>(`${BASE}/stock/alertes`),

  getStockEnergie: () =>
    api.get<{ articles: StockArticle[]; historique: HistoriqueEnergie[] }>(
      `${BASE}/stock/energie`
    ),

  createStock: (data: CreateStockEntretienDto) =>
    api.post<StockArticle>(`${BASE}/stock`, data),

  updateStock: (id: string, data: UpdateStockEntretienDto) =>
    api.put<StockArticle>(`${BASE}/stock/${id}`, data),

  getMouvements: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<{ data: MouvementStock[]; total: number; page: number; limit: number }>(
      `${BASE}/stock/${id}/mouvements`,
      { params }
    ),

  enregistrerMouvement: (id: string, data: MouvementStockEntretienDto) =>
    api.post(`${BASE}/stock/${id}/mouvement`, data),

  // ============================================================================
  // ESPACES (RÉSERVATIONS SALLES)
  // ============================================================================
  getReservations: (params?: {
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
    salle_id?: string;
  }) =>
    api.get<ReservationSalle[]>(`${BASE}/reservations`, { params }),

  getCalendrier: (dateDebut: string, dateFin: string) =>
    api.get<EvenementCalendrier[]>(`${BASE}/reservations/calendrier`, {
      params: { dateDebut, dateFin },
    }),

  approuverReservation: (id: string) =>
    api.put<ReservationSalle>(`${BASE}/reservations/${id}/approuver`),

  refuserReservation: (id: string, data: TraiterReservationDto) =>
    api.put<ReservationSalle>(`${BASE}/reservations/${id}/refuser`, data),

  annulerReservation: (id: string) =>
    api.delete(`${BASE}/reservations/${id}`),

  // ============================================================================
  // DEMANDES RESSOURCES
  // ============================================================================
  getDemandesRessource: (params?: { statut?: string; type_ressource?: string }) =>
    api.get<DemandeRessource[]>(`${BASE}/demandes-ressource`, { params }),

  traiterDemandeRessource: (id: string, data: TraiterDemandeRessourceDto) =>
    api.put<DemandeRessource>(`${BASE}/demandes-ressource/${id}/traiter`, data),

  // ============================================================================
  // INVENTAIRE & STATS
  // ============================================================================
  getInventaireBatiments: () =>
    api.get<InventaireBatiment[]>(`${BASE}/inventaire/batiments`),

  getInventaireSallesParType: () =>
    api.get<InventaireSallesType[]>(`${BASE}/inventaire/salles-par-type`),

  getInventaireStocksParCategorie: () =>
    api.get<InventaireStocksCategorie[]>(`${BASE}/inventaire/stocks-par-categorie`),
};

// Made with Bob
