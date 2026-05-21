/**
 * React Query hooks pour la gestion des diplômes
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { SignDiplomaPayload, SignDiplomasInBulkPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer les diplômes à signer
 */
export function useDiplomesASigner() {
  return useQuery({
    queryKey: ['president', 'diplomes', 'a-signer'],
    queryFn: () => presidentApi.getDiplomesASigner(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour signer un diplôme
 */
export function useSignerDiplome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignDiplomaPayload }) => // UUID
      presidentApi.signerDiplome(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'diplomes'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      toast.success(response.message || 'Diplôme signé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la signature du diplôme');
    },
  });
}

/**
 * Hook pour signer plusieurs diplômes en masse
 */
export function useSignerDiplomesEnMasse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignDiplomasInBulkPayload) =>
      presidentApi.signerDiplomesEnMasse(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'diplomes'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'directions'] });
      
      const message = response.signedCount 
        ? `${response.signedCount} diplôme(s) signé(s) avec succès${response.skippedCount ? `, ${response.skippedCount} ignoré(s)` : ''}`
        : response.message || 'Diplômes signés avec succès';
      
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la signature en masse');
    },
  });
}

// Made with Bob