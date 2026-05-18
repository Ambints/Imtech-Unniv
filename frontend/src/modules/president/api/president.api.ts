/**
 * API Client pour le module Président
 * Toutes les fonctions de communication avec le backend
 */

import axios from 'axios';
import type {
  KpiDashboard,
  DirectionSummary,
  AuditAction,
  RecrutementEnAttente,
  ValidateRecruitmentPayload,
  InvestissementEnAttente,
  ValidateInvestmentPayload,
  DiplomeASigner,
  SignDiplomaPayload,
  SignDiplomasInBulkPayload,
  ConventionEnAttente,
  SignConventionPayload,
  ConseilDiscipline,
  ArbitrateDisciplinePayload,
  Parcours,
  ValidateParcoursPayload,
  EvenementCalendrier,
  ValidateCalendarPayload,
  Delegation,
  DelegateSignaturePayload,
  ApiResponse,
  SignatureResponse
} from '../types/president.types';

// Configuration de base axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour récupérer le token depuis localStorage
const getToken = (): string | null => {
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

// Fonction pour récupérer le tenant ID depuis localStorage
const getTenantId = (): string | null => {
  try {
    const stored = localStorage.getItem('imtech-auth-v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      const tenantId = parsed?.state?.tenant?.id;
      if (tenantId && typeof tenantId === 'string' && tenantId.length > 0) {
        return tenantId;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du tenant depuis localStorage:', error);
  }
  return null;
};

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = getToken();
  const tenantId = getTenantId();
  
  console.log('🔍 [President API] Request:', config.url, 'Token:', !!token, 'Tenant ID:', tenantId);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const BASE = '/president';

// ========== DASHBOARD ==========

export const presidentApi = {
  /**
   * Récupère le dashboard KPI complet
   */
  getKpiDashboard: async (anneeId: string) => { // UUID
    console.log('[presidentApi.getKpiDashboard] Sending anneeId:', anneeId, '| type:', typeof anneeId);
    try {
      const response = await api.get<KpiDashboard>(`${BASE}/dashboard/kpi`, { params: { anneeId } });
      console.log('[presidentApi.getKpiDashboard] Success:', response.status);
      return response.data;
    } catch (err: any) {
      console.error('[presidentApi.getKpiDashboard] Error:', err.response?.status);
      console.error('[presidentApi.getKpiDashboard] Error body:', JSON.stringify(err.response?.data, null, 2));
      throw err;
    }
  },

  /**
   * Récupère le résumé des directions
   */
  getDirectionsSummary: (anneeId: string) => // UUID
    api.get<DirectionSummary>(`${BASE}/directions/summary`, { params: { anneeId } })
      .then(res => res.data),

  /**
   * Récupère l'historique des actions
   */
  getAuditTrail: (limit: number = 10) =>
    api.get<AuditAction[]>(`${BASE}/audit-trail`, { params: { limit } })
      .then(res => res.data),

  // ========== RECRUTEMENTS ==========

  /**
   * Liste des recrutements en attente
   */
  getRecrutementsEnAttente: () =>
    api.get<RecrutementEnAttente[]>(`${BASE}/recrutements/en-attente`)
      .then(res => res.data),

  /**
   * Valide un recrutement
   */
  validerRecrutement: (id: string, data: ValidateRecruitmentPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/recrutements/${id}/valider`, data)
      .then(res => res.data),

  /**
   * Rejette un recrutement
   */
  rejeterRecrutement: (id: string, data: ValidateRecruitmentPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/recrutements/${id}/rejeter`, data)
      .then(res => res.data),

  // ========== INVESTISSEMENTS ==========

  /**
   * Liste des investissements en attente
   */
  getInvestissementsEnAttente: () =>
    api.get<InvestissementEnAttente[]>(`${BASE}/investissements/en-attente`)
      .then(res => res.data),

  /**
   * Valide un investissement
   */
  validerInvestissement: (id: string, data: ValidateInvestmentPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/investissements/${id}/valider`, data)
      .then(res => res.data),

  // ========== DIPLOMES ==========

  /**
   * Liste des diplômes à signer
   */
  getDiplomesASigner: () =>
    api.get<DiplomeASigner[]>(`${BASE}/diplomes/a-signer`)
      .then(res => res.data),

  /**
   * Signe un diplôme
   */
  signerDiplome: (id: string, data: SignDiplomaPayload) => // UUID
    api.post<SignatureResponse>(`${BASE}/diplomes/${id}/signer`, data)
      .then(res => res.data),

  /**
   * Signe plusieurs diplômes en masse
   */
  signerDiplomesEnMasse: (data: SignDiplomasInBulkPayload) =>
    api.post<SignatureResponse>(`${BASE}/diplomes/signer-en-masse`, data)
      .then(res => res.data),

  // ========== CONVENTIONS ==========

  /**
   * Liste des conventions en attente
   */
  getConventionsEnAttente: () =>
    api.get<ConventionEnAttente[]>(`${BASE}/conventions/en-attente`)
      .then(res => res.data),

  /**
   * Signe une convention
   */
  signerConvention: (id: string, data: SignConventionPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/conventions/${id}/signer`, data)
      .then(res => res.data),

  // ========== DISCIPLINE ==========

  /**
   * Liste des conseils de discipline en attente
   */
  getConseilsDisciplineEnAttente: () =>
    api.get<ConseilDiscipline[]>(`${BASE}/discipline/conseils-en-attente`)
      .then(res => res.data),

  /**
   * Arbitre un conseil de discipline
   */
  arbitrerDiscipline: (id: string, data: ArbitrateDisciplinePayload) => // UUID
    api.post<ApiResponse>(`${BASE}/discipline/${id}/arbitrer`, data)
      .then(res => res.data),

  // ========== PARCOURS ==========

  /**
   * Liste de tous les parcours
   */
  getParcoursList: () =>
    api.get<Parcours[]>(`${BASE}/parcours/liste`)
      .then(res => res.data),

  /**
   * Ouvre un parcours
   */
  ouvrirParcours: (id: string, data: ValidateParcoursPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/parcours/${id}/ouvrir`, data)
      .then(res => res.data),

  /**
   * Ferme un parcours
   */
  fermerParcours: (id: string, data: ValidateParcoursPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/parcours/${id}/fermer`, data)
      .then(res => res.data),

  // ========== CALENDRIER ACADEMIQUE ==========

  /**
   * Calendrier en attente de validation
   */
  getCalendrierEnAttente: () =>
    api.get<EvenementCalendrier[]>(`${BASE}/calendrier/en-attente`)
      .then(res => res.data),

  /**
   * Valide le calendrier
   */
  validerCalendrier: (id: string, data: ValidateCalendarPayload) => // UUID
    api.post<ApiResponse>(`${BASE}/calendrier/${id}/valider`, data)
      .then(res => res.data),

  /**
   * Modifie un événement du calendrier
   */
  modifierCalendrier: (id: string, data: ValidateCalendarPayload) => // UUID
    api.put<ApiResponse>(`${BASE}/calendrier/${id}/modifier`, data)
      .then(res => res.data),

  // ========== DELEGATIONS ==========

  /**
   * Liste des délégations
   */
  getDelegations: () =>
    api.get<Delegation[]>(`${BASE}/delegations`)
      .then(res => res.data),

  /**
   * Crée une délégation
   */
  creerDelegation: (data: DelegateSignaturePayload) =>
    api.post<ApiResponse>(`${BASE}/delegations/creer`, data)
      .then(res => res.data),

  /**
   * Révoque une délégation
   */
  revoquerDelegation: (id: string) => // UUID
    api.put<ApiResponse>(`${BASE}/delegations/${id}/revoquer`)
      .then(res => res.data),
};

export default presidentApi;

// Made with Bob
