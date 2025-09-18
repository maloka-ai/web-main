import { GraphType } from "./enums";

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

  if (!data || data.length === 0) return '#78a27f';

  let value_b;
  const value_a = data[data.length - 1].value;

  if (secondData) {
    value_b = secondData.length > 0
      ? secondData.reduce((acc, curr) => acc + curr.value, 0) / secondData.length
      : 0;
    } else if (Array.isArray(data) && data.length > 1) {
      value_b = data.length > 0
      ? data.reduce((acc, curr) => acc + curr.value, 0) / data.length
      : 0;
    } else {
      value_b = value_a;
    }

    if (value_a < value_b * 0.95 ) {
      return '#f44336';
    } else if ( value_a > value_b * 1.05) {
      return '#78a27f';
    } else {
      return '#f3b52e';
    }
}