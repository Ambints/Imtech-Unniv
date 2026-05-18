import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';

export function useReservations() {
  return useQuery({
    queryKey: ['logistique', 'reservations'],
    queryFn: () => logistiqueApi.getReservations(),
  });
}

export function useCalendrier(dateDebut: string, dateFin: string) {
  return useQuery({
    queryKey: ['logistique', 'reservations', 'calendrier', dateDebut, dateFin],
    queryFn: () => logistiqueApi.getCalendrier(dateDebut, dateFin),
    enabled: !!dateDebut && !!dateFin,
  });
}

export function useApprouverReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logistiqueApi.approuverReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useRefuserReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logistiqueApi.refuserReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

export function useAnnulerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => logistiqueApi.annulerReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'reservations'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob
