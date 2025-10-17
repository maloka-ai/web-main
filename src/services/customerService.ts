import api from '@/utils/api';

export interface Customer {
  id_cliente: number;
  nome: string;
  cnpj: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  antiguidade: number; // em dias
  recencia: number; // em dias
  frequencia: number; // número de compras
  valor_monetario: number; // valor total gasto
  segmento: string;
}

export interface CustomerDetails {
  id_cliente: number;
  tipo: string;
  cpf_cnpj: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  data_cadastro: string | null;
  data_nascimento: string | null;
  genero: string | null;
  data_fundacao: string | null;
}

export type Sale = {
  data_venda: string; // ISO date string
  id_cliente: number;
  id_loja: number;
  id_venda: number;
  id_vendedor: number;
  nome_cliente: string;
  nome_loja: string;
  nome_vendedor: string;
  situacao_venda: string;
  tipo_venda: string;
  total_venda: number;
  valor_total_venda_produto: number;
  valor_total_venda_servico: number;
};

function toQS(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : '';
}

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
    const { data } = await api.get<Sale[]>(`/sales/vendas/cliente${qs}`);

    return data;
  },
};
