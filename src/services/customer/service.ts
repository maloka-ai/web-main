import api from '@/utils/api';
import {
  Customer,
  CustomerDetails,
  CustomerSale,
} from '@/services/customer/types';
import { toQS } from '@/services/helpers/toQS';

export const customerService = {
  async getAllCustomers() {
    const { data } = await api.get<Customer[]>(
      `/customer/segmentacao/clientes_por_segmento`,
    );
    return data;
  },
  async getDetailsCustomer(id_cliente: number) {
    const qs = toQS({ id_cliente });
    const { data } = await api.get<CustomerDetails>(`/customer/cliente${qs}`);
    return data;
  },
  async getSalesCustomer(id_cliente: number) {
    const qs = toQS({ id_cliente });
    const { data } = await api.get<CustomerSale[]>(
      `/sales/vendas/cliente${qs}`,
    );

    return data;
  },
};
