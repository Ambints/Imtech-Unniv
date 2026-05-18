import axios from 'axios';
import toast from 'react-hot-toast';
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

// Fonction pour récupérer le tenant ID depuis le store ou localStorage
const getTenantId = (): string | null => {
  // Essayer d'abord le store Zustand
  const state = useAuthStore.getState();
  const tenant = state.tenant;

  if (tenant?.id) {
    console.log('✅ Tenant ID trouvé dans le store:', tenant.id);
    return tenant.id;
  }

  // Fallback: lire directement depuis localStorage
  try {
    const stored = localStorage.getItem('imtech-auth-v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      const tenantId = parsed?.state?.tenant?.id;
      if (tenantId && typeof tenantId === 'string' && tenantId.length > 0) {
        console.log('✅ Tenant ID trouvé dans localStorage:', tenantId);
        return tenantId;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du tenant depuis localStorage:', error);
  }

  // Dernier recours: essayer de récupérer depuis l'user.tenantId
  try {
    const user = state.user;
    if (user && 'tenantId' in user && user.tenantId) {
      const tenantId = user.tenantId as string;
      if (tenantId.length > 0) {
        console.log('✅ Tenant ID trouvé dans user.tenantId:', tenantId);
        return tenantId;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du tenantId depuis user:', error);
  }

  console.warn('⚠️ Aucun Tenant ID trouvé nulle part');
  return null;
};

export const api = axios.create({ baseURL: BASE, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  const tenantId = getTenantId();
  
  // Récupérer le rôle de l'utilisateur
  const state = useAuthStore.getState();
  const userRole = state.user?.role;

  console.log('🔍 Interceptor - URL:', config.url, 'Token présent:', !!token, 'Tenant ID:', tenantId, 'Role:', userRole);

  // Requêtes d'authentification qui ne nécessitent pas de token ni de tenant
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

  if (isPublicRoute) {
    console.log('✅ Route publique, pas besoin de token/tenant');
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header ajouté');
  } else {
    console.warn('⚠️ Pas de token trouvé!');
  }

  // Super Admin n'a pas besoin de tenant ID - il gère tous les tenants
  if (userRole === 'super_admin') {
    console.log('✅ Super Admin - pas besoin de X-Tenant-Id');
    return config;
  }

  // Mode mono-schéma: le backend peut ignorer les tenants (DEFAULT_TENANT_SCHEMA).
  // On envoie X-Tenant-ID seulement si on l'a, sans bloquer la requête.
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
    console.log('✅ X-Tenant-ID header ajouté:', tenantId);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const state = useAuthStore.getState();
    const userRole = state.user?.role;

    // Erreur 401: Session expirée
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Erreur 404 avec // dans l'URL = tenant ID manquant (sauf pour super_admin)
    if (error.response?.status === 404 && error.config?.url?.includes('//')) {
      if (userRole !== 'super_admin') {
        console.error('❌ Erreur 404: URL malformée (tenant ID manquant). Redirection vers login...');
        toast.error('Session invalide. Veuillez vous reconnecter.');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Erreur 400 avec tenant schema - sauf pour super_admin
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Tenant schema not set')) {
      if (userRole !== 'super_admin') {
        console.error('❌ Erreur: Tenant ID manquant. Veuillez vous reconnecter.');
        toast.error('Session invalide. Veuillez vous reconnecter.');
      }
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

export const secretaireApi = {
  // Assignation secrétaire à un parcours
  assignSecretaire: (tid: string, parcoursId: string, secretaireId: string) =>
    api.post(`/secretaire/${tid}/parcours/${parcoursId}/assigner-secretaire`, { secretaireId }),
  // Retirer un secrétaire d'un parcours
  removeSecretaire: (tid: string, parcoursId: string, secretaireId: string) =>
    api.delete(`/secretaire/${tid}/parcours/${parcoursId}/retirer-secretaire`, { data: { secretaireId } }),
  // Récupérer les parcours d'un secrétaire
  getParcoursBySecretaire: (tid: string, secretaireId: string) =>
    api.get(`/secretaire/${tid}/secretaires/${secretaireId}/parcours`),
  // Récupérer tous les parcours avec leurs secrétaires (admin)
  getAllParcoursWithSecretaires: (tid: string) =>
    api.get(`/secretaire/${tid}/parcours-secretaires`),
};

export const financeApi = {
  // Paiements
  payer: (tid: string, dto: any) => api.post(`/finance/paiements`, dto),
  getTousPaiements: (tid: string, date?: string) =>
    api.get(`/finance/paiements${date ? `?date=${date}` : ''}`),
  getPaiementsEtudiant: (tid: string, etudiantId: string) =>
    api.get(`/finance/paiements/${etudiantId}`),
  
  // Caisse
  getCaisse: (tid: string) => api.get(`/finance/caisse`),
  cloturerCaisse: (tid: string, userId: string) =>
    api.post(`/finance/caisse/cloturer`, { userId }),
  
  // Budgets
  getBudgets: (tid: string, annee?: string) =>
    api.get(`/finance/budgets${annee ? `?annee=${annee}` : ''}`),
  creerBudget: (tid: string, dto: any) => api.post(`/finance/budgets`, dto),
  updateBudget: (tid: string, id: string, dto: any) => api.patch(`/finance/budgets/${id}`, dto),
  deleteBudget: (tid: string, id: string) => api.delete(`/finance/budgets/${id}`),
  
  // Dépenses
  getDepenses: (tid: string, annee?: string) =>
    api.get(`/finance/depenses${annee ? `?annee=${annee}` : ''}`),
  ajouterDepense: (tid: string, dto: any) => api.post(`/finance/depenses`, dto),
  updateDepense: (tid: string, id: string, dto: any) => api.patch(`/finance/depenses/${id}`, dto),
  deleteDepense: (tid: string, id: string) => api.delete(`/finance/depenses/${id}`),
  
  // Contrats
  creerContrat: (tid: string, dto: any) => api.post(`/finance/contrats`, dto),
  getContrats: (tid: string) => api.get(`/finance/contrats`),
  updateContrat: (tid: string, id: string, dto: any) => api.patch(`/finance/contrats/${id}`, dto),
  
  // Échéanciers
  getEcheanciers: (tid: string, inscriptionId?: string) =>
    api.get(`/finance/${tid}/echeanciers${inscriptionId ? `?inscriptionId=${inscriptionId}` : ''}`),
  creerEcheancier: (tid: string, dto: any) => api.post(`/finance/${tid}/echeanciers`, dto),
  getInscriptionsActives: (tid: string) => api.get(`/finance/${tid}/inscriptions-actives`),
  
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

export const rpApi = {
  // Mes parcours
  getMesParcours: (tid: string) => api.get(`/rp-enhanced/${tid}/mes-parcours`),

  // Maquettes
  getAllMaquettes: (tid: string) => api.get(`/rp-enhanced/${tid}/maquettes`),
  getMaquetteById: (tid: string, parcoursId: string) => api.get(`/rp-enhanced/${tid}/maquettes/${parcoursId}`),
  createMaquette: (tid: string, dto: any) => api.post(`/rp-enhanced/${tid}/maquettes`, dto),
  updateMaquette: (tid: string, parcoursId: string, dto: any) => api.patch(`/rp-enhanced/${tid}/maquettes/${parcoursId}`, dto),
  deleteMaquette: (tid: string, parcoursId: string) => api.delete(`/rp-enhanced/${tid}/maquettes/${parcoursId}`),
  validerMaquette: (tid: string, parcoursId: string) => api.post(`/rp-enhanced/${tid}/maquettes/${parcoursId}/valider`),

  // UE
  createUE: (tid: string, parcoursId: string, dto: any) => api.post(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues`, dto),
  updateUE: (tid: string, parcoursId: string, ueId: string, dto: any) => api.patch(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues/${ueId}`, dto),
  deleteUE: (tid: string, parcoursId: string, ueId: string) => api.delete(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues/${ueId}`),

  // EC
  createEC: (tid: string, parcoursId: string, ueId: string, dto: any) => api.post(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues/${ueId}/ecs`, dto),
  updateEC: (tid: string, parcoursId: string, ueId: string, ecId: string, dto: any) => api.patch(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues/${ueId}/ecs/${ecId}`, dto),
  deleteEC: (tid: string, parcoursId: string, ueId: string, ecId: string) => api.delete(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues/${ueId}/ecs/${ecId}`),

  // Affectations
  getAffectations: (tid: string, filters?: { anneeAcademiqueId?: string; ueId?: string; ecId?: string; enseignantId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.anneeAcademiqueId) params.append('anneeAcademiqueId', filters.anneeAcademiqueId);
    if (filters?.ueId) params.append('ueId', filters.ueId);
    if (filters?.ecId) params.append('ecId', filters.ecId);
    if (filters?.enseignantId) params.append('enseignantId', filters.enseignantId);
    return api.get(`/rp-enhanced/${tid}/affectations?${params}`);
  },
  getAffectationsByParcours: (tid: string, parcoursId: string, anneeAcademiqueId?: string) =>
    api.get(`/rp-enhanced/${tid}/parcours/${parcoursId}/affectations${anneeAcademiqueId ? `?anneeAcademiqueId=${anneeAcademiqueId}` : ''}`),
  createAffectation: (tid: string, dto: any) => api.post(`/rp-enhanced/${tid}/affectations`, dto),
  updateAffectation: (tid: string, affectationId: string, dto: any) => api.patch(`/rp-enhanced/${tid}/affectations/${affectationId}`, dto),
  deleteAffectation: (tid: string, affectationId: string) => api.delete(`/rp-enhanced/${tid}/affectations/${affectationId}`),

  // Performance
  getPerformanceStats: (tid: string, parcoursId: string, anneeAcademiqueId: string) =>
    api.get(`/rp-enhanced/${tid}/parcours/${parcoursId}/performance?anneeAcademiqueId=${anneeAcademiqueId}`),
};

// Helper simplifié pour les appels API directs
export const apiClient = {
  get: async (url: string) => {
    const response = await api.get(url);
    return response.data;
  },
  post: async (url: string, data?: any) => {
    const response = await api.post(url, data);
    return response.data;
  },
  patch: async (url: string, data?: any) => {
    const response = await api.patch(url, data);
    return response.data;
  },
  put: async (url: string, data?: any) => {
    const response = await api.put(url, data);
    return response.data;
  },
  delete: async (url: string) => {
    const response = await api.delete(url);
    return response.data;
  },
  getPerformanceDashboard: (tid: string, parcoursId: string, anneeAcademiqueId: string) =>
    api.get(`/rp-enhanced/${tid}/parcours/${parcoursId}/dashboard-performance?anneeAcademiqueId=${anneeAcademiqueId}`),
  getSuiviAssiduite: (tid: string, parcoursId: string, anneeAcademiqueId: string) =>
    api.get(`/rp-enhanced/${tid}/parcours/${parcoursId}/assiduite?anneeAcademiqueId=${anneeAcademiqueId}`),
};
