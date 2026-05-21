import axios from 'axios';
import type {
  DashboardLogistique,
  Batiment,
  Salle,
  SalleDetail,
  StockArticle,
  MouvementStock,
  Ticket,
  PlanningEntretien,
  RapportEntretien,
  Reservation,
  CreateTicketDto,
  UpdateTicketDto,
  CreateStockDto,
  MouvementStockDto,
  CreatePlanningEntretienDto,
  CreateRapportEntretienDto,
  CreateBatimentDto,
  CreateSalleDto,
  InventaireSalles,
  InventaireStocks,
  DemandeRessource,
  CalendrierEvent,
} from '../types/logistique.types';

const BASE = '/api/v1/logistique';

export const logistiqueApi = {
  // Dashboard
  getDashboard: () =>
    axios.get<DashboardLogistique>(`${BASE}/dashboard`).then(r => r.data),

  // Bâtiments
  getBatiments: () =>
    axios.get<Batiment[]>(`${BASE}/batiments`).then(r => r.data),
  
  createBatiment: (data: CreateBatimentDto) =>
    axios.post<Batiment>(`${BASE}/batiments`, data).then(r => r.data),

  // Salles
  getSalles: (params?: { type_salle?: string; disponible?: boolean; batiment_id?: string }) =>
    axios.get<Salle[]>(`${BASE}/salles`, { params }).then(r => r.data),
  
  getSalle: (id: string) =>
    axios.get<SalleDetail>(`${BASE}/salles/${id}`).then(r => r.data),
  
  createSalle: (data: CreateSalleDto) =>
    axios.post<Salle>(`${BASE}/salles`, data).then(r => r.data),
  
  updateSalle: (id: string, data: Partial<CreateSalleDto>) =>
    axios.put<Salle>(`${BASE}/salles/${id}`, data).then(r => r.data),
  
  toggleDisponibilite: (id: string, disponible: boolean) =>
    axios.put(`${BASE}/salles/${id}/disponibilite`, { disponible }).then(r => r.data),

  // Stock
  getStock: (params?: { categorie?: string; en_alerte?: boolean }) =>
    axios.get<StockArticle[]>(`${BASE}/stock`, { params }).then(r => r.data),
  
  getAlertes: () =>
    axios.get<StockArticle[]>(`${BASE}/stock/alertes`).then(r => r.data),
  
  createArticle: (data: CreateStockDto) =>
    axios.post<StockArticle>(`${BASE}/stock`, data).then(r => r.data),
  
  getMouvements: (id: string, page = 1) =>
    axios.get<MouvementStock[]>(`${BASE}/stock/${id}/mouvements`, { params: { page } }).then(r => r.data),
  
  enregistrerMouvement: (id: string, data: MouvementStockDto) =>
    axios.post(`${BASE}/stock/${id}/mouvement`, data).then(r => r.data),

  // Tickets
  getTickets: (params?: { statut?: string; priorite?: string; batiment_id?: string }) =>
    axios.get<Ticket[]>(`${BASE}/tickets`, { params }).then(r => r.data),
  
  getTicketStats: () =>
    axios.get(`${BASE}/tickets/stats`).then(r => r.data),
  
  createTicket: (data: CreateTicketDto) =>
    axios.post<Ticket>(`${BASE}/tickets`, data).then(r => r.data),
  
  updateTicket: (id: string, data: UpdateTicketDto) =>
    axios.put<Ticket>(`${BASE}/tickets/${id}`, data).then(r => r.data),

  // Planning entretien
  getPlanning: () =>
    axios.get<PlanningEntretien[]>(`${BASE}/planning-entretien`).then(r => r.data),
  
  createPlanning: (data: CreatePlanningEntretienDto) =>
    axios.post<PlanningEntretien>(`${BASE}/planning-entretien`, data).then(r => r.data),
  
  togglePlanning: (id: string) =>
    axios.put(`${BASE}/planning-entretien/${id}/toggle`).then(r => r.data),

  // Rapports entretien
  getRapports: (params?: { date_debut?: string; date_fin?: string; statut?: string }) =>
    axios.get<RapportEntretien[]>(`${BASE}/rapports-entretien`, { params }).then(r => r.data),
  
  createRapport: (data: CreateRapportEntretienDto) =>
    axios.post<RapportEntretien>(`${BASE}/rapports-entretien`, data).then(r => r.data),

  // Réservations
  getReservations: () =>
    axios.get<Reservation[]>(`${BASE}/reservations`).then(r => r.data),
  
  getCalendrier: (dateDebut: string, dateFin: string) =>
    axios.get<CalendrierEvent[]>(`${BASE}/reservations/calendrier`, { params: { dateDebut, dateFin } }).then(r => r.data),
  
  approuverReservation: (id: string) =>
    axios.put(`${BASE}/reservations/${id}/approuver`).then(r => r.data),
  
  refuserReservation: (id: string) =>
    axios.put(`${BASE}/reservations/${id}/refuser`).then(r => r.data),
  
  annulerReservation: (id: string) =>
    axios.delete(`${BASE}/reservations/${id}`).then(r => r.data),

  // Demandes ressources
  getDemandesRessource: () =>
    axios.get<DemandeRessource[]>(`${BASE}/demandes-ressource`).then(r => r.data),
  
  traiterDemande: (id: string, data: { statut: string; commentaire_rejet?: string }) =>
    axios.put(`${BASE}/demandes-ressource/${id}/traiter`, data).then(r => r.data),

  // Inventaire
  getInventaireSalles: () =>
    axios.get<InventaireSalles[]>(`${BASE}/inventaire/salles-par-type`).then(r => r.data),
  
  getInventaireStocks: () =>
    axios.get<InventaireStocks[]>(`${BASE}/inventaire/stocks-par-categorie`).then(r => r.data),
};

// Made with Bob
