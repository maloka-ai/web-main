'use client';

import { Box, Typography } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export interface RetencaoAnual {
  ano: string;
  taxa: number;
}

interface GraficoRetencaoAnualProps {
  data: RetencaoAnual[];
}

export default function GraficoRetencaoAnual({ data }: GraficoRetencaoAnualProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: 270,
        height: 250,
      }}
    >
      <Typography fontSize="0.9rem" color="#888" mb={1}>
        Taxa de Retenção Anual (%)
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data.map(item => ({ ...item, taxaPercentual: item.taxa * 100 }))}
          margin={{ top: 10, bottom: 20, left: 10, right: 10 }}
        >
          <XAxis
            dataKey="ano"
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 20, right: 10 }}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            formatter={(value: any) => `${value.toFixed(1)}%`}
            labelStyle={{ display: 'none' }}
            contentStyle={{ fontSize: '0.75rem' }}
          />
          <Line
            type="monotone"
            dataKey="taxaPercentual"
            stroke="#df8157"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, fill: '#fdfcf7', stroke: '#df8157' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
