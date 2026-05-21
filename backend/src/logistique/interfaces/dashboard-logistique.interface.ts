export interface DashboardLogistique {
  // Tickets
  ticketsOuverts: number;
  ticketsUrgents: number;
  ticketsNonAssignes: number;
  ticketsResolusAujourdHui: number;

  // Stock
  articlesEnAlerteCritique: number;
  mouvementsAujourdHui: number;

  // Salles
  sallesDisponibles: number;
  reservationsAujourdHui: number;
  reservationsEnAttente: number;

  // Entretien
  planningsActifs: number;
  rapportsAujourdHui: number;

  // Infrastructure
  totalBatiments: number;
  totalSalles: number;
}

// Made with Bob
