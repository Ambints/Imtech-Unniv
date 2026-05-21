/**
 * React Query hooks pour la gestion de la discipline
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { ArbitrateDisciplinePayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les conseils de discipline en attente
 */
export function useConseilsDisciplineEnAttente() {
  return useQuery({
    queryKey: ['president', 'discipline', 'conseils-en-attente'],
    queryFn: () => presidentApi.getConseilsDisciplineEnAttente(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour arbitrer un conseil de discipline
 */
export function useArbitrerDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArbitrateDisciplinePayload }) => // UUID
      presidentApi.arbitrerDiscipline(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'discipline'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Décision prise avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'arbitrage');
    },
  });
}

// Made with Bob