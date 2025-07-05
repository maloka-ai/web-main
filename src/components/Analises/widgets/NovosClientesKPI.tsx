// app/components/Analises/widgets/NovosClientesKPI.tsx
'use client';

import { Box, Typography } from '@mui/material';

interface Cliente {
  id_cliente: number;
  segmento: string;
  [key: string]: any;
}

interface NovosClientesKPIProps {
  clientes: Cliente[];
}

export default function NovosClientesKPI({ clientes }: NovosClientesKPIProps) {
  const totalNovos = clientes.filter((c) => c.segmento === 'Novos').length;

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
      <Typography fontSize="0.85rem" color="#999">
        Novos Clientes
      </Typography>
      <Typography fontSize="2rem" fontWeight={700} color="#4b4b4b">
        {totalNovos}
      </Typography>
    </Box>
  );
}
