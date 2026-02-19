import {
  AnnualRevenue,
  CustomerAnnualRecurrence,
  CustomerQuarterlyRecurrence,
  DailyRevenue,
  MonthlyRevenue,
  CustomerSegmentation,
  StockMetrics,
} from '@/services/analysis/analysisService';
import { GraphType } from '@/utils/enums';
import { formatCurrency } from '@/utils/format';
import { buildXTicksEveryNDays } from '@/utils/date';
import { AverageMonthlyDiscountItem, MonthlyGrossProfitItem, MonthlyReturnPercentageItem } from '@/services/salesService';
import { DataPoint } from '@/utils/graphics';
import { CustomerSegmentationMetric } from '@/services/customer/types';

type Graphs = {
  type: GraphType;
  title: string;
  data: any[] | string | Record<string, any[]>;
  subtitle?: string;
  info?: string;
  gain?: number;
  value?: string;
  xLabelMap?: { [key: string]: string };
  hideXAxis?: boolean;
  xAxisAngle?: number;
  secondData?: any[];
  tooltipFormatter?: (value: number, name?: string) => string;
  xTicks?: string[];
};

export function fillMissingDays(
  data: DailyRevenue[],
  year: number,
  month: number,
  fullMonth: boolean = false,
): DailyRevenue[] {
  const daysInMonth = new Date(year, month, 0).getDate(); // `month` 1-indexado
  const filled: DailyRevenue[] = [];

  for (
    let day = 1;
    day <= daysInMonth && (fullMonth || day <= new Date().getDate() - 1);
    day++
  ) {
    const found = data.find((d) => d.mes === month && d.dia === day);
    if (found) {
      filled.push(found);
    } else {
      filled.push({
        mes: month,
        total_venda: 0,
        ano: year,
        id_loja: 0,
        dia: day,
        loja: 'N/A',
      });
    }
  }

  return filled;
}

export function groupRevenueDailyByDate(data: DailyRevenue[]) {
  const grouped = Object.values(
    data.reduce(
      (acc, item) => {
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
      },
      {} as Record<string, DailyRevenue>,
    ),
  );

  return grouped.sort((a, b) =>
    a.ano !== b.ano
      ? a.ano - b.ano
      : a.mes !== b.mes
        ? a.mes - b.mes
        : a.dia - b.dia,
  );
}

function groupRevenueMonthlyByMonthYear(data: MonthlyRevenue[]) {
  const grouped = Object.values(
    data.reduce(
      (acc, item) => {
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
      },
      {} as Record<string, MonthlyRevenue>,
    ),
  );

  // Ordenar por ano, depois mês
  return grouped.sort((a, b) =>
    a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes,
  );
}

function groupRevenueAnnualByYear(data: AnnualRevenue[]) {
  const grouped = Object.values(
    data.reduce(
      (acc, item) => {
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
        acc[key].faturamento_cliente_cadastrado +=
          item.faturamento_cliente_cadastrado;
        acc[key].faturamento_cliente_sem_cadastro +=
          item.faturamento_cliente_sem_cadastro;
        acc[key].total_faturamento_clientes += item.total_faturamento_clientes;
        acc[key].diferenca_totais += item.diferenca_totais;

        return acc;
      },
      {} as Record<string, AnnualRevenue>,
    ),
  );

  // Ordena por ano
  return grouped.sort((a, b) => a.ano - b.ano);
}


const monthNamesPt = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function buildSegmentationMultiLineData(
  metrics: CustomerSegmentationMetric[],
): Record<string, DataPoint[]> {
  if (!metrics.length) return {};

  const totalKeys = Object.keys(metrics[0]).filter(
    (key) => key.startsWith('total_')
  ) as (keyof CustomerSegmentationMetric)[];

  const result: Record<string, DataPoint[]> = {};

  totalKeys.forEach((key) => {
    result[key] = [];
  });

  metrics.forEach((item) => {
    const label = `${item.mes.toString().padStart(2, '0')}/${item.ano - 2000}`;

    totalKeys.forEach((key) => {
      result[key].push({
        name: label,
        value: Number(item[key]) || 0,
      });
    });
  });

  return result;
}

export function clientsMakeGraphs(
  clients: CustomerSegmentation[],
  customerQuarterlyRecurrence: CustomerQuarterlyRecurrence[],
  customerAnnualRecurrence: CustomerAnnualRecurrence[],
  totalCustomerSegmentationMetric: CustomerSegmentationMetric[],
): Graphs[] {
  if (
    customerQuarterlyRecurrence.length < 3 ||
    customerAnnualRecurrence.length < 2
  ) {
    return [];
  }

  const last3QuarterlyRecurrence = customerQuarterlyRecurrence
    .slice(-3)
    .map((cqr) => {
      return {
        name: `${cqr.ano}Q${cqr.trimestre}`,
        value: Number(cqr.taxa_recorrencia.toFixed(2)),
      };
    });
  const xLabelMapLast3QuarterlyRecurrence: { [key: string]: string } =
    last3QuarterlyRecurrence.reduce(
      (acc, qr) => {
        acc[qr.name] = qr.name;
        return acc;
      },
      {} as { [key: string]: string },
    );

  const last3AnnualRecurrence = customerAnnualRecurrence
    .slice(-3)
    .map((cqr) => {
      return {
        name: `${cqr.ano}`,
        value: Number(cqr.taxa_retencao.toFixed(2)),
      };
    });
  const xLabelMapLast3AnnualRecurrence: { [key: string]: string } =
    last3AnnualRecurrence.reduce(
      (acc, qr) => {
        acc[qr.name] = qr.name;
        return acc;
      },
      {} as { [key: string]: string },
    );

  const currentQuarterlyRecurrence =
    customerQuarterlyRecurrence[customerQuarterlyRecurrence.length - 1]
      .taxa_recorrencia;
  const lastQuarterlyRecurrence =
    customerQuarterlyRecurrence[customerQuarterlyRecurrence.length - 2]
      .taxa_recorrencia;
  const last3QuarterlyRecurrenceGain = Number(
    (
      ((currentQuarterlyRecurrence - lastQuarterlyRecurrence) * 100) /
      lastQuarterlyRecurrence
    ).toFixed(2),
  );

  const currentAnnualRevenue =
    customerAnnualRecurrence[customerAnnualRecurrence.length - 1].taxa_retencao;
  const lastAnnualRevenue =
    customerAnnualRecurrence[customerAnnualRecurrence.length - 2].taxa_retencao;
  const lastAnnualRecurrenceGain = Number(
    (
      ((currentAnnualRevenue - lastAnnualRevenue) * 100) /
      lastAnnualRevenue
    ).toFixed(2),
  );

  const multiLineCustomerSegmentationData = buildSegmentationMultiLineData(totalCustomerSegmentationMetric);

  return [
    {
      type: GraphType.KPI,
      title: 'Clientes Ativos',
      data: clients.filter((c) => c.segmento !== 'Inativos').length.toString(),
    },
    {
      type: GraphType.LINE,
      title: 'Taxa de Recorrência Trimestral',
      subtitle: 'vs Últimos trimestre',
      data: last3QuarterlyRecurrence,
      value: `${last3QuarterlyRecurrence[2].value}%`,
      gain: last3QuarterlyRecurrenceGain,
      info: 'Taxa de recorrência trimestral dos últimos 3 trimestres.',
      xLabelMap: xLabelMapLast3QuarterlyRecurrence,
    },
    {
      type: GraphType.LINE,
      title: 'Taxa de Retenção Anual',
      subtitle: 'vs Último ano',
      gain: lastAnnualRecurrenceGain,
      info:'Clientes que continuam a comprar com o passar dos anos',
      data: last3AnnualRecurrence,
      value: `${currentAnnualRevenue.toFixed(2)}%`,
      xLabelMap: xLabelMapLast3AnnualRecurrence,
    },
    ...(totalCustomerSegmentationMetric.length > 0 ? [{
      type: GraphType.BAR,
      title: 'Segmentação de Clientes',
      data: Object.keys(multiLineCustomerSegmentationData).reduce((acc, key) => {
        const lastDataPoint = multiLineCustomerSegmentationData[key][multiLineCustomerSegmentationData[key].length - 1];
        if (lastDataPoint) {
            const formattedName = key
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            acc.push({ name: formattedName, value: lastDataPoint.value });
        }
        return acc;
      }, [] as DataPoint[]),
      info: 'Evolução dos principais segmentos de clientes ao longo do tempo.',
      xAxisAngle: -45,
    }] : [])
  ];
}

