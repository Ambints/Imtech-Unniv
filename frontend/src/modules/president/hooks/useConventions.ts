/**
 * React Query hooks pour la gestion des conventions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { SignConventionPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les conventions en attente
 */
export function useConventionsEnAttente() {
  return useQuery({
    queryKey: ['president', 'conventions', 'en-attente'],
    queryFn: () => presidentApi.getConventionsEnAttente(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour signer une convention
 */
export function useSignerConvention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignConventionPayload }) => // UUID
      presidentApi.signerConvention(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'conventions'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      
      toast.success(response.message || 'Convention signée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la signature de la convention');
    },
  });
}

// Made with Bob