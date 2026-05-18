import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';
import type { CreateTicketDto, UpdateTicketDto } from '../types/logistique.types';

export function useTickets(params?: { statut?: string; priorite?: string; batiment_id?: string }) {
  return useQuery({
    queryKey: ['logistique', 'tickets', params],
    queryFn: () => logistiqueApi.getTickets(params),
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['logistique', 'tickets', 'stats'],
    queryFn: () => logistiqueApi.getTicketStats(),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketDto) => logistiqueApi.createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'tickets'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDto }) =>
      logistiqueApi.updateTicket(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'tickets'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob
