import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Fonction pour récupérer le token depuis le store ou localStorage
const getToken = (): string | null => {
  // Essayer d'abord le store Zustand
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;
  
  // Fallback: lire directement depuis localStorage
  try {
    const stored = localStorage.getItem('imtech-auth-v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return null;
};

export const api = axios.create({ baseURL: BASE, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log('Interceptor - URL:', config.url, 'Token présent:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header ajouté');
  } else {
    console.warn('Pas de token trouvé!');
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (userId: string) => api.post(`/auth/logout/${userId}`),
  refresh: (userId: string, refreshToken: string) =>
    api.post('/auth/refresh', { userId, refreshToken }),
};

export const tenantsApi = {
  getAll: async () => (await api.get('/tenants')).data,
  getOne: async (id: string) => (await api.get(`/tenants/${id}`)).data,
  getBySlug: async (slug: string) => (await api.get(`/tenants/by-slug/${slug}`)).data,
  create: async (dto: any) => (await api.post('/tenants', dto)).data,
  update: async (id: string, dto: any) => (await api.patch(`/tenants/${id}`, dto)).data,
  delete: async (id: string) => (await api.delete(`/tenants/${id}`)).data,
  getDashboard: async (id: string) => (await api.get(`/tenants/${id}/dashboard`)).data,
  getConfig: async (id: string) => (await api.get(`/tenants/${id}/config`)).data,
  getSubscriptions: async () => (await api.get('/tenants/subscriptions/all')).data,
  updateSubscription: async (id: string, dto: any) => (await api.post(`/tenants/${id}/subscription`, dto)).data,
  removeSubscription: async (id: string) => (await api.delete(`/tenants/${id}/subscription`)).data,
};

export const plansApi = {
  getAll: async () => (await api.get('/plans')).data,
  getOne: async (id: string) => (await api.get(`/plans/${id}`)).data,
  create: async (dto: any) => (await api.post('/plans', dto)).data,
  update: async (id: string, dto: any) => (await api.patch(`/plans/${id}`, dto)).data,
  delete: async (id: string) => (await api.delete(`/plans/${id}`)).data,
};

export const usersApi = {
  getAll: async (tenantId?: string, role?: string, university?: string) => {
    const params = new URLSearchParams();
    if (tenantId) params.append('tenantId', tenantId);
    if (role) params.append('role', role);
    if (university) params.append('university', university);
    return (await api.get(`/users?${params}`)).data;
  },
  getOne: async (id: string) => (await api.get(`/users/${id}`)).data,
  create: async (dto: any) => (await api.post('/users', dto)).data,
  update: async (id: string, dto: any) => (await api.patch(`/users/${id}`, dto)).data,
  remove: async (id: string) => (await api.delete(`/users/${id}`)).data,
};

export const academicApi = {
  // Parcours
  getParcours: (tid: string) => api.get(`/academic/${tid}/parcours`),
  createParcours: (tid: string, dto: any) => api.post(`/academic/${tid}/parcours`, dto),
  updateParcours: (tid: string, id: string, dto: any) => api.patch(`/academic/${tid}/parcours/${id}`, dto),
  deleteParcours: (tid: string, id: string) => api.delete(`/academic/${tid}/parcours/${id}`),
  
  // Départements
  getDepartements: (tid: string) => api.get(`/academic/${tid}/departements`),
  createDepartement: (tid: string, dto: any) => api.post(`/academic/${tid}/departements`, dto),
  
  // UE
  getUE: (tid: string, parcoursId: string) => api.get(`/academic/${tid}/ue?parcoursId=${parcoursId}`),
  createUE: (tid: string, dto: any) => api.post(`/academic/${tid}/ue`, dto),
  updateUE: (tid: string, id: string, dto: any) => api.patch(`/academic/${tid}/ue/${id}`, dto),
  deleteUE: (tid: string, id: string) => api.delete(`/academic/${tid}/ue/${id}`),
  
  // Étudiants
  getEtudiants: (tid: string) => api.get(`/academic/${tid}/etudiants`),
  createEtudiant: (tid: string, dto: any) => api.post(`/academic/${tid}/etudiants`, dto),
  updateEtudiant: (tid: string, id: string, dto: any) => api.patch(`/academic/${tid}/etudiants/${id}`, dto),
  deleteEtudiant: (tid: string, id: string) => api.delete(`/academic/${tid}/etudiants/${id}`),
  
  // Notes
  saisirNote: (tid: string, dto: any) => api.post(`/academic/${tid}/notes`, dto),
  getNotes: (tid: string, etudiantId: string, annee: string) =>
    api.get(`/academic/${tid}/notes/${etudiantId}?annee=${annee}`),
  deliberer: (tid: string, dto: any) => api.post(`/academic/${tid}/deliberation`, dto),
  
  // Inscriptions
  inscrire: (tid: string, dto: any) => api.post(`/academic/${tid}/inscriptions`, dto),
  getInscriptions: (tid: string, parcoursId?: string) =>
    api.get(`/academic/${tid}/inscriptions${parcoursId ? `?parcoursId=${parcoursId}` : ''}`),
  
  // Absences
  saisirAbsence: (tid: string, dto: any) => api.post(`/academic/${tid}/absences`, dto),
  getAbsences: (tid: string, etudiantId: string) => api.get(`/academic/${tid}/absences/${etudiantId}`),
  
  // Salles et EDT
  getSalles: (tid: string) => api.get(`/academic/${tid}/salles`),
  getEDT: (tid: string, parcoursId: string) => api.get(`/academic/${tid}/edt?parcoursId=${parcoursId}`),
};

export const financeApi = {
  // Paiements
  payer: (tid: string, dto: any) => api.post(`/finance/${tid}/paiements`, dto),
  getTousPaiements: (tid: string, date?: string) =>
    api.get(`/finance/${tid}/paiements${date ? `?date=${date}` : ''}`),
  getPaiementsEtudiant: (tid: string, etudiantId: string) =>
    api.get(`/finance/${tid}/paiements/${etudiantId}`),
  
  // Caisse
  getCaisse: (tid: string) => api.get(`/finance/${tid}/caisse`),
  cloturerCaisse: (tid: string, userId: string) =>
    api.post(`/finance/${tid}/caisse/cloturer`, { userId }),
  
  // Budgets
  getBudgets: (tid: string, annee?: string) =>
    api.get(`/finance/${tid}/budgets${annee ? `?annee=${annee}` : ''}`),
  creerBudget: (tid: string, dto: any) => api.post(`/finance/${tid}/budgets`, dto),
  updateBudget: (tid: string, id: string, dto: any) => api.patch(`/finance/${tid}/budgets/${id}`, dto),
  deleteBudget: (tid: string, id: string) => api.delete(`/finance/${tid}/budgets/${id}`),
  
  // Dépenses
  getDepenses: (tid: string, annee?: string) =>
    api.get(`/finance/${tid}/depenses${annee ? `?annee=${annee}` : ''}`),
  ajouterDepense: (tid: string, dto: any) => api.post(`/finance/${tid}/depenses`, dto),
  updateDepense: (tid: string, id: string, dto: any) => api.patch(`/finance/${tid}/depenses/${id}`, dto),
  deleteDepense: (tid: string, id: string) => api.delete(`/finance/${tid}/depenses/${id}`),
  
  // Contrats
  creerContrat: (tid: string, dto: any) => api.post(`/finance/${tid}/contrats`, dto),
  getContrats: (tid: string) => api.get(`/finance/${tid}/contrats`),
  updateContrat: (tid: string, id: string, dto: any) => api.patch(`/finance/${tid}/contrats/${id}`, dto),
  
  // Rapports
  getRapport: (tid: string, annee: string) => api.get(`/finance/${tid}/rapport?annee=${annee}`),
};

export const logisticsApi = {
  createTicket: (tid: string, dto: any) => api.post(`/logistics/${tid}/tickets`, dto),
  getTickets: (tid: string, status?: string) =>
    api.get(`/logistics/${tid}/tickets${status ? `?status=${status}` : ''}`),
  updateTicket: (tid: string, id: string, dto: any) =>
    api.patch(`/logistics/${tid}/tickets/${id}`, dto),
  getStocks: (tid: string) => api.get(`/logistics/${tid}/stocks`),
  getAlertes: (tid: string) => api.get(`/logistics/${tid}/stocks/alertes`),
  createStock: (tid: string, dto: any) => api.post(`/logistics/${tid}/stocks`, dto),
  getReservations: (tid: string) => api.get(`/logistics/${tid}/reservations`),
  reserver: (tid: string, dto: any) => api.post(`/logistics/${tid}/reservations`, dto),
  getPlanning: (tid: string) => api.get(`/logistics/${tid}/planning-nettoyage`),
};
