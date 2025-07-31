import { analysisService, AnnualRevenue, CustomerAnnualRecurrence, CustomerQuarterlyRecurrence, DailyRevenue, MonthlyRevenue, SegmentacaoCliente, StockMetrics } from "@/services/analysisService";
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

function fillMissingDays(data: DailyRevenue[], year: number, month: number): DailyRevenue[] {
  const daysInMonth = new Date(year, month, 0).getDate(); // `month` 1-indexado
  const filled: DailyRevenue[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const found = data.find(d => d.mes === month && d.dia === day);
    if (found) {
      filled.push(found);
    } else {
      filled.push({
        mes: month,
        total_venda: 0,
        ano: year,
        id_loja: 0,
        dia: day,
        loja: 'N/A'
      });
    }
  }

  return filled;
}

const monthNamesPt = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function clientsMakeGraphs(
  clients: SegmentacaoCliente[],
  customerQuarterlyRecurrence: CustomerQuarterlyRecurrence[],
  customerAnnualRecurrence: CustomerAnnualRecurrence[],
): Graphs[] {


  if (customerQuarterlyRecurrence.length < 3 || customerAnnualRecurrence.length < 3) {
    return [];
  }

  const last3QuarterlyRecurrence = customerQuarterlyRecurrence.slice(-3).map(cqr => {
    return {
      name: `${cqr.ano}Q${cqr.trimestre}`,
      value: Number(cqr.taxa_recorrencia.toFixed(2)),
    }
  })
  const xLabelMapLast3QuarterlyRecurrence: { [key: string]: string } = last3QuarterlyRecurrence.reduce((acc, qr) => {
    acc[qr.name] = qr.name;
    return acc;
  }, {} as { [key: string]: string });

  const last3AnnualRecurrence = customerAnnualRecurrence.slice(-3).map(cqr => {
    return {
      name: `${cqr.ano}`,
      value: Number(cqr.taxa_retencao.toFixed(2))
    }
  })
  const xLabelMapLast3AnnualRecurrence: { [key: string]: string } = last3AnnualRecurrence.reduce((acc, qr) => {
    acc[qr.name] = qr.name;
    return acc;
  }, {} as { [key: string]: string });

  const last5AnnualRecurrenceMean = customerAnnualRecurrence.slice(-5).length > 0
  ? customerAnnualRecurrence.slice(-5).reduce((acc, curr) => acc + curr.taxa_retencao, 0) / last3AnnualRecurrence.length
  : 0;
  const currentAnnualRevenue = customerAnnualRecurrence[customerAnnualRecurrence.length - 1].taxa_retencao;
  const last5AnnualRecurrenceGain = (currentAnnualRevenue - last5AnnualRecurrenceMean) / Math.abs(currentAnnualRevenue - last5AnnualRecurrenceMean)

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
      data: last3QuarterlyRecurrence,
      value: `${last3QuarterlyRecurrence[2].value}%`,
      xLabelMap: xLabelMapLast3QuarterlyRecurrence,
    },
    {
      type: GraphType.LINE,
      title: "Taxa de Retenção Anual",
      subtitle: "Últimos 3 anos",
      gain: last5AnnualRecurrenceGain,
      data: last3AnnualRecurrence,
      value: `${currentAnnualRevenue.toFixed(2)}%`,
      xLabelMap: xLabelMapLast3AnnualRecurrence,
    }
  ]

}

