import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';
import type { CreateSalleDto } from '../types/logistique.types';

export function useBatiments() {
  return useQuery({
    queryKey: ['logistique', 'batiments'],
    queryFn: () => logistiqueApi.getBatiments(),
  });
}

export function useSalles(params?: { type_salle?: string; disponible?: boolean; batiment_id?: string }) {
  return useQuery({
    queryKey: ['logistique', 'salles', params],
    queryFn: () => logistiqueApi.getSalles(params),
  });
}

export function useSalle(id: string) {
  return useQuery({
    queryKey: ['logistique', 'salles', id],
    queryFn: () => logistiqueApi.getSalle(id),
    enabled: !!id,
  });
}

export function useCreateSalle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalleDto) => logistiqueApi.createSalle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'salles'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useUpdateSalle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSalleDto> }) =>
      logistiqueApi.updateSalle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'salles'] });
    },
  });
}

export function useToggleDisponibilite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) =>
      logistiqueApi.toggleDisponibilite(id, disponible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'salles'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob
