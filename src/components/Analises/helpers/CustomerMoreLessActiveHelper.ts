import { CustomerSegmentation } from "@/services/analysisService";
import { GraphType } from "@/utils/enums";
import { BarDatum, GraphData } from "@/utils/graphics";

export function makeSegmentationCustomerGraphs(data: CustomerSegmentation[]) {
  const graphs: GraphData[] = [];

  // Group clients by segment
  const segmentMap: Record<string, { value: number; secondValue: number }> = {};
  data.forEach((item) => {
    if (segmentMap[item.segmento]) {
      segmentMap[item.segmento]['value'] += 1;
      segmentMap[item.segmento]['secondValue'] += item.valor_monetario || 0;
    } else {
      segmentMap[item.segmento] = { value: 1, secondValue: item.valor_monetario || 0 };
    }
  });

  const segments: BarDatum[] = Object.entries(segmentMap).map(([name, { value, secondValue }]) => ({
    name,
    value,
    secondValue: value > 0 ? secondValue / value : 0, // Average ticket
  }));

  graphs.push({
    type: GraphType.BAR,
    title: 'Segmentação de Clientes',
    data: segments,
    legendTitle: 'Segmentos',
    sampleLabel: 'Clientes',
    secondValueLabel: 'Ticket Médio',
    height: 400,
    tooltipFormatter: (v) => v.toLocaleString('pt-BR', { style: 'decimal' }),
    secondValueFormatter: (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    xAxisAngle: -45,
  });

  return graphs;
}