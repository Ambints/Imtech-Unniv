import { apiClient } from '../../../api/client';
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

const BASE = 'logistique';

export const logistiqueApi = {
  // Dashboard
  getDashboard: (): Promise<DashboardLogistique> =>
    apiClient.get(`${BASE}/dashboard`),

  // Bâtiments
  getBatiments: (): Promise<Batiment[]> =>
    apiClient.get(`${BASE}/batiments`),
  
  createBatiment: (data: CreateBatimentDto): Promise<Batiment> =>
    apiClient.post(`${BASE}/batiments`, data),

  // Salles
  getSalles: (params?: { type_salle?: string; disponible?: boolean; batiment_id?: string }): Promise<Salle[]> => {
    const queryParams = new URLSearchParams();
    if (params?.type_salle) queryParams.append('type_salle', params.type_salle);
    if (params?.disponible !== undefined) queryParams.append('disponible', String(params.disponible));
    if (params?.batiment_id) queryParams.append('batiment_id', params.batiment_id);
    const query = queryParams.toString();
    return apiClient.get(`${BASE}/salles${query ? `?${query}` : ''}`);
  },
  
  getSalle: (id: string): Promise<SalleDetail> =>
    apiClient.get(`${BASE}/salles/${id}`),
  
  createSalle: (data: CreateSalleDto): Promise<Salle> =>
    apiClient.post(`${BASE}/salles`, data),
  
  updateSalle: (id: string, data: Partial<CreateSalleDto>): Promise<Salle> =>
    apiClient.put(`${BASE}/salles/${id}`, data),
  
  toggleDisponibilite: (id: string, disponible: boolean) =>
    apiClient.put(`${BASE}/salles/${id}/disponibilite`, { disponible }),

  // Stock
  getStock: (params?: { categorie?: string; en_alerte?: boolean }): Promise<StockArticle[]> => {
    const queryParams = new URLSearchParams();
    if (params?.categorie) queryParams.append('categorie', params.categorie);
    if (params?.en_alerte) queryParams.append('en_alerte', 'true');
    const query = queryParams.toString();
    return apiClient.get(`${BASE}/stock${query ? `?${query}` : ''}`);
  },
  
  getAlertes: (): Promise<StockArticle[]> =>
    apiClient.get(`${BASE}/stock/alertes`),
  
  createArticle: (data: CreateStockDto): Promise<StockArticle> =>
    apiClient.post(`${BASE}/stock`, data),
  
  getMouvements: (id: string, page = 1): Promise<MouvementStock[]> =>
    apiClient.get(`${BASE}/stock/${id}/mouvements?page=${page}`),
  
  enregistrerMouvement: (id: string, data: MouvementStockDto) =>
    apiClient.post(`${BASE}/stock/${id}/mouvement`, data),

  // Tickets
  getTickets: (params?: { statut?: string; priorite?: string; batiment_id?: string }): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.priorite) queryParams.append('priorite', params.priorite);
    if (params?.batiment_id) queryParams.append('batiment_id', params.batiment_id);
    const query = queryParams.toString();
    return apiClient.get(`${BASE}/tickets${query ? `?${query}` : ''}`);
  },
  
  getTicketStats: () =>
    apiClient.get(`${BASE}/tickets/stats`),
  
  createTicket: (data: CreateTicketDto): Promise<Ticket> =>
    apiClient.post(`${BASE}/tickets`, data),
  
  updateTicket: (id: string, data: UpdateTicketDto): Promise<Ticket> =>
    apiClient.put(`${BASE}/tickets/${id}`, data),

  // Planning entretien
  getPlanning: (): Promise<PlanningEntretien[]> =>
    apiClient.get(`${BASE}/planning-entretien`),
  
  createPlanning: (data: CreatePlanningEntretienDto): Promise<PlanningEntretien> =>
    apiClient.post(`${BASE}/planning-entretien`, data),
  
  togglePlanning: (id: string) =>
    apiClient.put(`${BASE}/planning-entretien/${id}/toggle`),

  // Rapports entretien
  getRapports: (params?: { date_debut?: string; date_fin?: string; statut?: string }): Promise<RapportEntretien[]> => {
    const queryParams = new URLSearchParams();
    if (params?.date_debut) queryParams.append('date_debut', params.date_debut);
    if (params?.date_fin) queryParams.append('date_fin', params.date_fin);
    if (params?.statut) queryParams.append('statut', params.statut);
    const query = queryParams.toString();
    return apiClient.get(`${BASE}/rapports-entretien${query ? `?${query}` : ''}`);
  },
  
  createRapport: (data: CreateRapportEntretienDto): Promise<RapportEntretien> =>
    apiClient.post(`${BASE}/rapports-entretien`, data),

  // Réservations
  getReservations: (): Promise<Reservation[]> =>
    apiClient.get(`${BASE}/reservations`),
  
  getCalendrier: (dateDebut: string, dateFin: string): Promise<CalendrierEvent[]> =>
    apiClient.get(`${BASE}/reservations/calendrier?dateDebut=${dateDebut}&dateFin=${dateFin}`),
  
  approuverReservation: (id: string) =>
    apiClient.put(`${BASE}/reservations/${id}/approuver`),
  
  refuserReservation: (id: string) =>
    apiClient.put(`${BASE}/reservations/${id}/refuser`),
  
  annulerReservation: (id: string) =>
    apiClient.delete(`${BASE}/reservations/${id}`),

  // Demandes ressources
  getDemandesRessource: (): Promise<DemandeRessource[]> =>
    apiClient.get(`${BASE}/demandes-ressource`),
  
  traiterDemande: (id: string, data: { statut: string; commentaire_rejet?: string }) =>
    apiClient.put(`${BASE}/demandes-ressource/${id}/traiter`, data),

  // Inventaire
  getInventaireSalles: (): Promise<InventaireSalles[]> =>
    apiClient.get(`${BASE}/inventaire/salles-par-type`),
  
  getInventaireStocks: (): Promise<InventaireStocks[]> =>
    apiClient.get(`${BASE}/inventaire/stocks-par-categorie`),
};

// Made with Bob
