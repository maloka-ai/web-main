'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { DataPoint, getStrokeColor } from '@/utils/graphics';

interface LineGraphProps {
  data: DataPoint[];
  xLabelMap?: Record<string, string>;
  hideXAxis?: boolean;
  xAxisAngle?: number;
  secondData?: DataPoint[];
  tooltipFormatter?: (value: number, name?: string) => string;
}

export default function LineGraph({
  data,
  xLabelMap,
  hideXAxis,
  xAxisAngle,
  secondData,
  tooltipFormatter,
}: LineGraphProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: secondData ? 80 : 40, bottom: 10, left: 0, right: 0 }}
      >
        <XAxis
          dataKey="name"
          interval={0}
          tickLine={false}
          axisLine={false}
          hide={hideXAxis}
          fontSize={12}
          tick={{ fill: '#666' }}
          padding={{ left: 24, right: 24 }}
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
        <Line
          type="monotone"
          dataKey="value"
          stroke={getStrokeColor(data, secondData)}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
        {secondData && (
          <Line
            type="monotone"
            dataKey="value"
            data={secondData}
            stroke="#ccc"
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
