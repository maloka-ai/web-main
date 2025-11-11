'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '@/utils/graphics';
import { useTheme } from '@mui/material/styles';

interface ResumeGraphPieProps {
  data: DataPoint[];
  tooltipFormatter?: (value: number, name?: string) => string;
}

export default function ResumeGraphPie({
  data,
  tooltipFormatter,
}: ResumeGraphPieProps) {
  const theme = useTheme();
  const defaultColors = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={60}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) =>
            tooltipFormatter
              ? tooltipFormatter(value, name)
              : `${value.toFixed(2)}%`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
