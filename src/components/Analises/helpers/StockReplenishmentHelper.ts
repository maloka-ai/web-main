import { StockSituation } from '@/services/analysis/analysisService';
import { GraphType } from '@/utils/enums';
import { BarDatum, GraphData } from '@/utils/graphics';
import { GRAPH_ALL_LABEL } from '../widgets/graphics';


export function makeStockReplenishmentGraphs(data: StockSituation[]) {
  const graphs: GraphData[] = [];

  // Group clients by segment
  const segmentMap: Record<
    string,
    { value: number; secondValue: number; labelBar: string }
  > = {};
  segmentMap[GRAPH_ALL_LABEL] = { value: 0, secondValue: 100, labelBar: '' };
  data.forEach(({ criticidade, quantidade, porcentagem }) => {
    if (!segmentMap[criticidade]) {
      segmentMap[criticidade] = { value: 0, secondValue: 0, labelBar: '' };
    }
    segmentMap[criticidade].value += quantidade;
    segmentMap[criticidade].secondValue += porcentagem;
    segmentMap[criticidade].labelBar =
      `${quantidade}  (${porcentagem.toFixed(2)}%)`;

    segmentMap[GRAPH_ALL_LABEL].value += quantidade;
  });
  segmentMap[GRAPH_ALL_LABEL].labelBar =
    `${segmentMap[GRAPH_ALL_LABEL].value}  (${
      segmentMap[GRAPH_ALL_LABEL].secondValue.toFixed(2)
    }%)`;


  const segments: BarDatum[] = Object.entries(segmentMap).map(
    ([name, { value }]) => ({
      name,
      value,
      labelBar: segmentMap[name].labelBar,
    }),
  );

  graphs.push({
    type: GraphType.BAR,
    title: 'Produtos por Nível de Cobertura',
    data: segments,
    legendTitle: 'Nível de Cobertura',
    sampleLabel: 'Quantidade',
    height: 450,
    tooltipFormatter: (v) => v.toLocaleString('pt-BR', { style: 'decimal' }),
    xAxisAngle: -45,
    dataKey: 'labelBar',
  });

  return graphs;
}