export function salesMakeGraphs(
  annualRevenues: AnnualRevenue[],
  monthlyRevenue: MonthlyRevenue[],
  currentYearDailyRevenues: DailyRevenue[],
  lastYearDailyRevenues: DailyRevenue[],
  averageMonthlyDiscount: AverageMonthlyDiscountItem[],
  monthlyGrossProfit: MonthlyGrossProfitItem[],
  monthlyReturnPercentage: MonthlyReturnPercentageItem[],
  averageMonthlyDiscountLastYear: AverageMonthlyDiscountItem[],
  monthlyGrossProfitLastYear: MonthlyGrossProfitItem[],
  monthlyReturnPercentageLastYear: MonthlyReturnPercentageItem[]
): Graphs[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const currentYearDailyRevenuesFilled = fillMissingDays(
    groupRevenueDailyByDate(currentYearDailyRevenues),
    currentYear,
    currentMonth,
  );
  // const lastYearDailyRevenuesFilled = fillMissingDays(lastYearDailyRevenues, currentYear - 1, currentMonth); // TODO: Wait for API to populate last year data
  const lastYearDailyRevenuesFilled = fillMissingDays(
    groupRevenueDailyByDate(lastYearDailyRevenues),
    currentYear,
    currentMonth,
  );

  const annualRevenuesGrouped = groupRevenueAnnualByYear(annualRevenues);
  const monthlyRevenueGrouped = groupRevenueMonthlyByMonthYear(monthlyRevenue);
  const currentYearMonthlyRevenue = monthlyRevenueGrouped.filter(
    (mr) => mr.ano === currentYear,
  );
  const lastYearMonthlyRevenue = monthlyRevenueGrouped.filter(
    (mr) => mr.ano === currentYear - 1,
  );

  const xLabelMapLast5Years = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      return [year, year.toString()];
    }),
  );

  if (
    annualRevenuesGrouped.length === 0 ||
    monthlyRevenueGrouped.length === 0
  ) {
    return [];
  }

  const currentProductAnnualRevenue =
    annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
      .faturamento_em_produtos;
  const currentServiceAnnualRevenue =
    annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
      .faturameno_em_servicos;

  const lastCurrentAnnualRevenue =
    annualRevenuesGrouped[annualRevenuesGrouped.length - 1];
  const hasToDismemberSales = !!lastCurrentAnnualRevenue.faturameno_em_servicos;

  const currentMonthlyAccumulated = currentYearMonthlyRevenue
    .filter((mr) => mr.mes <= currentMonth)
    .reduce((acc, mr) => acc + mr.total_venda, 0);

  const lastYearMonthlyAccumulated = lastYearMonthlyRevenue
    .filter((mr) => mr.mes <= currentMonth)
    .reduce((acc, mr) => acc + mr.total_venda, 0);

  const currentYearDailyAccumulated = currentYearDailyRevenuesFilled.reduce(
    (acc, dr) => acc + dr.total_venda,
    0,
  );

  const lastYearDailyAccumulated = lastYearDailyRevenuesFilled.reduce(
    (acc, dr) => acc + dr.total_venda,
    0,
  );

  const growthRateMonthly =
    lastYearMonthlyAccumulated === 0
      ? 0
      : Number(
          (
            ((currentMonthlyAccumulated - lastYearMonthlyAccumulated) * 100) /
            lastYearMonthlyAccumulated
          ).toFixed(2),
        );

  const growthRateDaily =
    lastYearDailyAccumulated === 0
      ? 0
      : Number(
          (
            ((currentYearDailyAccumulated - lastYearDailyAccumulated) * 100) /
            lastYearDailyAccumulated
          ).toFixed(2),
        );


  const currentYearRevenuesData: { name: string; value: number }[] = [];
  const previousYearRevenuesData: { name: string; value: number }[] = [];

  for (let i = 0; i < currentMonth; i++) {
    const month = i + 1;

    const current =
      currentYearMonthlyRevenue.find((mr) => mr.mes === month)?.total_venda ??
      0;
    const previous =
      lastYearMonthlyRevenue.find((mr) => mr.mes === month)?.total_venda ?? 0;


    const name = monthNamesPt[i];

    currentYearRevenuesData.push({ name, value: current });
    previousYearRevenuesData.push({ name, value: previous });
  }

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

    const name = currentYearDailyRevenuesFilled[i].dia
      .toString()
      .padStart(2, '0');

    currentYearDailyRevenuesData.push({ name, value: current });
    lastYearDailyRevenuesData.push({ name, value: previous });
  }

  const graphs = [
    {
      type: GraphType.LINE,
      title: 'Receita Anual',
      subtitle: 'vs Último ano',
      data: annualRevenuesGrouped.slice(-5).map((ar) => ({
        name: ar.ano.toString(),
        value: ar.total_de_faturamento,
      })),
      gain: Number(
        (
          ((annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
            .total_de_faturamento -
            annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
              .total_de_faturamento) *
            100) /
          annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
            .total_de_faturamento
        ).toFixed(2),
      ),
      value: formatCurrency(lastCurrentAnnualRevenue.total_de_faturamento),
      xLabelMap: xLabelMapLast5Years,
      tooltipFormatter: (value: number) => formatCurrency(value),
    },
    {
      type: GraphType.LINE,
      title: 'Ticket Médio',
      subtitle: 'vs Último ano',
      data: annualRevenuesGrouped.slice(-5).map((ar) => ({
        name: ar.ano.toString(),
        value: ar.ticket_medio_anual,
      })),
      gain: Number(
        (
          ((annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
            .ticket_medio_anual -
            annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
              .ticket_medio_anual) *
            100) /
          annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
            .ticket_medio_anual
        ).toFixed(2),
      ),
      value: formatCurrency(lastCurrentAnnualRevenue.ticket_medio_anual),
      xLabelMap: xLabelMapLast5Years,
      tooltipFormatter: (value: number) => formatCurrency(value),
    },
    {
      type: GraphType.LINE,
      title: `Receita Anual ${currentYear - 1} x ${currentYear}`,
      subtitle: `Comparação até ${(currentMonth).toString().padStart(2, '0')}/${currentYear}`,
      data: currentYearRevenuesData,
      secondData: previousYearRevenuesData,
      gain: growthRateMonthly,
      value: formatCurrency(currentMonthlyAccumulated),
      xLabelMap: Object.fromEntries(
        Array.from({ length: currentMonth }, (_, i) => {
          const m = (i + 1).toString().padStart(2, '0');
          return [m, m];
        }),
      ),
      tooltipFormatter: (value: number) => formatCurrency(value),
    },
    {
      type: GraphType.LINE,
      title: `Receita Diária ${monthNamesPt[currentMonth - 1]}/${currentYear-2001} x ${monthNamesPt[currentMonth - 1]}/${currentYear-2000}`,
      subtitle: `Comparação até o dia ${currentYearDailyRevenuesFilled.length}`,
      data: currentYearDailyRevenuesData,
      secondData: lastYearDailyRevenuesData,
      gain: growthRateDaily,
      value: formatCurrency(currentYearDailyAccumulated),
      xLabelMap: Object.fromEntries(
        currentYearDailyRevenues.map((dr) => {
          const d = dr.dia.toString().padStart(2, '0');
          return [d, d];
        }),
      ),
      xAxisAngle: -60,
      tooltipFormatter: (value: number) => formatCurrency(value),
    },
    ...(averageMonthlyDiscount.length > 0
      ? [{
        type: GraphType.LINE,
        title: 'Desconto Médio Mensal',
        data: averageMonthlyDiscount.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_desconto_medio,
        })),
        secondData: averageMonthlyDiscountLastYear.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_desconto_medio,
        })),
        value: `${
          averageMonthlyDiscount[averageMonthlyDiscount.length - 1].percentual_desconto_medio
        }%`,
        gain: averageMonthlyDiscount.length > 1 ? Number(
          (
            ((averageMonthlyDiscount[averageMonthlyDiscount.length - 1]
              .percentual_desconto_medio -
              averageMonthlyDiscount[averageMonthlyDiscount.length - 2]
                .percentual_desconto_medio) *
              100) /
            averageMonthlyDiscount[averageMonthlyDiscount.length - 2]
              .percentual_desconto_medio
          ).toFixed(2),
        ) : 0,
        xLabelMap: Object.fromEntries(
          Array.from({ length: currentMonth }, (_, i) => {
            const m = (i + 1).toString().padStart(2, '0');
            return [m, m];
          }),
        ),
        xAxisAngle: -45,
        tooltipFormatter: (value: number) => `${value.toFixed(2)}%`,
      },]
      : []),
    ...(monthlyGrossProfit.length > 0
      ? [{
        type: GraphType.LINE,
        title: 'Margem Bruta Mensal',
        data: monthlyGrossProfit.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_lucro_bruto,
        })),
        secondData: monthlyGrossProfitLastYear.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_lucro_bruto,
        })),
        value: `${monthlyGrossProfit[monthlyGrossProfit.length - 1].percentual_lucro_bruto.toFixed(2)}%`,
        gain: monthlyGrossProfit.length > 1 ? Number(
          (
            ((monthlyGrossProfit[monthlyGrossProfit.length - 1]
              .percentual_lucro_bruto -
              monthlyGrossProfit[monthlyGrossProfit.length - 2]
                .percentual_lucro_bruto) *
              100) /
            monthlyGrossProfit[monthlyGrossProfit.length - 2]
              .percentual_lucro_bruto
          ).toFixed(2),
        ) : 0,
        xLabelMap: Object.fromEntries(
          Array.from({ length: currentMonth }, (_, i) => {
            const m = (i + 1).toString().padStart(2, '0');
            return [m, m];
          }),
        ),
        xAxisAngle: -45,
        tooltipFormatter: (value: number) => `${value.toFixed(2)}%`,
      },]
      : []),
    ...(monthlyReturnPercentage.length > 0
      ? [{
        type: GraphType.LINE,
        title: 'Percentual de Devoluções Mensal',
        data: monthlyReturnPercentage.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_devolucao,
        })),
        secondData: monthlyReturnPercentageLastYear.map((d) => ({
          name: monthNamesPt[d.mes - 1],
          value: d.percentual_devolucao,
        })),
        value: `${monthlyReturnPercentage[monthlyReturnPercentage.length - 1].percentual_devolucao.toFixed(2)}%`,
        gain: monthlyReturnPercentage.length > 1 ? Number(
          (
            ((monthlyReturnPercentage[monthlyReturnPercentage.length - 1]
              .percentual_devolucao -
              monthlyReturnPercentage[monthlyReturnPercentage.length - 2]
                .percentual_devolucao) *
              100) /
            monthlyReturnPercentage[monthlyReturnPercentage.length - 2]
              .percentual_devolucao
          ).toFixed(2),
        ) : 0,
        xLabelMap: Object.fromEntries(
          Array.from({ length: currentMonth }, (_, i) => {
            const m = (i + 1).toString().padStart(2, '0');
            return [m, m];
          }),
        ),
        xAxisAngle: -45,
        tooltipFormatter: (value: number) => `${value.toFixed(2)}%`,
      },]
      : []),
    ...(hasToDismemberSales
      ? [
          {
            type: GraphType.LINE,
            title: 'Valor Médio Produto',
            subtitle: 'vs Último ano',
            data: annualRevenuesGrouped
              .filter((ar) => ar.ano > new Date().getFullYear() - 5)
              .map((ar) => ({
                name: ar.ano.toString(),
                value: ar.qtd_vendas_produtos
                  ? Number(
                      (
                        ar.faturamento_em_produtos / ar.qtd_vendas_produtos
                      ).toFixed(2),
                    )
                  : 0,
              })),
            value: formatCurrency(
              lastCurrentAnnualRevenue.qtd_vendas_produtos
                ? lastCurrentAnnualRevenue.faturamento_em_produtos /
                    lastCurrentAnnualRevenue.qtd_vendas_produtos
                : 0,
            ),
            gain: Number(
              (
                ((annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
                  .ticket_medio_anual -
                  annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
                    .ticket_medio_anual) *
                  100) /
                annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
                  .ticket_medio_anual
              ).toFixed(2),
            ),
            xLabelMap: xLabelMapLast5Years,
            tooltipFormatter: (value: number) => formatCurrency(value),
          },
          {
            type: GraphType.LINE,
            title: 'Valor Médio Serviço',
            subtitle: 'vs Último ano',
            data: annualRevenuesGrouped
              .filter((ar) => ar.ano > new Date().getFullYear() - 5)
              .map((ar) => ({
                name: ar.ano.toString(),
                value: ar.qtd_vendas_servicos
                  ? ar.faturameno_em_servicos / ar.qtd_vendas_servicos
                  : 0,
              })),
            value: formatCurrency(
              lastCurrentAnnualRevenue.qtd_vendas_servicos
                ? lastCurrentAnnualRevenue.faturameno_em_servicos /
                    lastCurrentAnnualRevenue.qtd_vendas_servicos
                : 0,
            ),
            gain: Number(
              (
                ((annualRevenuesGrouped[annualRevenuesGrouped.length - 1]
                  .faturameno_em_servicos -
                  annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
                    .faturameno_em_servicos) *
                  100) /
                annualRevenuesGrouped[annualRevenuesGrouped.length - 2]
                  .faturameno_em_servicos
              ).toFixed(2),
            ),
            xLabelMap: xLabelMapLast5Years,
            tooltipFormatter: (value: number) => formatCurrency(value),
          },
        ]
      : []),
    ...(hasToDismemberSales
      ? [
          {
            type: GraphType.KPI,
            title: 'Faturamento Produto Anual',
            data: formatCurrency(currentProductAnnualRevenue),
          },
          {
            type: GraphType.KPI,
            title: 'Faturamento Serviço Anual',
            data: formatCurrency(currentServiceAnnualRevenue),
          },
        ]
      : []),
  ];
  return graphs;
}

export function stockMakeGraphs(stock: StockMetrics[]): Graphs[] {
  if (stock.length === 0) {
    return [];
  }

  const currentStock = stock[stock.length - 1];
  let findRupturaInfo = false;
  const rupturaPercentages = stock.map((s) => {
    const totalSemEstoque =
      s.total_sku_grupo_a_sem_estoque +
      s.total_sku_grupo_b_sem_estoque +
      s.total_sku_grupo_c_sem_estoque;
    const totalAtivo =
      s.total_sku_grupo_a + s.total_sku_grupo_b + s.total_sku_grupo_c;
    const rupturaPercentage =
      totalAtivo > 0
        ? (totalSemEstoque / totalAtivo) * 100
        : 0;
    // Obtem dia/mes da data_hora_analise
    const date = new Date(s.data_hora_analise);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    return {
      name: `${dia}/${mes}`,
      value: Number(rupturaPercentage.toFixed(2)),
    };
  }).filter((s) => {
    if (!findRupturaInfo && s.value > 0) {
      findRupturaInfo = true;
    }
    return findRupturaInfo;
  });

  return [
    {
      type: GraphType.KPI,
      title: 'Valor Total Em Estoque',
      data: formatCurrency(currentStock.custo_total_estoque_positivo),
      info: 'Estoque Disponível em Preço de Custo',
    },
    {
      type: GraphType.KPI,
      title: 'Total de SKUs Ativas',
      info: 'Total de SKUs com venda nos últimos 90 dias',
      data: (
        currentStock.total_sku_grupo_a +
        currentStock.total_sku_grupo_b +
        currentStock.total_sku_grupo_c
      ).toString(),
    },
    {
      type: GraphType.PIE,
      title: '% SKUs por Curva ABC',
      info: 'Total de SKUs por Curva ABC',
      data: [
        {
          name: 'Grupo A',
          value: Number(currentStock.percent_sku_grupo_a.toFixed(2)),
        },
        {
          name: 'Grupo B',
          value: Number(currentStock.percent_sku_grupo_b.toFixed(2)),
        },
        {
          name: 'Grupo C',
          value: Number(currentStock.percent_sku_grupo_c.toFixed(2)),
        },
      ],
    },
    {
      type: GraphType.PIE,
      title: '% Venda por Curva ABC',
      info: 'Representatividade nas Vendas por Curva ABC',
      data: [
        {
          name: 'Grupo A',
          value: Number(currentStock.percent_venda_grupo_a.toFixed(2)),
        },
        {
          name: 'Grupo B',
          value: Number(currentStock.percent_venda_grupo_b.toFixed(2)),
        },
        {
          name: 'Grupo C',
          value: Number(currentStock.percent_venda_grupo_c.toFixed(2)),
        },
      ],
    },
    {
      type: GraphType.LINE,
      title: '% Ruptura (Estoque ativo)',
      info: 'Total de SKUs da Curva ABC com estoque zero',
      data: rupturaPercentages,
      value: `${Number(rupturaPercentages.slice(-1)[0].value.toFixed(2))}%`,
      xAxisAngle: -45,
      xTicks: buildXTicksEveryNDays(rupturaPercentages, 14),
    },
  ];
}
