import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { CreateTicketMaintenanceDto, UpdateTicketMaintenanceDto } from '../types/entretien.types';

export function useTickets(filters?: {
  statut?: string;
  priorite?: string;
  type?: string;
  batiment_id?: string;
}) {
  return useQuery({
    queryKey: ['entretien', 'tickets', filters],
    queryFn: () => entretienApi.getTickets(filters).then(r => r.data),
  });
}

export function useTicketsUrgents() {
  return useQuery({
    queryKey: ['entretien', 'tickets', 'urgents'],
    queryFn: () => entretienApi.getTicketsUrgents().then(r => r.data),
    refetchInterval: 60_000,
  });
}

export function useTicketsStats(jours: number = 30) {
  return useQuery({
    queryKey: ['entretien', 'tickets', 'stats', jours],
    queryFn: () => entretienApi.getTicketsStats(jours).then(r => r.data),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketMaintenanceDto) => entretienApi.createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'tickets'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketMaintenanceDto }) =>
      entretienApi.updateTicket(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'tickets'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

// Made with Bob
