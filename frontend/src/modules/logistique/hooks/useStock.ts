import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';
import type { CreateStockDto, MouvementStockDto } from '../types/logistique.types';

export function useStock(params?: { categorie?: string; en_alerte?: boolean }) {
  return useQuery({
    queryKey: ['logistique', 'stock', params],
    queryFn: () => logistiqueApi.getStock(params),
  });
}

export function useAlertes() {
  return useQuery({
    queryKey: ['logistique', 'stock', 'alertes'],
    queryFn: () => logistiqueApi.getAlertes(),
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockDto) => logistiqueApi.createArticle(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'stock'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useMouvements(stockId: string, page: number = 1) {
  return useQuery({
    queryKey: ['logistique', 'stock', stockId, 'mouvements', page],
    queryFn: () => logistiqueApi.getMouvements(stockId, page),
    enabled: !!stockId,
  });
}

export function useEnregistrerMouvement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MouvementStockDto }) =>
      logistiqueApi.enregistrerMouvement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'stock'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob
