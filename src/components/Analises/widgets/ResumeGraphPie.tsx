'use client';

import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import DetailsKPI from './DetailsKPI';
import DetalheGraphLine from './DetailGraphLine';

export interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface ResumeGraphPieProps {
  titulo: string;
  data: PieDataPoint[];
  subtitulo?: string;
  valor?: string;
  gain?: number;
  tooltipFormatter?: (value: number, name?: string) => string;
}

const defaultColors = ['#4caf50', '#f3b52e', '#f44336'];

export default function ResumeGraphPie({
  titulo,
  data,
  subtitulo,
  valor,
  gain,
  tooltipFormatter,
}: ResumeGraphPieProps) {
  const [open, setOpen] = useState(false);

  const total = data.reduce((acc, item) => acc + item.value, 0);

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

      {valor !== "undefined" && (
        <Typography
          fontSize="auto"
          fontWeight={700}
          sx={{
            maxWidth: '100%',
            fontSize: 'clamp(1rem, 1.8vw, 2rem)',
            lineHeight: 1.2,
            textAlign: 'start',
            color: '#4caf50',
          }}
        >
          {valor}
        </Typography>
      )}

      <Box sx={{ height: 200, width: '100%' }}>
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
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
                tooltipFormatter ? tooltipFormatter(value, name) : `${value.toFixed(2)}%`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {subtitulo && (
        <Typography variant="body2" fontWeight={400} color="#777" mt={1}>
          {subtitulo}
          {gain && (
            <span
              style={{
                color: gain >= 0 ? '#4caf50' : '#f44336',
                fontWeight: 600,
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              {gain >= 0 ? '+' : ''}
              {gain}%
            </span>
          )}
        </Typography>
      )}
    </Box>
  );
}
