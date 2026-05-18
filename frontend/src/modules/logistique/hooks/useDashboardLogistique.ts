import { useQuery } from '@tanstack/react-query';
import { logistiqueApi } from '../api/logistique.api';

export function useDashboardLogistique() {
  return useQuery({
    queryKey: ['logistique', 'dashboard'],
    queryFn: () => logistiqueApi.getDashboard(),
    refetchInterval: 30_000, // refresh every 30s
    staleTime: 15_000,
  });
}

// Made with Bob
