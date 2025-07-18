'use client';

import { useState } from 'react';
import { Box, Icon, IconButton, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, DotProps } from 'recharts';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import DetailsKPI from './DetailsKPI';

interface ResumeKPIProps {
  titulo: string;
  subtitulo?: string;
  valor?: string;
  gain?: number;
  data: string;
}

export default function ResumeKPI({ titulo, subtitulo, valor, data, gain }: ResumeKPIProps) {

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
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={0.5}>
          {titulo}
        </Typography>

        <IconButton
          onClick={() => setOpen(!open)}

          sx={{ color: '#f19468', width: 32, height: 32, padding: 0}}>
          <OpenInFullOutlinedIcon />
        </IconButton>

        <DetailsKPI
          open={open}
          onClose={() => setOpen(false)}
          kpi={{ titulo, data }}
        />

      </Box>
      <Box sx={{ height: 150, width: '100%' }}>
        <Typography fontSize="auto" fontWeight={700} color="#78a27f"
          sx={{
            maxWidth: '100%', // ou um valor como '240px'
            fontSize: 'clamp(1rem, 1.8vw, 2rem)',
            lineHeight: 1.2,
            textAlign: 'start',
          }}
        >
          {data}
        </Typography>
      </Box>
      {subtitulo && (<Typography variant="body2" fontWeight={400} color="#777" mt={1}>
        {subtitulo}
        {gain && (<span style={{ color: gain >= 0 ? '#4caf50' : '#f44336', fontWeight: 600, marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
          {gain >= 0 ? '+' : ''}{gain}%
        </span>)}
      </Typography>)}
    </Box>
  );
}