export function salesMakeGraphs(
  annualRevenues: AnnualRevenue[],
  monthlyRevenue: MonthlyRevenue[],
  currentYearDailyRevenues: DailyRevenue[],
  lastYearDailyRevenues: DailyRevenue[],
): Graphs[] {

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const currentYearDailyRevenuesFilled = fillMissingDays(currentYearDailyRevenues, currentYear, currentMonth - 1);
  // const lastYearDailyRevenuesFilled = fillMissingDays(lastYearDailyRevenues, currentYear - 1, currentMonth); // TODO: Wait for API to populate last year data
  const lastYearDailyRevenuesFilled = fillMissingDays(lastYearDailyRevenues, currentYear, currentMonth - 2);

  const currentYearMonthlyRevenue = monthlyRevenue.filter(mr => mr.ano === currentYear);
  const lastYearMonthlyRevenue = monthlyRevenue.filter(mr => mr.ano === currentYear - 1);

  const xLabelMapLast5Years = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      return [year, year.toString()];
    })
  );


  if (annualRevenues.length === 0 || monthlyRevenue.length === 0) {
    return [];
  }


  const currentProductAnnualRevenue = annualRevenues[annualRevenues.length - 1].faturamento_em_produtos;
  const currentServiceAnnualRevenue = annualRevenues[annualRevenues.length - 1].faturameno_em_servicos;

  const lastCurrentAnnualRevenue = annualRevenues[annualRevenues.length - 1]
  const hasToDismemberSales = !!lastCurrentAnnualRevenue.faturameno_em_servicos;

  const currentMonthlyAccumulated = currentYearMonthlyRevenue
    .filter(mr => mr.mes < currentMonth)
    .reduce((acc, mr) => acc + mr.total_venda, 0);

  const lastYearMonthlyAccumulated = lastYearMonthlyRevenue
    .filter(mr => mr.mes < currentMonth)
    .reduce((acc, mr) => acc + mr.total_venda, 0);

  const currentYearDailyAccumulated = currentYearDailyRevenuesFilled
    .reduce((acc, dr) => acc + dr.total_venda, 0);

  const lastYearDailyAccumulated = lastYearDailyRevenuesFilled
    .reduce((acc, dr) => acc + dr.total_venda, 0);

  const growthRateMonthly = lastYearMonthlyAccumulated === 0
    ? 0
    : (currentMonthlyAccumulated - lastYearMonthlyAccumulated) / Math.abs(currentMonthlyAccumulated - lastYearMonthlyAccumulated);

  const growthRateDaily = lastYearDailyAccumulated === 0
    ? 0
    : (currentYearDailyAccumulated - lastYearDailyAccumulated) / Math.abs(currentYearDailyAccumulated - lastYearDailyAccumulated);

  let accumulatedCurrent = 0;
  let accumulatedPrevious = 0;

  const monthlyRevenueComparison = Array.from({ length: currentMonth - 1 }, (_, i) => {
    const month = i + 1;

    const current = currentYearMonthlyRevenue.find(mr => mr.mes === month)?.total_venda ?? 0;
    const previous = lastYearMonthlyRevenue.find(mr => mr.mes === month)?.total_venda ?? 0;

    accumulatedCurrent += current;
    accumulatedPrevious += previous;

    return {
      name: monthNamesPt[i],
      value: accumulatedCurrent - accumulatedPrevious,
    };
  });

  accumulatedCurrent = 0;
  accumulatedPrevious = 0;

  console.log(currentYearDailyRevenuesFilled, lastYearDailyRevenuesFilled)

  const dailyRevenueComparison = Array.from({ length: currentYearDailyRevenuesFilled.length }, (_, i) => {
    const current = currentYearDailyRevenuesFilled[i]?.total_venda ?? 0;
    const previous = lastYearDailyRevenuesFilled[i]?.total_venda ?? 0;

    accumulatedCurrent += current;
    accumulatedPrevious += previous;

    return {
      name: `${currentYearDailyRevenuesFilled[i].dia}`,
      value: accumulatedCurrent - accumulatedPrevious,
    };
  });


  const graphs = [
    {
      type: GraphType.LINE,
      title: "Receita Anual",
      subtitle: "Ultimos 5 anos",
      data: annualRevenues.slice(-5).map(ar => ({
        name: ar.ano.toString(),
        value: ar.total_de_faturamento,
      })),
      gain: (annualRevenues[annualRevenues.length - 1].total_de_faturamento - annualRevenues[annualRevenues.length - 2].total_de_faturamento) / Math.abs(annualRevenues[annualRevenues.length - 1].total_de_faturamento - annualRevenues[annualRevenues.length - 2].total_de_faturamento),
      value: formatCurrency(lastCurrentAnnualRevenue.total_de_faturamento),
      xLabelMap: xLabelMapLast5Years,
    },
    {
      type: GraphType.LINE,
      title: "Receita Mensal",
      subtitle: "Últimos 5 meses",
      data: monthlyRevenue.slice(-5).map(mr => ({
        name: monthNamesPt[mr.mes - 1],
        value: mr.total_venda,
      })),
      value: formatCurrency(monthlyRevenue[monthlyRevenue.length - 1].total_venda),
      xLabelMap: xLabelMapLast5Years,
    },
    {
      type: GraphType.LINE,
      title: "Ticket Médio",
      subtitle: "Últimos 3 anos",
      data: annualRevenues.slice(-5).map(ar => ({
        name: ar.ano.toString(),
        value: ar.ticket_medio_anual,
      })),
      value: formatCurrency(lastCurrentAnnualRevenue.ticket_medio_anual),
      xLabelMap: xLabelMapLast5Years,
    },
    {
      type: GraphType.LINE,
      title: `Receita Anual Acumulada ${currentYear - 1} x ${currentYear}`,
      subtitle: `Comparação até ${(currentMonth-1).toString().padStart(2, "0")}/${currentYear}`,
      data: monthlyRevenueComparison,
      gain: growthRateMonthly,
      value: formatCurrency(currentMonthlyAccumulated),
      xLabelMap: Object.fromEntries(
        Array.from({ length: currentMonth }, (_, i) => {
          const m = (i + 1).toString().padStart(2, "0");
          return [m, m];
        })
      ),
    },
    {
      type: GraphType.LINE,
      // title: `Receita Mensal Acumulada ${currentYear - 1} x ${currentYear}`, // TODO: Wait for API to populate last year data
      title: `Receita Mensal Acumulada ${monthNamesPt[currentMonth - 2]} x ${monthNamesPt[currentMonth-1]}`,
      subtitle: `Comparação até o dia ${currentYearDailyRevenuesFilled.length}`,
      data: dailyRevenueComparison,
      gain: growthRateDaily,
      value: formatCurrency(currentYearDailyAccumulated),
      xLabelMap: Object.fromEntries(
        currentYearDailyRevenues.map(dr => {
          const d = dr.dia.toString().padStart(2, "0");
          return [d, d];
        }
      )),
    },
    ...(hasToDismemberSales ? [
      {
        type: GraphType.LINE,
        title: "Valor Médio Produto",
        data: annualRevenues.map(ar => ({
          name: ar.ano.toString(),
          value: ar.qtd_vendas_produtos ? Number((ar.faturamento_em_produtos / ar.qtd_vendas_produtos).toFixed(2)) : 0
        })),
        value: formatCurrency(lastCurrentAnnualRevenue.qtd_vendas_produtos ? lastCurrentAnnualRevenue.faturamento_em_produtos / lastCurrentAnnualRevenue.qtd_vendas_produtos : 0),
        xLabelMap: xLabelMapLast5Years,
      },
      {
        type: GraphType.LINE,
        title: "Valor Médio Serviço",
        data: annualRevenues.map(ar => ({
          name: ar.ano.toString(),
          value: ar.qtd_vendas_servicos ? ar.faturameno_em_servicos / ar.qtd_vendas_servicos : 0
        })),
        value: formatCurrency(lastCurrentAnnualRevenue.qtd_vendas_servicos ? lastCurrentAnnualRevenue.faturameno_em_servicos / lastCurrentAnnualRevenue.qtd_vendas_servicos : 0),
        xLabelMap: xLabelMapLast5Years,
      },
    ] : []),
    ...(hasToDismemberSales ? [
      {
        type: GraphType.KPI,
        title: "Faturamento Produto Anual",
        data: formatCurrency(currentProductAnnualRevenue),
      },
      {
        type: GraphType.KPI,
        title: "Faturamento Serviço Anual",
        data: formatCurrency(currentServiceAnnualRevenue),
      },
    ] : []),

  ]
  return graphs;
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
      value: Number(rupturaPercentage.toFixed(2)),
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
        { name: 'A', value: Number(currentStock.percent_sku_grupo_a.toFixed(2)) },
        { name: 'B', value: Number(currentStock.percent_sku_grupo_b.toFixed(2)) },
        { name: 'C', value: Number(currentStock.percent_sku_grupo_c.toFixed(2)) },
      ],
      value: `${
        Number(currentStock.percent_sku_grupo_a.toFixed(2))
      }% ${
        Number(currentStock.percent_sku_grupo_b.toFixed(2))
      }% ${
        Number(currentStock.percent_sku_grupo_c.toFixed(2))
      }%`,
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
        { name: 'A', value: Number(currentStock.percent_venda_grupo_a.toFixed(2)) },
        { name: 'B', value: Number(currentStock.percent_venda_grupo_b.toFixed(2)) },
        { name: 'C', value: Number(currentStock.percent_venda_grupo_c.toFixed(2)) },
      ],
      value: `${
        Number(currentStock.percent_venda_grupo_a.toFixed(2))
      }% ${
        Number(currentStock.percent_venda_grupo_b.toFixed(2))
      }% ${
        Number(currentStock.percent_venda_grupo_c.toFixed(2))
      }%`,
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
      value: `${Number(rupturaPercentages.slice(-1)[0].value.toFixed(2))}%`,
      hideXAxis: true,
    }
  ]

}
