import { useQuery } from '@tanstack/react-query';
import { customerKeys } from './queryKeys';
import { customerService } from '@/services/customer/service';

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
