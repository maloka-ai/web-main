import api from '@/utils/api';

export interface SegmentacaoCliente {
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

export const analysisService = {
  async getSegmentacaoClientes(): Promise<SegmentacaoCliente[]> {
    const response = await api.get<SegmentacaoCliente[]>('/customer/segmentacao/clientes_por_segmento');
    return response.data;
  },
};
