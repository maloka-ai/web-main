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

export type CustomerSale = {
  data_venda: string;
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
