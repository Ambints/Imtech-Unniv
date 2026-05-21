import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';
import type { CreateBatimentDto } from '../types/logistique.types';

export function useCreateBatiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatimentDto) => logistiqueApi.createBatiment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logistique', 'batiments'] });
      qc.invalidateQueries({ queryKey: ['logistique', 'dashboard'] });
    },
  });
}

// Made with Bob