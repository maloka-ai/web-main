import { GraphType } from './enums';
import { useTheme } from '@mui/material/styles';

import * as htmlToImage from 'html-to-image';

export interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

export type BarDatum = DataPoint & { secondValue?: number };

export interface GraphData {
  type: GraphType;
  title?: string;
  data: BarDatum[];
  subtitle?: string;
  value?: string;
  gain?: number;
  info?: string;
  xLabelMap?: Record<string, string>;
  hideXAxis?: boolean;
  xAxisAngle?: number;
  secondData?: { name: string; value: number }[];
  legendTitle?: string;
  sampleLabel?: string;
  secondValueLabel?: string;
  height?: number;
  barColors?: string[];
  tooltipFormatter?: (value: number, name?: string) => string;
  secondValueFormatter?: (value: number) => string;
  onBarSelected?: (name: string) => void;
  dataKey?: string;
}

export function getStrokeColor(data: DataPoint[], secondData?: DataPoint[]) {
  if (!data || data.length === 0) return '#75aad0';

  let value_b;
  const value_a = data[data.length - 1].value;

  if (secondData) {
    value_b =
      secondData.length > 0
        ? secondData.reduce((acc, curr) => acc + curr.value, 0) /
          secondData.length
        : 0;
  } else if (Array.isArray(data) && data.length > 1) {
    value_b =
      data.length > 0
        ? data.reduce((acc, curr) => acc + curr.value, 0) / data.length
        : 0;
  } else {
    value_b = value_a;
  }

  if (value_a < value_b * 0.95) {
    return '#d13d3d';
  } else if (value_a > value_b * 1.05) {
    return '#7a9b53';
  } else {
    return '#dcd98d';
  }
}

export function useGetStrokeColor() {
  function getStrokeColor(data: DataPoint[], secondData?: DataPoint[]) {
    const theme = useTheme();

    if (!data || data.length === 0) return '#75aad0';

    let value_b;
    const value_a = data[data.length - 1].value;

    if (secondData) {
      value_b =
        secondData.length > 0
          ? secondData.reduce((acc, curr) => acc + curr.value, 0) /
            secondData.length
          : 0;
    } else if (Array.isArray(data) && data.length > 1) {
      value_b =
        data.length > 0
          ? data.reduce((acc, curr) => acc + curr.value, 0) / data.length
          : 0;
    } else {
      value_b = value_a;
    }

    if (value_a < value_b * 0.95) {
      return theme.palette.error.main;
    } else if (value_a > value_b * 1.05) {
      return theme.palette.success.main;
    } else {
      return theme.palette.warning.main;
    }
  }
  return getStrokeColor;
}



export function downloadChartAsImage(container: HTMLElement) {
  const chartEl = container.querySelector(
    '.recharts-responsive-container'
  ) as HTMLElement | null;

  if (!chartEl) {
    alert('Gráfico não encontrado para exportação.');
    return;
  }

  htmlToImage
    .toPng(chartEl, {
      backgroundColor: '#ffffff',
      pixelRatio: 2, // melhora qualidade
    })
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'grafico.png';
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error('Erro ao exportar gráfico', err);
      alert('Erro ao exportar gráfico.');
    });
}

