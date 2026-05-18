/**
 * React Query hooks pour la gestion des parcours
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { ValidateParcoursPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer la liste des parcours
 */
export function useParcoursList() {
  return useQuery({
    queryKey: ['president', 'parcours', 'liste'],
    queryFn: () => presidentApi.getParcoursList(),
    staleTime: 60_000,
  });
}

/**
 * Hook pour ouvrir un parcours
 */
export function useOuvrirParcours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateParcoursPayload }) => // UUID
      presidentApi.ouvrirParcours(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'parcours'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Parcours ouvert avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ouverture du parcours');
    },
  });
}

/**
 * Hook pour fermer un parcours
 */
export function useFermerParcours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateParcoursPayload }) => // UUID
      presidentApi.fermerParcours(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'parcours'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Parcours fermé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la fermeture du parcours');
    },
  });
}

// Made with Bob