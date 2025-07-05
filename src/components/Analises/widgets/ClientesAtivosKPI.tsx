// app/components/Analises/widgets/ClientesAtivosKPI.tsx
'use client';

import { Box, Typography } from '@mui/material';

interface Cliente {
  id_cliente: number;
  segmento: string;
  [key: string]: any;
}

interface ClientesAtivosKPIProps {
  clientes: Cliente[];
}

const segmentosAtivos = new Set([
  'Campeões',
  'Fiéis Alto Valor',
  'Fiéis Baixo Valor',
  'Recentes Alto Valor',
  'Recentes Baixo Valor',
  'Novos'
]);

export default function ClientesAtivosKPI({ clientes }: ClientesAtivosKPIProps) {
  const totalAtivos = clientes.filter((c) => segmentosAtivos.has(c.segmento)).length;

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
        Clientes Ativos
      </Typography>
      <Typography fontSize="2rem" fontWeight={700} color="#4b4b4b">
        {totalAtivos}
      </Typography>
    </Box>
  );
}
