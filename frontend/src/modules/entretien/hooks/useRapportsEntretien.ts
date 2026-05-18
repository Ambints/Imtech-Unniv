import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { CreateRapportEntretienDto, UpdateRapportEntretienDto } from '../types/entretien.types';

export function useRapports(filters?: {
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  planning_id?: string;
}) {
  return useQuery({
    queryKey: ['entretien', 'rapports', filters],
    queryFn: () => entretienApi.getRapports(filters).then(r => r.data),
  });
}

export function useRapportsStats(jours: number = 30) {
  return useQuery({
    queryKey: ['entretien', 'rapports', 'stats', jours],
    queryFn: () => entretienApi.getRapportsStats(jours).then(r => r.data),
  });
}

export function useCreateRapport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRapportEntretienDto) => entretienApi.createRapport(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'rapports'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

export function useUpdateRapport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRapportEntretienDto }) =>
      entretienApi.updateRapport(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'rapports'] });
    },
  });
}

// Made with Bob
