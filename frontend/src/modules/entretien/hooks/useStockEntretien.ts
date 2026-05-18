import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { CreateStockEntretienDto, MouvementStockEntretienDto } from '../types/entretien.types';

export function useStock(filters?: { categorie?: string; alerte_only?: boolean }) {
  return useQuery({
    queryKey: ['entretien', 'stock', filters],
    queryFn: () => entretienApi.getStock(filters).then(r => r.data),
  });
}

export function useStockAlertes() {
  return useQuery({
    queryKey: ['entretien', 'stock', 'alertes'],
    queryFn: () => entretienApi.getStockAlertes().then(r => r.data),
    refetchInterval: 60_000,
  });
}

export function useStockEnergie() {
  return useQuery({
    queryKey: ['entretien', 'stock', 'energie'],
    queryFn: () => entretienApi.getStockEnergie().then(r => r.data),
  });
}

export function useCreateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockEntretienDto) => entretienApi.createStock(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'stock'] });
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStockEntretienDto> }) =>
      entretienApi.updateStock(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'stock'] });
    },
  });
}

export function useMouvements(stockId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['entretien', 'stock', stockId, 'mouvements', page, limit],
    queryFn: () => entretienApi.getMouvements(stockId, { page, limit }).then(r => r.data),
    enabled: !!stockId,
  });
}

export function useEnregistrerMouvement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MouvementStockEntretienDto }) =>
      entretienApi.enregistrerMouvement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'stock'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

// Made with Bob
