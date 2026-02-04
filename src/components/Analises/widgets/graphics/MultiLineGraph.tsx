'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DataPoint } from '@/utils/graphics';

interface MultiLineGraphProps {
  data: Record<string, DataPoint[]>;
  colors?: Record<string, string>;
  xLabelMap?: Record<string, string>;
  hideXAxis?: boolean;
  xAxisAngle?: number;
  tooltipFormatter?: (value: number, name?: string) => string;
  xTicks?: string[];
}

/**
 * Paleta base de cores (pode ajustar depois)
 */
const COLORS = [
  '#78a27f',
  '#f3b52e',
  '#f44336',
  '#5c6bc0',
  '#26a69a',
  '#ff7043',
];

export default function MultiLineGraph({
  data,
  colors,
  xLabelMap,
  hideXAxis,
  xAxisAngle,
  tooltipFormatter,
  xTicks,
}: MultiLineGraphProps) {
  const seriesKeys = Object.keys(data);

  const baseData = data[seriesKeys[0]] ?? [];

  const mergedData = baseData.map((point, index) => {
    const row: Record<string, any> = { name: point.name };

    seriesKeys.forEach((key) => {
      row[key] = data[key][index]?.value ?? null;
    });

    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={mergedData}
        margin={{ top: 40, bottom: 10, left: 0, right: 40 }}
      >
        <XAxis
          dataKey="name"
          ticks={xTicks}
          interval={0}
          tickLine={false}
          axisLine={false}
          hide={hideXAxis}
          fontSize={12}
          tick={{ fill: '#666' }}
          tickFormatter={(name) => xLabelMap?.[name] || name}
          angle={xAxisAngle ?? 0}
        />

        <YAxis hide />

        <Tooltip
          contentStyle={{ fontSize: '0.8rem' }}
          wrapperStyle={{ zIndex: 1000 }}
          labelStyle={{ display: 'none' }}
          cursor={{ stroke: '#df8157', strokeWidth: 0.5 }}
          formatter={(value: number, name: string) =>
            tooltipFormatter ? tooltipFormatter(value, name) : value
          }
        />

        {seriesKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors?.[key] || COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
