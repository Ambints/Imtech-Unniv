import { useQuery } from '@tanstack/react-query';
import { entretienApi } from '../api/entretien.api';

export function useDashboardEntretien() {
  return useQuery({
    queryKey: ['entretien', 'dashboard'],
    queryFn: () => entretienApi.getDashboard().then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

// Made with Bob
