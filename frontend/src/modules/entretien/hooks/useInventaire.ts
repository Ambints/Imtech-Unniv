import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';
import type { TraiterDemandeRessourceDto } from '../types/entretien.types';

export function useInventaireBatiments() {
  return useQuery({
    queryKey: ['entretien', 'inventaire', 'batiments'],
    queryFn: () => entretienApi.getInventaireBatiments().then(r => r.data),
  });
}

export function useInventaireSallesParType() {
  return useQuery({
    queryKey: ['entretien', 'inventaire', 'salles-par-type'],
    queryFn: () => entretienApi.getInventaireSallesParType().then(r => r.data),
  });
}

export function useInventaireStocksParCategorie() {
  return useQuery({
    queryKey: ['entretien', 'inventaire', 'stocks-par-categorie'],
    queryFn: () => entretienApi.getInventaireStocksParCategorie().then(r => r.data),
  });
}

export function useDemandesRessource(filters?: { statut?: string; type_ressource?: string }) {
  return useQuery({
    queryKey: ['entretien', 'demandes-ressource', filters],
    queryFn: () => entretienApi.getDemandesRessource(filters).then(r => r.data),
  });
}

export function useTraiterDemandeRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TraiterDemandeRessourceDto }) =>
      entretienApi.traiterDemandeRessource(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entretien', 'demandes-ressource'] });
    },
  });
}

// Made with Bob
