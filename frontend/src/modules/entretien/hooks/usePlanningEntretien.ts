import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { CreatePlanningEntretienDto, UpdatePlanningEntretienDto } from '../types/entretien.types';

export function usePlanning(filters?: { actif?: boolean; type_nettoyage?: string; batiment_id?: string }) {
  return useQuery({
    queryKey: ['entretien', 'planning', filters],
    queryFn: () => entretienApi.getPlanning(filters).then(r => r.data),
  });
}

export function usePlanningHebdomadaire(semaine?: string) {
  return useQuery({
    queryKey: ['entretien', 'planning', 'hebdomadaire', semaine],
    queryFn: () => entretienApi.getPlanningHebdomadaire(semaine).then(r => r.data),
  });
}

export function useCreatePlanning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanningEntretienDto) => entretienApi.createPlanning(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'planning'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

export function useUpdatePlanning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanningEntretienDto }) =>
      entretienApi.updatePlanning(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'planning'] });
    },
  });
}

export function useTogglePlanning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entretienApi.togglePlanning(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'planning'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

// Made with Bob
