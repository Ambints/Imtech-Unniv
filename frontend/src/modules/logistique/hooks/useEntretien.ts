import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';
import type { CreatePlanningEntretienDto, CreateRapportEntretienDto } from '../types/logistique.types';

export function usePlanning() {
  return useQuery({
    queryKey: ['logistique', 'planning-entretien'],
    queryFn: () => logistiqueApi.getPlanning(),
  });
}

export function useCreatePlanning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanningEntretienDto) => logistiqueApi.createPlanning(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'planning-entretien'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useTogglePlanning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logistiqueApi.togglePlanning(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'planning-entretien'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useRapports(params?: { date_debut?: string; date_fin?: string; statut?: string }) {
  return useQuery({
    queryKey: ['logistique', 'rapports-entretien', params],
    queryFn: () => logistiqueApi.getRapports(params),
  });
}

export function useCreateRapport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRapportEntretienDto) => logistiqueApi.createRapport(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'rapports-entretien'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob
