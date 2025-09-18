import api from '@/utils/api';
import { get } from 'node:http';

export interface CustomerSegmentation {
  id_cliente: number;
  recencia: number;
  frequencia: number;
  valor_monetario: number;
  antiguidade: number;
  segmento: string;
  cpf?: string;
  cnpj: string;
  nome: string;
  email?: string;
  telefone?: string;
  tipo_pessoa: string;
}

export interface AnnualRevenue {
  ano: number;
  faturamento_em_produtos: number;
  faturameno_em_servicos: number;
  total_de_faturamento: number;
  percent_faturameno_em_servicos: number;
  percent_faturamento_em_produtos: number;
  percent_evolução_faturameno_em_servicos: number | null;
  percent_evolução_faturamento_em_produtos: number | null;
  percent_evolução_total_de_faturamento: number | null;
  qtd_vendas_produtos: number;
  qtd_vendas_servicos: number;
  total_venda_itens: number;
  qtd_vendas_ano: number;
  ticket_medio_anual: number;
  percent_de_evolução_ticket_medio: number | null;
  faturamento_cliente_cadastrado: number;
  faturamento_cliente_sem_cadastro: number;
  total_faturamento_clientes: number;
  percent_faturamento_cliente_cadastrado: number;
  percent_faturamento_cliente_sem_cadastro: number;
  diferenca_totais: number;
  cliente: string;
}

export interface MonthlyRevenue {
  id: number;
  mes: number;
  total_venda: number;
  ano: number;
  id_loja: number;
  nome_loja: string;
  cliente: string;
}

export interface DailyRevenue {
  dia: number;
  mes: number;
  ano: number;
  total_venda: number;
  id_loja: number;
  loja: string;
}

export interface StockMetrics {
  id: number;
  cliente: string;
  data_hora_analise: string;
  cobertura_em_dias_grupo_a: number;
  cobertura_em_dias_grupo_b: number;
  cobertura_em_dias_grupo_c: number;
  custo_total_ativo_com_estoque_maior_que_zero: number;
  custo_total_inativo_com_estoque_maior_que_zero: number;
  custo_total_nao_comercializado_com_estoque_maior_que_zero: number;
  custo_total_estoque_positivo: number;
  custo_total_estoque_negativo: number;
  percent_sku_ativo_com_estoque_maior_que_zero: number;
  percent_sku_ativo_com_estoque_menor_ou_igual_zero: number;
  percent_sku_inativo_com_estoque_maior_que_zero: number;
  percent_sku_inativo_com_estoque_menor_ou_igual_zero: number;
  percent_sku_nao_comercializado_com_estoque_maior_que_zero: number;
  percent_sku_nao_comercializado_com_estoque_menor_ou_igual_zero: number;
  percent_sku_com_estoque_positivo: number;
  percent_sku_com_estoque_negativo: number;
  percent_sku_com_estoque_zero: number;
  percent_sku_com_ate_um_ano_de_vendas: number;
  percent_sku_com_mais_de_um_ano_de_vendas: number;
  percent_sku_consistentes: number;
  percent_sku_inconsistentes: number;
  percent_sku_grupo_a: number;
  percent_sku_grupo_b: number;
  percent_sku_grupo_c: number;
  percent_venda_grupo_a: number;
  percent_venda_grupo_b: number;
  percent_venda_grupo_c: number;
  total_de_skus: number;
  total_sku_verificados: number;
  total_sku_ativo_com_estoque_maior_que_zero: number;
  total_sku_ativo_com_estoque_menor_ou_igual_zero: number;
  total_sku_inativo_com_estoque_maior_que_zero: number;
  total_sku_inativo_com_estoque_menor_ou_igual_zero: number;
  total_sku_nao_comercializado_com_estoque_maior_que_zero: number;
  total_sku_nao_comercializado_com_estoque_menor_ou_igual_zero: number;
  total_sku_com_estoque_positivo: number;
  total_sku_com_estoque_negativo: number;
  total_sku_com_estoque_zero: number;
  total_sku_com_ate_um_ano_de_vendas: number;
  total_sku_com_mais_de_um_ano_de_vendas: number;
  total_sku_consistentes: number;
  total_sku_inconsistentes: number;
  total_sku_grupo_a: number;
  total_sku_grupo_b: number;
  total_sku_grupo_c: number;
  total_venda_grupo_a: number;
  total_venda_grupo_b: number;
  total_venda_grupo_c: number;
}


export interface CustomerQuarterlyRecurrence {
    id: number;
    ano: number;
    trimestre: number;
    total_clientes: number;
    clietes_retornantes: number;
    clientes_novos: number;
    taxa_recorrencia: number;
    cliente: string;
}


export interface CustomerAnnualRecurrence {
    id: number;
    ano: number;
    clientes_novos: number;
    clietes_retornantes: number;
    taxa_clientes_retornantes: number;
    taxa_clientes_novos: number;
    taxa_retencao: number;
    cliente: string;
}

export interface CockpitAlert {
  indicador: string;
  titulo: string;
  descricao: string;
  acao: string;
  link_detalhamento: string;
  tipo: string;
}


export const analysisService = {
  async getSegmentacaoClientes(): Promise<CustomerSegmentation[]> {
    const response = await api.get<CustomerSegmentation[]>('/customer/segmentacao/clientes_por_segmento');
    return response.data;
  },
  async getCustomerQuarterlyRecurrence(inital_year: number): Promise<CustomerQuarterlyRecurrence[]> {
    const response = await api.get<CustomerQuarterlyRecurrence[]>(`/customer/recorrencia_trimestral?ano_inicial=${inital_year}`);
    return response.data;
  },
  async getCustomerAnnualRecurrence(inital_year: number): Promise<CustomerAnnualRecurrence[]> {
    const response = await api.get<CustomerAnnualRecurrence[]>(`/customer/recorrencia_anual?ano_inicial=${inital_year}`);
    return response.data;
  },
  async getAnnualRevenues(): Promise<AnnualRevenue[]> {
    const response = await api.get<AnnualRevenue[]>('/sales/faturamento/anual');
    return response.data;
  },
  async getMonthlyRevenues(year?: number): Promise<MonthlyRevenue[]> {
    const response = await api.get<MonthlyRevenue[]>(`/sales/faturamento/mensal${year ? `?ano=${year}` : ''}`);
    return response.data;
  },
  async getDailyRevenues(year: number, month?: number): Promise<DailyRevenue[]> {
    const response = await api.get<DailyRevenue[]>(`/sales/faturamento/diario?ano=${year}${month ? `&mes=${month}` : ''}`);
    return response.data;
  },
  async getStockMetrics(): Promise<StockMetrics[]> {
    const response = await api.get<StockMetrics[]>('/stock/metricas_estoque');
    return response.data;
  },
  async getCockpitAlert(): Promise<CockpitAlert[]> {
    const response = await api.get<CockpitAlert[]>('/cockpit/alertas');
    return response.data;
  },
  async getCockpitAlertDetail(subpath_detail: string): Promise<any> {
    const response = await api.get<any>(`${subpath_detail}`);
    return response.data;
  }
};
