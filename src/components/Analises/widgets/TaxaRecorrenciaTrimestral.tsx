// app/components/Analises/widgets/TaxaRecorrenciaTrimestral.tsx
'use client';

import { Box, Typography, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, getQuarter, getYear } from 'date-fns';

interface Compra {
  id_cliente: number;
  data_compra: string;
}

interface TaxaRecorrenciaTrimestralProps {
  compras: Compra[];
}

function getTrimestreKey(date: Date) {
  return `${getYear(date)}/T${getQuarter(date)}`;
}

export default function TaxaRecorrenciaTrimestral({ compras }: TaxaRecorrenciaTrimestralProps) {
  // 1. Agrupar clientes por trimestre
  const trimestreMap = new Map<string, Set<number>>();

  compras.forEach((compra) => {
    const date = parseISO(compra.data_compra);
    const key = getTrimestreKey(date);
    if (!trimestreMap.has(key)) trimestreMap.set(key, new Set());
    trimestreMap.get(key)!.add(compra.id_cliente);
  });

  // 2. Ordenar trimestres cronologicamente
  const trimestres = Array.from(trimestreMap.keys()).sort();

  // 3. Calcular taxas de recorrência
  const chartData = trimestres.slice(-3).map((trimestre, i, arr) => {
    const atual = trimestreMap.get(trimestre)!;
    const anterior = i === 0 ? new Set<number>() : trimestreMap.get(arr[i - 1]) ?? new Set<number>();

    const recorrentes = [...atual].filter((id) => anterior.has(id));
    const taxa = atual.size > 0 ? (recorrentes.length / atual.size) * 100 : 0;

    return {
      name: trimestre,
      value: Number(taxa.toFixed(1))
    };
  });

  return (
    <Box
      sx={{
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        height: '250px'
      }}
    >
      <Typography fontSize="0.85rem" color="#999">
        Taxa de Recorrência Trimestral (%)
      </Typography>
      <Box sx={{ flex: 1, color: '#000' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" padding={{ left: 30, right: 10 }}/>
            <YAxis hide domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="value" stroke="#df8157" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
