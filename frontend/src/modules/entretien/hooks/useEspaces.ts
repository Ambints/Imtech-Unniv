import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { TraiterReservationDto } from '../types/entretien.types';

export function useReservations(filters?: {
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  salle_id?: string;
}) {
  return useQuery({
    queryKey: ['entretien', 'reservations', filters],
    queryFn: () => entretienApi.getReservations(filters).then(r => r.data),
  });
}

export function useCalendrier(dateDebut: string, dateFin: string) {
  return useQuery({
    queryKey: ['entretien', 'reservations', 'calendrier', dateDebut, dateFin],
    queryFn: () => entretienApi.getCalendrier(dateDebut, dateFin).then(r => r.data),
    enabled: !!dateDebut && !!dateFin,
  });
}

export function useApprouverReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entretienApi.approuverReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

export function useRefuserReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TraiterReservationDto }) =>
      entretienApi.refuserReservation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['entretien', 'dashboard'] });
    },
  });
}

export function useAnnulerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entretienApi.annulerReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'reservations'] });
    },
  });
}

// Made with Bob
