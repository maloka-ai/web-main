import { analysisService, AnnualRevenue, MonthlyRevenue, SegmentacaoCliente, StockMetrics } from "@/services/analysisService";
import { GraphType } from "@/utils/enums";
import { formatCurrency } from "@/utils/format";
import { DataPoint } from "../widgets/ResumeGraphLine";

type Graphs = {
  type: GraphType;
  title: string;
  data: any[] | string;
  subtitle?: string;
  gain?: number;
  value?: string;
  xLabelMap?: { [key: string]: string };
  hideXAxis?: boolean;
}

export function clientsMakeGraphs(
  clients: SegmentacaoCliente[]
): Graphs[] {

  return [
    {
      type: GraphType.KPI,
      title: "Clientes Ativos",
      data: clients.filter(c => c.segmento !== 'Inativos').length.toString()
    },
    {
      type: GraphType.KPI,
      title: "Novos Clientes",
      data: clients.filter(c => c.segmento === 'Novos').length.toString()
    },
    {
      type: GraphType.LINE,
      title: "Taxa de Recorrência Trimestral",
      subtitle: "Últimos 3 trimestres",
      gain: 23,
      data: [
        { name: '2023Q4', value: 30 },
        { name: '2024Q1', value: 48 },
        { name: '2024Q2', value: 48 },
      ],
      xLabelMap: {
        '2023Q4': '2023/T4',
        '2024Q1': '2024/T1',
        '2024Q2': '2024/T2',
      }
    },
    {
      type: GraphType.LINE,
      title: "Taxa de Retenção Anual",
      subtitle: "Últimos 3 anos",
      gain: 8,
      data: [
        { name: '2022', value: 62 },
        { name: '2023', value: 67 },
        { name: '2024', value: 64 },
      ],
      xLabelMap: {
        '2022': '2022',
        '2023': '2023',
        '2024': '2024',
      }
    }
  ]

}

export function salesMakeGraphs(
  annualRevenues: AnnualRevenue[],
  monthlyRevenue: MonthlyRevenue[],
): Graphs[] {

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const xLabelMapLast3Years: { [key: string]: string } = {
    [currentYear - 2]: (currentYear - 2).toString(),
    [currentYear - 1]: (currentYear - 1).toString(),
    [currentYear]: currentYear.toString(),
  };

  if (annualRevenues.length === 0 || monthlyRevenue.length === 0) {
    return [];
  }

  const currentAnnualRevenue = annualRevenues[annualRevenues.length - 1].total_de_faturamento;
  const currentProductAnnualRevenue = annualRevenues[annualRevenues.length - 1].faturamento_em_produtos;
  const currentServiceAnnualRevenue = annualRevenues[annualRevenues.length - 1].faturameno_em_servicos;
  const currentMonthlyRevenue = monthlyRevenue
    .filter(mr => mr.mes === currentMonth && mr.ano === currentYear)
    .reduce((acc, mr) => acc + mr.total_venda, 0);
  return [
    {
      type: GraphType.LINE,
      title: "Ticket Médio",
      subtitle: "Últimos 3 anos",
      data: annualRevenues.slice(-3).map(ar => ({
        name: ar.ano.toString(),
        value: ar.ticket_medio_anual,
      })),
      xLabelMap: xLabelMapLast3Years,
    },
    {
      type: GraphType.LINE,
      title: "Valor Médio Produto",
      data: annualRevenues.map(ar => ({
        name: ar.ano.toString(),
        value: ar.qtd_vendas_produtos ? ar.faturamento_em_produtos / ar.qtd_vendas_produtos : 0
      })),
      xLabelMap: xLabelMapLast3Years,
    },
    {
      type: GraphType.LINE,
      title: "Valor Médio Serviço",
      data: annualRevenues.map(ar => ({
        name: ar.ano.toString(),
        value: ar.qtd_vendas_servicos ? ar.faturameno_em_servicos / ar.qtd_vendas_servicos : 0
      })),
      xLabelMap: xLabelMapLast3Years,
    },
    {
      type: GraphType.KPI,
      title: "Faturamento Total Anual",
      data: formatCurrency(currentAnnualRevenue),
    },
    {
      type: GraphType.KPI,
      title: "Faturamento Total Mensal",
      data: formatCurrency(currentMonthlyRevenue),
    },
    {
      type: GraphType.KPI,
      title: "Faturamento Produto Anual",
      data: formatCurrency(currentProductAnnualRevenue),
    },
    {
      type: GraphType.KPI,
      title: "Faturamento Serviço Anual",
      data: formatCurrency(currentServiceAnnualRevenue),
    }
  ]
}

export function stockMakeGraphs(
  stock: StockMetrics[],
): Graphs[] {

  if (stock.length === 0) {
    return [];
  }

  const currentStock = stock[stock.length - 1];

  // Para cara StockMetrics, calcula (TOTAL SKU ATIVO (ESTOQUE <= 0)) / (TOTAL SKU ATIVO (ESTOQUE > 0) + TOTAL SKU ATIVO (ESTOQUE <= 0)), lista de ruptura
  const rupturaPercentages = stock.map(s => {
    const totalAtivoComEstoqueMaiorQueZero = s.total_sku_ativo_com_estoque_maior_que_zero || 0;
    const totalAtivoComEstoqueMenorOuIgualZero = s.total_sku_ativo_com_estoque_menor_ou_igual_zero || 0;
    const totalAtivo = totalAtivoComEstoqueMaiorQueZero + totalAtivoComEstoqueMenorOuIgualZero;
    const rupturaPercentage = totalAtivo > 0 ? (totalAtivoComEstoqueMenorOuIgualZero / totalAtivo) * 100 : 0;
    // Obtem dia/mes da data_hora_analise
    const date = new Date(s.data_hora_analise);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    return {
      name: `${dia}/${mes}`,
      value: rupturaPercentage,
    };
  });



  return [
    {
      type: GraphType.KPI,
      title: "Valor Total Em Estoque",
      data: formatCurrency(currentStock.custo_total_estoque_positivo),
    },
    {
      type: GraphType.KPI,
      title: "Total de SKUs Ativas",
      data: (
        currentStock.total_sku_ativo_com_estoque_maior_que_zero +
        currentStock.total_sku_ativo_com_estoque_menor_ou_igual_zero
      ).toString(),
    },
    {
      type: GraphType.LINE,
      title: "% SKUs por Curva ABC",
      data: [
        { name: 'A', value: currentStock.percentual_sku_grupo_a },
        { name: 'B', value: currentStock.percentual_sku_grupo_b },
        { name: 'C', value: currentStock.percentual_sku_grupo_c },
      ],
      xLabelMap: {
        'A': 'Grupo A',
        'B': 'Grupo B',
        'C': 'Grupo C',
      }
    },
    {
      type: GraphType.LINE,
      title: "% Venda por Curva ABC",
      data: [
        { name: 'A', value: currentStock.percentual_venda_grupo_a },
        { name: 'B', value: currentStock.percentual_venda_grupo_b },
        { name: 'C', value: currentStock.percentual_venda_grupo_c },
      ],
      xLabelMap: {
        'A': 'Grupo A',
        'B': 'Grupo B',
        'C': 'Grupo C',
      }
    },
    {
      type: GraphType.LINE,
      title: "% Ruptura (Estoque ativo)",
      data: rupturaPercentages,
      hideXAxis: true,
    }
  ]

}
