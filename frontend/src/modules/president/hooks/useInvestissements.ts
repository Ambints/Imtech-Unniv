/**
 * React Query hooks pour la gestion des investissements
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { ValidateInvestmentPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les investissements en attente
 */
export function useInvestissementsEnAttente() {
  return useQuery({
    queryKey: ['president', 'investissements', 'en-attente'],
    queryFn: () => presidentApi.getInvestissementsEnAttente(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour valider un investissement
 */
export function useValiderInvestissement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateInvestmentPayload }) => // UUID
      presidentApi.validerInvestissement(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'investissements'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Investissement traité avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du traitement de l\'investissement');
    },
  });
}

// Made with Bob