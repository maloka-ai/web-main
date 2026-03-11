import { useQuery } from '@tanstack/react-query';
import { analysisKeys } from './queryKeys';
import { analysisService } from '@/services/analysis/analysisService';

export const useListAlertsCockipt = () =>
  useQuery({
    queryKey: analysisKeys.alerts,
    queryFn: () => analysisService.getCockpitAlert(),
    gcTime: 1000 * 60,
  });

export const useQuerySegmentationClients = () =>
  useQuery({
    queryKey: analysisKeys.segmentationClient,
    queryFn: () => analysisService.getSegmentacaoClientes(),
    gcTime: 1000 * 60,
  });

export const useQueryCustomerQuarterlyRecurrence = (initialYear: number) =>
  useQuery({
    queryKey: analysisKeys.customerQuarterlyRecurrence(initialYear),
    queryFn: () => analysisService.getCustomerQuarterlyRecurrence(initialYear),
    gcTime: 1000 * 60,
  });

export const useQueryCustomerAnnualRecurrence = (initialYear: number) =>
  useQuery({
    queryKey: analysisKeys.customerAnnualRecurrence(initialYear),
    queryFn: () => analysisService.getCustomerAnnualRecurrence(initialYear),
    gcTime: 1000 * 60,
  });

export const useQueryAnnualRevenues = () =>
  useQuery({
    queryKey: analysisKeys.annualRevenues,
    queryFn: () => analysisService.getAnnualRevenues(),
    gcTime: 1000 * 60,
  });
export const useQueryMonthlyRevenues = (year?: number) =>
  useQuery({
    queryKey: analysisKeys.monthlyRevenues(year),
    queryFn: () => analysisService.getMonthlyRevenues(year),
    gcTime: 1000 * 60,
  });

export const useQueryDailyRevenues = (year: number, month?: number) =>
  useQuery({
    queryKey: analysisKeys.dailyRevenues(year, month),
    queryFn: () => analysisService.getDailyRevenues(year, month),
    gcTime: 1000 * 60,
  });

export const useQueryStockMetrics = () =>
  useQuery({
    queryKey: analysisKeys.stockMetrics,
    queryFn: () => analysisService.getStockMetrics(),
    gcTime: 1000 * 60,
  });
