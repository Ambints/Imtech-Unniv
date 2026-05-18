/**
 * React Query hooks pour la gestion du calendrier académique
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presidentApi } from '../api/president.api';
import type { ValidateCalendarPayload } from '../types/president.types';
import toast from 'react-hot-toast';

/**
 * Hook pour récupérer le calendrier en attente de validation
 */
export function useCalendrierEnAttente() {
  return useQuery({
    queryKey: ['president', 'calendrier', 'en-attente'],
    queryFn: () => presidentApi.getCalendrierEnAttente(),
    staleTime: 30_000,
  });
}

/**
 * Hook pour valider le calendrier
 */
export function useValiderCalendrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateCalendarPayload }) => // UUID
      presidentApi.validerCalendrier(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'calendrier'] });
      queryClient.invalidateQueries({ queryKey: ['president', 'kpi'] });
      
      toast.success(response.message || 'Calendrier validé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du calendrier');
    },
  });
}

/**
 * Hook pour modifier un événement du calendrier
 */
export function useModifierCalendrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidateCalendarPayload }) => // UUID
      presidentApi.modifierCalendrier(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['president', 'calendrier'] });
      
      toast.success(response.message || 'Calendrier modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du calendrier');
    },
  });
}

// Made with Bob