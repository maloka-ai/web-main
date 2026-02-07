import { useQuery } from '@tanstack/react-query';
import { reportsKeys } from '@/services/reports/queryKeys';
import { reportsService } from '@/services/reports/service';

export const useQueryReports = () =>
  useQuery({
    queryKey: reportsKeys.list,
    queryFn: () => reportsService.list(),
    staleTime: 30_000,
  });
