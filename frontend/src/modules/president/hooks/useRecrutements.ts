/**
 * React Query hooks pour la gestion des recrutements
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { ValidateRecruitmentPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les recrutements en attente
 */
export function useRecrutementsEnAttente() {
  return useQuery({
    queryKey: ['president', 'recrutements', 'en-attente'],
    queryFn: () => presidentApi.getRecrutementsEnAttente(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour valider un recrutement
 */
export function useValiderRecrutement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateRecruitmentPayload }) => // UUID
      presidentApi.validerRecrutement(id, data),
    onSuccess: (response) => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['president', 'recrutements'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Recrutement validé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du recrutement');
    },
  });
}

/**
 * Hook pour rejeter un recrutement
 */
export function useRejeterRecrutement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateRecruitmentPayload }) => // UUID
      presidentApi.rejeterRecrutement(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'recrutements'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Recrutement rejeté');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet du recrutement');
    },
  });
}

// Made with Bob