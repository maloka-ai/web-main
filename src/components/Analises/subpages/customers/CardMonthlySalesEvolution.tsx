'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Stack,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import { salesService } from '@/services/salesService';
import { DEFAULT_COLORS } from '@/components/Analises/subpages/stock-management/ProductAnalysis';
import { formatCurrency } from '@/utils/format';

type MonthlyRow = {
  id: number;
  mes: number;
  id_loja: number;
  total_venda: number;
  ano: number;
  nome_loja: string;
  cliente: string;
};

type StoreOption = { id: number; label: string };

type ChartRow = {
  mes: number;
  label: string;
  [yearKey: string]: number | string;
};

const monthLabel = (m: number) =>
  new Date(2000, m - 1, 1)
    .toLocaleString('pt-BR', { month: 'short' })
    .replace('.', '');

const baseMonths: ChartRow[] = Array.from({ length: 12 }, (_, i) => ({
  mes: i + 1,
  label: monthLabel(i + 1),
}));

export function CardMonthlySalesEvolution({
  height = 340,
}: {
  height?: number;
}) {
  const [raw, setRaw] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);

    salesService
      .getMonthlyRevenue()
      .then((res) => {
        if (!mounted) return;
        setRaw(res as unknown as MonthlyRow[]);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setErr('Não foi possível carregar o faturamento mensal.');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // Opções de loja
  const storeOptions = useMemo<StoreOption[]>(() => {
    const map = new Map<number, string>();
    raw.forEach((r) => {
      if (!map.has(r.id_loja)) map.set(r.id_loja, r.nome_loja);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [raw]);

  const selectedStoreId = selectedStore?.id ?? null;

  const filtered = useMemo(
    () =>
      selectedStoreId == null
        ? []
        : raw.filter((r) => r.id_loja === selectedStoreId),
    [raw, selectedStoreId],
  );

  const years = useMemo<number[]>(
    () =>
      selectedStoreId == null
        ? []
        : Array.from(new Set(filtered.map((r) => r.ano))).sort((a, b) => a - b),
    [filtered, selectedStoreId],
  );

  const chartData = useMemo<ChartRow[]>(() => {
    if (selectedStoreId == null) return [];

    const rows = baseMonths.map((m) => ({ ...m }));

    years.forEach((year) => {
      for (let month = 1; month <= 12; month++) {
        const filteredMonth = filtered.filter(
          (r) => r.ano === year && r.mes === month,
        );
        if (filteredMonth.length === 0) continue;
        const totalMonth = filteredMonth.reduce(
          (acc, it) => acc + (it.total_venda ?? 0),
          0,
        );
        rows[month - 1][String(year)] = totalMonth;
      }
    });

    return rows;
  }, [filtered, years, selectedStoreId]);

  const showChart = selectedStoreId != null;

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            Evolução das Vendas Mensais
          </Typography>
        }
        action={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 320 }}
          >
            <Autocomplete
              size="small"
              options={storeOptions}
              value={selectedStore}
              onChange={(_, value) => setSelectedStore(value)}
              getOptionLabel={(o) => o.label}
              loading={loading}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecionar loja"
                  placeholder="Escolha uma loja"
                />
              )}
              sx={{ width: 320 }}
            />
          </Stack>
        }
      />
      <CardContent>
        {err && (
          <Box mb={2}>
            <Typography color="error">{err}</Typography>
          </Box>
        )}

        {!showChart && (
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              borderRadius: 1,
              border: (t) => `1px dashed ${t.palette.divider}`,
            }}
          >
            <Typography variant="body2">
              Selecione uma loja para exibir o gráfico
            </Typography>
          </Box>
        )}

        {showChart && (
          <Box sx={{ width: '100%', height }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  width={100}
                  tickFormatter={(v) => formatCurrency(Number(v))}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    String(name),
                  ]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                {years.map((y, i) => (
                  <Line
                    key={y}
                    type="monotone"
                    dataKey={String(y)}
                    name={String(y)}
                    stroke={DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={!loading}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
