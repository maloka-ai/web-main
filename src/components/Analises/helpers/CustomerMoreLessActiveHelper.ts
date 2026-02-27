import { GraphType } from '@/utils/enums';
import { BarDatum, GraphData } from '@/utils/graphics';
import { CustomerSegmentationResumeMetric } from '@/services/customer/types';

const enum ClientSegmentation {
  CAMPEAO = 'CAMPEAO',
  INATIVO = 'INATIVO',
  SUMIDO = 'SUMIDO',
  FIEL_BAIXO_VALOR = 'FIEL_BAIXO_VALOR',
  FIEL_ALTO_VALOR = 'FIEL_ALTO_VALOR',
  RECENTE_BAIXO_VALOR = 'RECENTE_BAIXO_VALOR',
  RECENTE_ALTO_VALOR = 'RECENTE_ALTO_VALOR',
  NOVO = 'NOVO',
  TODOS = 'TODOS',
}

const KeysResumeMetric = {
  [ClientSegmentation.TODOS]: {
    key_resume: 'total_geral',
    label: 'Todos',
  },
  [ClientSegmentation.CAMPEAO]: {
    key_resume: 'total_campeoes',
    label: 'Campeões',
  },
  [ClientSegmentation.INATIVO]: {
    key_resume: 'total_inativos',
    label: 'Inativos',
  },
  [ClientSegmentation.SUMIDO]: {
    key_resume: 'total_sumidos',
    label: 'Sumidos',
  },
  [ClientSegmentation.FIEL_BAIXO_VALOR]: {
    key_resume: 'total_fieis_baixo_valor',
    label: 'Fiéis Baixo Valor',
  },
  [ClientSegmentation.FIEL_ALTO_VALOR]: {
    key_resume: 'total_fieis_alto_valor',
    label: 'Fiéis Alto Valor',
  },
  [ClientSegmentation.RECENTE_BAIXO_VALOR]: {
    key_resume: 'total_recentes_baixo_valor',
    label: 'Recentes Baixo Valor',
  },
  [ClientSegmentation.RECENTE_ALTO_VALOR]: {
    key_resume: 'total_recentes_alto_valor',
    label: 'Recentes Alto Valor',
  },
  [ClientSegmentation.NOVO]: {
    key_resume: 'total_novos',
    label: 'Novos',
  },
} as Record<
  ClientSegmentation,
  { label: string; key_resume: keyof CustomerSegmentationResumeMetric }
>;

export function makeSegmentationCustomerGraphs(
  resumeSegmentations: CustomerSegmentationResumeMetric[],
) {
  const graphs: GraphData[] = [];

  const actualSegmentation = resumeSegmentations.length
    ? resumeSegmentations[resumeSegmentations.length - 1]
    : null;
  const segments: BarDatum[] = !!actualSegmentation
    ? Object.values(KeysResumeMetric).map(({ key_resume, label }) => ({
        name: label,
        value: Number(actualSegmentation[key_resume]),
      }))
    : [];
  // const actualSegmentation = resumeSegmentations.length
  //   ? resumeSegmentations[resumeSegmentations.length - 1]
  //   : [];
  // const segments: BarDatum[] = actualSegmentation;
  // Object.entries(segmentMap).map(([name, { value, secondValue }]) => ({
  //   name,
  //   value,
  //   secondValue: value > 0 ? secondValue / value : 0, // Average ticket
  // }));

  graphs.push({
    type: GraphType.BAR,
    title: 'Segmentação de Clientes',
    data: segments,
    legendTitle: 'Segmentos',
    sampleLabel: 'Clientes',
    height: 400,
    tooltipFormatter: (v) => v.toLocaleString('pt-BR', { style: 'decimal' }),
    secondValueFormatter: (v) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    xAxisAngle: -45,
  });

  return graphs;
}
