/**
 * React Query hooks pour le dashboard KPI du président
 */

import { useQuery } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';

/**
 * Hook pour récupérer le dashboard KPI
 * Rafraîchissement automatique désactivé pour éviter les requêtes répétées en cas d'erreur
 */
export function useKpiDashboard(anneeId: string) { // UUID
  return useQuery({
    queryKey: ['president', 'kpi', anneeId],
    queryFn: () => presidentApi.getKpiDashboard(anneeId),
    refetchInterval: false, // Désactivé temporairement
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!anneeId,
    retry: 1, // Réessayer seulement 1 fois
    retryDelay: 1000, // Attendre 1 seconde avant de réessayer
  });
}

/**
 * Hook pour récupérer le résumé des directions
 */
export function useDirectionsSummary(anneeId: string) { // UUID
  return useQuery({
    queryKey: ['president', 'directions', anneeId],
    queryFn: () => presidentApi.getDirectionsSummary(anneeId),
    refetchInterval: false, // Désactivé temporairement
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!anneeId,
    retry: 1,
    retryDelay: 1000,
  });
}

/**
 * Hook pour récupérer l'historique des actions
 */
export function useAuditTrail(limit: number = 10) {
  return useQuery({
    queryKey: ['president', 'audit-trail', limit],
    queryFn: () => presidentApi.getAuditTrail(limit),
    refetchInterval: false, // Désactivé temporairement
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
}

// Made with Bob