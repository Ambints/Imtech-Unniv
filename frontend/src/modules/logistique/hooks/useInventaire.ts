import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';

export function useInventaireSalles() {
  return useQuery({
    queryKey: ['logistique', 'inventaire', 'salles'],
    queryFn: () => logistiqueApi.getInventaireSalles(),
  });
}

export function useInventaireStocks() {
  return useQuery({
    queryKey: ['logistique', 'inventaire', 'stocks'],
    queryFn: () => logistiqueApi.getInventaireStocks(),
  });
}

export function useDemandesRessource() {
  return useQuery({
    queryKey: ['logistique', 'demandes-ressource'],
    queryFn: () => logistiqueApi.getDemandesRessource(),
  });
}

export function useTraiterDemande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { statut: string; commentaire_rejet?: string } }) =>
      logistiqueApi.traiterDemande(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'demandes-ressource'] });
    },
  });
}

// Made with Bob
