import { useQuery } from '@tanstack/react-query';
import { salesKeys } from './queryKeys';
import { salesService } from '@/services/sales/salesService';

export const useTopItensByCustomer = (id_cliente: number) =>
  useQuery({
    queryKey: salesKeys.topByCustomerId(id_cliente),
    queryFn: () => salesService.getAtypicalTop10Products(),
    gcTime: 1000 * 60,
  });
export const useQueryAverageMonthlyDiscount = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: salesKeys.averageMonthlyDiscount(mes, ano),
    queryFn: () => salesService.getAverageMonthlyDiscount(mes, ano),
    gcTime: 1000 * 60,
  });
export const useQueryMonthlyGrossProfit = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: salesKeys.monthlyGrossProfit(mes, ano),
    queryFn: () => salesService.getMonthlyGrossProfit(mes, ano),
    gcTime: 1000 * 60,
  });

export const useQueryMonthlyReturnPercentage = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: salesKeys.monthlyReturnPercentage(mes, ano),
    queryFn: () => salesService.getMonthlyReturnPercentage(mes, ano),
    gcTime: 1000 * 60,
  });
