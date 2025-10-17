import { useQuery } from '@tanstack/react-query';
import { customerKeys } from './queryKeys';
import { customerService } from '@/services/customer/service';
import { useMemo } from 'react';

export const useCustomerDetails = (id_cliente: number) =>
  useQuery({
    queryKey: customerKeys.detail(id_cliente),
    queryFn: () => customerService.getDetailsCustomer(id_cliente),
    staleTime: 30_000,
  });
export const useCustomerSales = (id_cliente: number) =>
  useQuery({
    queryKey: customerKeys.sales(id_cliente),
    queryFn: () => customerService.getSalesCustomer(id_cliente),
  });
export const useCustomers = () =>
  useQuery({
    queryKey: customerKeys.all,
    queryFn: () => customerService.getAllCustomers(),
  });

type UseTotalSalesOptions = {
  monthsBack?: number; // quantos meses contar para trás (inclui o mês atual). Padrão: 12
  includeZeroMonths?: boolean; // se true, meses sem venda aparecem com total 0. Padrão: true
  locale?: string; // locale para label do mês. Padrão: 'pt-BR'
};

export type MonthlySalesPoint = {
  key: string; // 'YYYY-MM'
  label: string; // 'out/2025' (pt-BR por padrão)
  total: number; // soma de total_venda por mês
  date: Date; // 1º dia do mês (para ordenação/uso avançado)
};

export function useTotalSalesByMonth(
  id_cliente: number,
  {
    monthsBack = 12,
    includeZeroMonths = true,
    locale = 'pt-BR',
  }: UseTotalSalesOptions = {},
) {
  const salesQuery = useCustomerSales(id_cliente);

  const data: MonthlySalesPoint[] = useMemo(() => {
    const sales = salesQuery.data ?? [];
    if (!Number.isFinite(id_cliente) || monthsBack <= 0) return [];

    // helpers locais
    const startOfMonth = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), 1);
    const addMonths = (d: Date, n: number) =>
      new Date(d.getFullYear(), d.getMonth() + n, 1);
    const monthKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // faixa de meses (inclui mês atual)
    const endMonth = startOfMonth(new Date());
    const startMonth = addMonths(endMonth, -(monthsBack - 1));

    // inicializa o mapa com zero se solicitado
    const acc = new Map<string, number>();
    if (includeZeroMonths) {
      for (
        let cursor = new Date(startMonth);
        cursor <= endMonth;
        cursor = addMonths(cursor, 1)
      ) {
        acc.set(monthKey(cursor), 0);
      }
    }

    // agrega vendas por mês (usa total_venda)
    for (const s of sales) {
      const d = new Date(s.data_venda);
      if (Number.isNaN(d.getTime())) continue;

      const month = startOfMonth(d);
      if (month < startMonth || month > endMonth) continue;

      const key = monthKey(month);
      const prev = acc.get(key) ?? 0;
      acc.set(key, prev + (s.total_venda ?? 0));
    }

    // cria array ordenado de start -> end
    const fmt = new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric',
    });
    const out: MonthlySalesPoint[] = [];
    for (
      let cursor = new Date(startMonth);
      cursor <= endMonth;
      cursor = addMonths(cursor, 1)
    ) {
      const key = monthKey(cursor);
      const total = acc.get(key);
      if (total === undefined && !includeZeroMonths) continue;

      out.push({
        key,
        label: fmt.format(cursor), // ex.: 'out. de 2025' dependendo do ambiente
        total: total ?? 0,
        date: cursor,
      });
    }

    return out;
  }, [salesQuery.data, id_cliente, monthsBack, includeZeroMonths, locale]);

  return {
    ...salesQuery, // isLoading, isError, etc.
    data,
  };
}
