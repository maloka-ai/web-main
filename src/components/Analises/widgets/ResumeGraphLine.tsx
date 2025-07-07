'use client';

import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import DetailsKPI from './DetailsKPI';
import DetalheGraphLine from './DetailGraphLine';

export interface DataPoint {
  name: string;
  value: number;
}

interface ResumeGraphLineProps {
  titulo: string;
  data: DataPoint[];
  subtitulo?: string;
  valor?: string;
  gain?: number;
  xLabelMap?: Record<string, string>;
}

export default function ResumeGraphLine({
  titulo,
  subtitulo,
  valor,
  data,
  gain,
  xLabelMap,
}: ResumeGraphLineProps) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '1rem 1.25rem',
        width: '100%',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={0.5}>
          {titulo}
        </Typography>

        <IconButton
          onClick={() => setOpen(!open)}
          sx={{ color: '#f19468', width: 32, height: 32, padding: 0 }}
        >
          <OpenInFullOutlinedIcon />
        </IconButton>

        <DetalheGraphLine
          open={open}
          onClose={() => setOpen(false)}
          graph={{ titulo, subtitulo, valor, data, gain }}
        />
      </Box>

      <Box sx={{ height: 150, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, bottom: 5, left: 0, right: 0 }}>
            <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: '#666' }}
              padding={{ left: 24, right: 24 }}
              tickFormatter={(name) => xLabelMap?.[name] || name}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{ fontSize: '0.8rem' }}
              wrapperStyle={{ zIndex: 1000 }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#df8157', strokeWidth: 0.5 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#78a27f"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {subtitulo && (
        <Typography variant="body2" fontWeight={400} color="#777" mt={1}>
          {subtitulo}
          {gain && (<span
            style={{
              color: gain >= 0 ? '#4caf50' : '#f44336',
              fontWeight: 600,
            marginLeft: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          {gain >= 0 ? '+' : ''}
          {gain}%
        </span>)}
      </Typography>)}
    </Box>
  );
}
