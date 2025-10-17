import api from '@/utils/api';
import { DailyRevenue } from '@/services/analysisService';

export interface AnnualRevenue {
  ano: number;
  total_de_faturamento: number;
  percent_evolução_total_de_faturamento: number | null;
  qtd_vendas_ano: number;
  ticket_medio_anual: number;
  faturamento_cliente_cadastrado: number;
  faturamento_cliente_sem_cadastro: number;
  percentual_faturamento_cliente_cadastrado: number;
  percentual_faturamento_cliente_sem_cadastro: number;
  faturameno_em_servicos: number;
  faturamento_em_produtos: number;
  percentual_faturameno_em_servicos: number;
  percentual_faturamento_em_produtos: number;
  percentual_de_evolução_ticket_medio: number | null;
  percentual_de_evolução_faturameno_em_servicos: number | null;
  percentual_evolução_faturamento_em_produtos: number | null;
  qtd_vendas_produtos: number;
  qtd_vendas_servicos: number;
  total_venda_itens: number;
  total_faturamento_clientes: number;
}

export interface MonthlyRevenue {
  ano: number;
  cliente: string;
  id: number;
  id_loja: number;
  mes: number;
  nome_loja: string;
  total_venda: number;
}

export type SaleItem = {
  acrescimo: number;
  desconto: number;
  descricao_servico: string | null;
  id_produto: number | null;
  id_servico: number | null;
  id_venda: number;
  id_venda_item: number;
  nome_produto: string | null;
  preco_bruto: number;
  quantidade: number;
  tipo: 'P' | 'S';
  total_item: number;
};

function toQS(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : '';
}

export const salesService = {
  async getAnnualRevenue(ano?: number): Promise<AnnualRevenue[]> {
    const qs = toQS({ ano });
    const { data } = await api.get<AnnualRevenue[]>(
      `/sales/faturamento/anual${qs}`,
    );
    return data;
  },

  async getMonthlyRevenue(params?: {
    mes?: number;
    ano?: number;
    loja?: string;
  }): Promise<MonthlyRevenue[]> {
    const qs = toQS({ mes: params?.mes, ano: params?.ano, loja: params?.loja });
    const { data } = await api.get<MonthlyRevenue[]>(
      `/sales/faturamento/mensal${qs}`,
    );
    return data;
  },

  async getDailyRevenue(params: { mes: number; ano: number }): Promise<any[]> {
    const qs = toQS({ mes: params.mes, ano: params.ano });
    const { data } = await api.get<any[]>(`/sales/faturamento/diario${qs}`);
    return data;
  },

  async getDailyRevenueByPeriod(params: {
    mes: number;
    ano: number;
  }): Promise<any[]> {
    const qs = toQS({ mes: params.mes, ano: params.ano });
    const { data } = await api.get<DailyRevenue[]>(
      `/sales/faturamento/diario_por_periodo${qs}`,
    );
    return data;
  },

  async getAtypicalTop10Products(): Promise<any[]> {
    const { data } = await api.get<any[]>(
      `/sales/vendas_atipicas/top10_produtos`,
    );
    return data;
  },

  async getAtypicalSalesDetail(): Promise<any[]> {
    const { data } = await api.get<any[]>(
      `/sales/vendas_atipicas/detalhamento`,
    );
    return data;
  },

  async getSalesByClient(id_cliente: number): Promise<any[]> {
    const qs = toQS({ id_cliente });
    const { data } = await api.get<any[]>(`/sales/vendas/cliente${qs}`);
    return data;
  },

  async getSaleItems(id_venda: number) {
    const qs = toQS({ id_venda });
    const { data } = await api.get<SaleItem[]>(`/sales/vendas/itens${qs}`);
    return data;
  },
};
