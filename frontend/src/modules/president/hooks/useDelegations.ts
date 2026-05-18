/**
 * React Query hooks pour la gestion des délégations de signature
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { DelegateSignaturePayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les délégations
 */
export function useDelegations() {
  return useQuery({
    queryKey: ['president', 'delegations'],
    queryFn: () => presidentApi.getDelegations(),
    staleTime: 60_000,
  });
}

/**
 * Hook pour créer une délégation
 */
export function useCreerDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DelegateSignaturePayload) =>
      presidentApi.creerDelegation(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'delegations'] });
      
      toast.success(response.message || 'Délégation créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la délégation');
    },
  });
}

/**
 * Hook pour révoquer une délégation
 */
export function useRevoquerDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => // UUID
      presidentApi.revoquerDelegation(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'delegations'] });
      
      toast.success(response.message || 'Délégation révoquée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la révocation de la délégation');
    },
  });
}

// Made with Bob