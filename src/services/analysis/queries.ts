import { useQuery } from '@tanstack/react-query';
import { analysisKeys } from './queryKeys';
import { analysisService } from '@/services/analysis/analysisService';

export const useListAlertsCockipt = () =>
  useQuery({
    queryKey: analysisKeys.alerts,
    queryFn: () => analysisService.getCockpitAlert(),
    staleTime: 30_000,
  });
