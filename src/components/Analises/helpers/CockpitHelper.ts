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
  xAxisAngle?: number;
  secondData?: any[];
  tooltipFormatter?: (value: number, name?: string) => string;
}

function fillMissingDays(data: DailyRevenue[], year: number, month: number): DailyRevenue[] {
  const daysInMonth = new Date(year, month, 0).getDate(); // `month` 1-indexado
  const filled: DailyRevenue[] = [];

  for (let day = 1; day <= daysInMonth && day <= new Date().getDate(); day++) {
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

function groupRevenueDailyByDate(data: DailyRevenue[]) {
  const grouped = Object.values(
    data.reduce((acc, item) => {
      const key = `${item.ano}-${item.mes}-${item.dia}`;
      if (!acc[key]) {
        acc[key] = {
          dia: item.dia,
          mes: item.mes,
          ano: item.ano,
          total_venda: 0,
          id_loja: 0,
          loja: 'N/A',
        };
      }
      acc[key].total_venda += item.total_venda;
      return acc;
    }, {} as Record<string, DailyRevenue>)
  );

  return grouped.sort((a, b) =>
    a.ano !== b.ano
      ? a.ano - b.ano
      : a.mes !== b.mes
      ? a.mes - b.mes
      : a.dia - b.dia
  );
}

function groupRevenueMonthlyByMonthYear(data: MonthlyRevenue[]) {
  const grouped = Object.values(
    data.reduce((acc, item) => {
      const key = `${item.ano}-${item.mes}`;
      if (!acc[key]) {
        acc[key] = {
          mes: item.mes,
          ano: item.ano,
          total_venda: 0,
          id_loja: item.id_loja,
          nome_loja: item.nome_loja,
          cliente: item.cliente || 'N/A',
          id: item.id || 0,
        };
      }
      acc[key].total_venda += item.total_venda;
      return acc;
    }, {} as Record<string, MonthlyRevenue>)
  );

  // Ordenar por ano, depois mês
  return grouped.sort((a, b) =>
    a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes
  );
}

function groupRevenueAnnualByYear(data: AnnualRevenue[]) {
  const grouped = Object.values(
    data.reduce((acc, item) => {
      const key = `${item.ano}`;
      if (!acc[key]) {
        acc[key] = {
          ano: item.ano,
          faturamento_em_produtos: 0,
          faturameno_em_servicos: 0,
          total_de_faturamento: 0,
          qtd_vendas_produtos: 0,
          qtd_vendas_servicos: 0,
          total_venda_itens: 0,
          qtd_vendas_ano: 0,
          ticket_medio_anual: 0,
          faturamento_cliente_cadastrado: 0,
          faturamento_cliente_sem_cadastro: 0,
          total_faturamento_clientes: 0,
          diferenca_totais: 0,
          cliente: item.cliente,
          percent_de_evolução_ticket_medio: null,
          percent_faturamento_em_produtos: 0,
          percent_faturameno_em_servicos: 0,
          percent_evolução_faturameno_em_servicos: null,
          percent_evolução_faturamento_em_produtos: null,
          percent_evolução_total_de_faturamento: null,
          percent_faturamento_cliente_cadastrado: 0,
          percent_faturamento_cliente_sem_cadastro: 0,
        };
      }

      acc[key].faturamento_em_produtos += item.faturamento_em_produtos;
      acc[key].faturameno_em_servicos += item.faturameno_em_servicos;
      acc[key].total_de_faturamento += item.total_de_faturamento;
      acc[key].qtd_vendas_produtos += item.qtd_vendas_produtos;
      acc[key].qtd_vendas_servicos += item.qtd_vendas_servicos;
      acc[key].total_venda_itens += item.total_venda_itens;
      acc[key].qtd_vendas_ano += item.qtd_vendas_ano;
      acc[key].ticket_medio_anual += item.ticket_medio_anual;
      acc[key].faturamento_cliente_cadastrado += item.faturamento_cliente_cadastrado;
      acc[key].faturamento_cliente_sem_cadastro += item.faturamento_cliente_sem_cadastro;
      acc[key].total_faturamento_clientes += item.total_faturamento_clientes;
      acc[key].diferenca_totais += item.diferenca_totais;

      return acc;
    }, {} as Record<string, AnnualRevenue>)
  );

  // Ordena por ano
  return grouped.sort((a, b) => a.ano - b.ano);
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

  const last3QuarterlyRecurrenceMean = customerQuarterlyRecurrence.slice(-3).length > 0
    ? customerQuarterlyRecurrence.slice(-3).reduce((acc, curr) => acc + curr.taxa_recorrencia, 0) / customerQuarterlyRecurrence.slice(-3).length
    : 0;
  const currentQuarterlyRecurrence = customerQuarterlyRecurrence[customerQuarterlyRecurrence.length - 1].taxa_recorrencia;
  const lastQuarterlyRecurrence = customerQuarterlyRecurrence[customerQuarterlyRecurrence.length - 2].taxa_recorrencia;
  const last3QuarterlyRecurrenceGain = Number(((currentQuarterlyRecurrence - lastQuarterlyRecurrence) * 100 / lastQuarterlyRecurrence).toFixed(2));

  const last5AnnualRecurrenceMean = customerAnnualRecurrence.slice(-5).length > 0
  ? customerAnnualRecurrence.slice(-5).reduce((acc, curr) => acc + curr.taxa_retencao, 0) / last3AnnualRecurrence.length
  : 0;
  const currentAnnualRevenue = customerAnnualRecurrence[customerAnnualRecurrence.length - 1].taxa_retencao;
  const lastAnnualRevenue = customerAnnualRecurrence[customerAnnualRecurrence.length - 2].taxa_retencao;
  const lastAnnualRecurrenceGain = Number(((currentAnnualRevenue - lastAnnualRevenue) * 100 / lastAnnualRevenue).toFixed(2));

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
      subtitle: "vs Últimos trimestre",
      data: last3QuarterlyRecurrence,
      value: `${last3QuarterlyRecurrence[2].value}%`,
      gain: last3QuarterlyRecurrenceGain,
      xLabelMap: xLabelMapLast3QuarterlyRecurrence,
    },
    {
      type: GraphType.LINE,
      title: "Taxa de Retenção Anual",
      subtitle: "vs Último ano",
      gain: lastAnnualRecurrenceGain,
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

  const currentYearDailyRevenuesFilled = fillMissingDays(groupRevenueDailyByDate(currentYearDailyRevenues), currentYear, currentMonth);
  // const lastYearDailyRevenuesFilled = fillMissingDays(lastYearDailyRevenues, currentYear - 1, currentMonth); // TODO: Wait for API to populate last year data
  const lastYearDailyRevenuesFilled = fillMissingDays(groupRevenueDailyByDate(lastYearDailyRevenues), currentYear, currentMonth - 1);

  const annualRevenuesGrouped = groupRevenueAnnualByYear(annualRevenues);
  const monthlyRevenueGrouped = groupRevenueMonthlyByMonthYear(monthlyRevenue);
  const currentYearMonthlyRevenue = monthlyRevenueGrouped.filter(mr => mr.ano === currentYear);
  const lastYearMonthlyRevenue = monthlyRevenueGrouped.filter(mr => mr.ano === currentYear - 1);

  const xLabelMapLast5Years = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      return [year, year.toString()];
    })
  );


  if (annualRevenuesGrouped.length === 0 || monthlyRevenueGrouped.length === 0) {
    return [];
  }


  const currentProductAnnualRevenue = annualRevenuesGrouped[annualRevenuesGrouped.length - 1].faturamento_em_produtos;
  const currentServiceAnnualRevenue = annualRevenuesGrouped[annualRevenuesGrouped.length - 1].faturameno_em_servicos;

  const lastCurrentAnnualRevenue = annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
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
    : Number(((currentMonthlyAccumulated - lastYearMonthlyAccumulated) * 100 / lastYearMonthlyAccumulated).toFixed(2));

  const growthRateDaily = lastYearDailyAccumulated === 0
    ? 0
    : Number(((currentYearDailyAccumulated - lastYearDailyAccumulated) * 100 / lastYearDailyAccumulated).toFixed(2));

  let accumulatedCurrent = 0;
  let accumulatedPrevious = 0;
  const currentYearRevenuesData: { name: string; value: number }[] = [];
  const previousYearRevenuesData: { name: string; value: number }[] = [];

  for (let i = 0; i < currentMonth - 1; i++) {
    const month = i + 1;

    const current = currentYearMonthlyRevenue.find(mr => mr.mes === month)?.total_venda ?? 0;
    const previous = lastYearMonthlyRevenue.find(mr => mr.mes === month)?.total_venda ?? 0;

    // accumulatedCurrent += current;
    // accumulatedPrevious += previous;

    const name = monthNamesPt[i];

    currentYearRevenuesData.push({ name, value: current });
    previousYearRevenuesData.push({ name, value: previous });
  }

  accumulatedCurrent = 0;
  accumulatedPrevious = 0;

  const currentYearDailyRevenuesData: { name: string; value: number }[] = [];
  const lastYearDailyRevenuesData: { name: string; value: number }[] = [];

  for (let i = 0; i < currentYearDailyRevenuesFilled.length; i++) {
    if (new Date().getDate() < i + 1) {
      break;
    }
    const current = currentYearDailyRevenuesFilled[i]?.total_venda ?? 0;
    const previous = lastYearDailyRevenuesFilled[i]?.total_venda ?? 0;

    // accumulatedCurrent += current;
    // accumulatedPrevious += previous;

    const name = currentYearDailyRevenuesFilled[i].dia.toString().padStart(2, "0");

    currentYearDailyRevenuesData.push({ name, value: current });
    lastYearDailyRevenuesData.push({ name, value: previous });
  }

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


  // Ordenar por ano e mês
  const sortedMonthlyRevenue = monthlyRevenueGrouped.sort(
    (a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes
  );


  const graphs = [
    {
      type: GraphType.LINE,
      title: "Receita Anual",
      subtitle: "vs Último ano",
      data: annualRevenuesGrouped.slice(-5).map(ar => ({
        name: ar.ano.toString(),
        value: ar.total_de_faturamento,
      })),
      gain: Number(((
        annualRevenuesGrouped[annualRevenuesGrouped.length - 1].total_de_faturamento - annualRevenuesGrouped[annualRevenuesGrouped.length - 2].total_de_faturamento
      ) * 100 / annualRevenuesGrouped[annualRevenuesGrouped.length - 2].total_de_faturamento).toFixed(2)),
      value: formatCurrency(lastCurrentAnnualRevenue.total_de_faturamento),
      xLabelMap: xLabelMapLast5Years,
      tooltipFormatter: (value: number) => formatCurrency(value)
    },
    {
      type: GraphType.LINE,
      title: "Receita Mensal",
      subtitle: "vs Último mês",
      data: sortedMonthlyRevenue.slice(-5).map(mr => ({
        name: monthNamesPt[mr.mes - 1],
        value: mr.total_venda,
      })),
      value: formatCurrency(sortedMonthlyRevenue[sortedMonthlyRevenue.length - 1].total_venda),
      gain: Number(((
        sortedMonthlyRevenue[sortedMonthlyRevenue.length - 1].total_venda -
        sortedMonthlyRevenue[sortedMonthlyRevenue.length - 2].total_venda
      ) * 100 / sortedMonthlyRevenue[sortedMonthlyRevenue.length - 2].total_venda).toFixed(2)),
      xLabelMap: xLabelMapLast5Years,
      tooltipFormatter: (value: number) => formatCurrency(value)
    },
    {
      type: GraphType.LINE,
      title: "Ticket Médio",
      subtitle: "vs Último ano",
      data: annualRevenuesGrouped.slice(-5).map(ar => ({
        name: ar.ano.toString(),
        value: ar.ticket_medio_anual,
      })),
      gain: Number(((
        annualRevenuesGrouped[annualRevenuesGrouped.length - 1].ticket_medio_anual - annualRevenuesGrouped[annualRevenuesGrouped.length - 2].ticket_medio_anual
      ) * 100 / annualRevenuesGrouped[annualRevenuesGrouped.length - 2].ticket_medio_anual).toFixed(2)),
      value: formatCurrency(lastCurrentAnnualRevenue.ticket_medio_anual),
      xLabelMap: xLabelMapLast5Years,
      tooltipFormatter: (value: number) => formatCurrency(value)
    },
    {
      type: GraphType.LINE,
      title: `Receita Anual ${currentYear - 1} x ${currentYear}`,
      subtitle: `Comparação até ${(currentMonth-1).toString().padStart(2, "0")}/${currentYear}`,
      data: currentYearRevenuesData,
      secondData: previousYearRevenuesData,
      gain: growthRateMonthly,
      value: formatCurrency(currentMonthlyAccumulated),
      xLabelMap: Object.fromEntries(
        Array.from({ length: currentMonth }, (_, i) => {
          const m = (i + 1).toString().padStart(2, "0");
          return [m, m];
        })
      ),
      tooltipFormatter: (value: number) => formatCurrency(value)
    },
    {
      type: GraphType.LINE,
      // title: `Receita Mensal Acumulada ${currentYear - 1} x ${currentYear}`, // TODO: Wait for API to populate last year data
      title: `Receita Mensal ${monthNamesPt[currentMonth - 2]} x ${monthNamesPt[currentMonth-1]}`,
      subtitle: `Comparação até o dia ${currentYearDailyRevenuesFilled.length}`,
      data: currentYearDailyRevenuesData,
      secondData: lastYearDailyRevenuesData,
      gain: growthRateDaily,
      value: formatCurrency(currentYearDailyAccumulated),
      xLabelMap: Object.fromEntries(
        currentYearDailyRevenues.map(dr => {
          const d = dr.dia.toString().padStart(2, "0");
          return [d, d];
        }
      )),
      xAxisAngle: -45,
      tooltipFormatter: (value: number) => formatCurrency(value)
    },
    ...(hasToDismemberSales ? [
      {
        type: GraphType.LINE,
        title: "Valor Médio Produto",
        subtitle: "vs Último ano",
        data: annualRevenuesGrouped.filter((ar) => ar.ano > new Date().getFullYear() - 5).map(ar => ({
          name: ar.ano.toString(),
          value: ar.qtd_vendas_produtos ? Number((ar.faturamento_em_produtos / ar.qtd_vendas_produtos).toFixed(2)) : 0
        })),
        value: formatCurrency(lastCurrentAnnualRevenue.qtd_vendas_produtos ? lastCurrentAnnualRevenue.faturamento_em_produtos / lastCurrentAnnualRevenue.qtd_vendas_produtos : 0),
        gain: Number(((
          annualRevenuesGrouped[annualRevenuesGrouped.length - 1].ticket_medio_anual - annualRevenuesGrouped[annualRevenuesGrouped.length - 2].ticket_medio_anual
        ) * 100 / annualRevenuesGrouped[annualRevenuesGrouped.length - 2].ticket_medio_anual).toFixed(2)),
        xLabelMap: xLabelMapLast5Years,
        tooltipFormatter: (value: number) => formatCurrency(value)
      },
      {
        type: GraphType.LINE,
        title: "Valor Médio Serviço",
        subtitle: "vs Último ano",
        data: annualRevenuesGrouped.filter((ar) => ar.ano > new Date().getFullYear() - 5).map(ar => ({
          name: ar.ano.toString(),
          value: ar.qtd_vendas_servicos ? ar.faturameno_em_servicos / ar.qtd_vendas_servicos : 0
        })),
        value: formatCurrency(lastCurrentAnnualRevenue.qtd_vendas_servicos ? lastCurrentAnnualRevenue.faturameno_em_servicos / lastCurrentAnnualRevenue.qtd_vendas_servicos : 0),
        gain: Number(((
          annualRevenuesGrouped[annualRevenuesGrouped.length - 1].faturameno_em_servicos - annualRevenuesGrouped[annualRevenuesGrouped.length - 2].faturameno_em_servicos
        ) * 100 / annualRevenuesGrouped[annualRevenuesGrouped.length - 2].faturameno_em_servicos).toFixed(2)),
        xLabelMap: xLabelMapLast5Years,
        tooltipFormatter: (value: number) => formatCurrency(value)
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
      type: GraphType.PIE,
      title: "% SKUs por Curva ABC",
      data: [
        { name: 'Grupo A', value: Number(currentStock.percent_sku_grupo_a.toFixed(2)) },
        { name: 'Grupo B', value: Number(currentStock.percent_sku_grupo_b.toFixed(2)) },
        { name: 'Grupo C', value: Number(currentStock.percent_sku_grupo_c.toFixed(2)) },
      ],
    },
    {
      type: GraphType.PIE,
      title: "% Venda por Curva ABC",
      data: [
        { name: 'Grupo A', value: Number(currentStock.percent_venda_grupo_a.toFixed(2)) },
        { name: 'Grupo B', value: Number(currentStock.percent_venda_grupo_b.toFixed(2)) },
        { name: 'Grupo C', value: Number(currentStock.percent_venda_grupo_c.toFixed(2)) },
      ],
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
