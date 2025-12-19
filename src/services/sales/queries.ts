import { useQuery } from '@tanstack/react-query';
import { salesKeys } from './queryKeys';
import { salesService } from '@/services/salesService';

export const useTopItensByCustomer = (id_cliente: number) =>
  useQuery({
    queryKey: salesKeys.topByCustomerId(id_cliente),
    queryFn: () => salesService.getAtypicalTop10Products(),
    staleTime: 30_000,
  });
