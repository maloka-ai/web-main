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
  useTheme,
  alpha,
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
import {
  fillMissingDays,
  groupRevenueDailyByDate,
} from '@/components/Analises/helpers/CockpitHelper';

type DailyRow = {
  dia: number;
  mes: number;
  ano: number;
  total_venda: number;
  id_loja: number;
  loja: string;
};

type ChartRow = {
  dia: number;
  label: string; // '01', '02', ...
  [yearKey: string]: number | string; // "2024", "2025", ...
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const monthName = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleString('pt-BR', { month: 'long' });

const daysInMonth = (year: number, month1to12: number) =>
  new Date(year, month1to12, 0).getDate();

const makeBaseDays = (days: number): ChartRow[] =>
  Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return { dia: d, label: pad2(d) };
  });

export function CardDailySalesComparison() {
  const now = new Date();
  const theme = useTheme();
  const gridColor = alpha(theme.palette.divider, 0.7);
  const lineColor = alpha(theme.palette.divider, 1);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevYear = currentYear - 1;

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [dailyByYear, setDailyByYear] = useState<Record<number, DailyRow[]>>({
    [prevYear]: [],
    [currentYear]: [],
  });

  const monthOptions = useMemo(
    () =>
      Array.from({ length: currentMonth }, (_, i) => {
        const m = i + 1;
        return { id: m, label: monthName(m) };
      }),
    [currentMonth],
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);

    Promise.all([
      salesService.getDailyRevenueByPeriod({
        mes: selectedMonth,
        ano: prevYear,
      }),
      salesService.getDailyRevenueByPeriod({
        mes: selectedMonth,
        ano: currentYear,
      }),
    ])
      .then(([prevData, currData]) => {
        if (!mounted) return;
        setDailyByYear({
          [prevYear]: fillMissingDays(
            groupRevenueDailyByDate(prevData),
            prevYear,
            selectedMonth,
            true,
          ),
          [currentYear]: fillMissingDays(
            groupRevenueDailyByDate(currData),
            currentYear,
            selectedMonth,
            selectedMonth !== currentMonth, // preencher dias futuros do mês atual com 0
          ),
        });
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setErr('Não foi possível carregar o faturamento diário.');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [selectedMonth]);

  const years = [prevYear, currentYear];

  const maxDays = Math.max(
    daysInMonth(prevYear, selectedMonth),
    daysInMonth(currentYear, selectedMonth),
  );

  const totalsByYearDay = useMemo(() => {
    const build = (rows: DailyRow[]) => {
      const m = new Map<number, number>();
      rows.forEach((r) =>
        m.set(r.dia, (m.get(r.dia) ?? 0) + (r.total_venda ?? 0)),
      );
      return m;
    };
    return {
      [prevYear]: build(dailyByYear[prevYear]),
      [currentYear]: build(dailyByYear[currentYear]),
    };
  }, [dailyByYear, prevYear, currentYear]);

  const chartData: ChartRow[] = useMemo(() => {
    const base = makeBaseDays(maxDays);
    const today = now.getDate();
    const isCurrentMonth = selectedMonth === currentMonth;

    return base.map((row) => {
      const d = row.dia;
      const obj: ChartRow = { ...row };

      const prevVal = totalsByYearDay[prevYear].get(d);
      if (prevVal !== undefined) obj[String(prevYear)] = prevVal;

      if (isCurrentMonth && d > today) {
        // não setar nada para dias futuros do ano atual
      } else {
        const currVal = totalsByYearDay[currentYear].get(d);
        if (currVal !== undefined) obj[String(currentYear)] = currVal;
      }

      return obj;
    });
  }, [
    totalsByYearDay,
    maxDays,
    selectedMonth,
    currentMonth,
    prevYear,
    currentYear,
  ]);

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            Comparação diária — {monthName(selectedMonth)}
          </Typography>
        }
        action={
          <Autocomplete
            size="small"
            options={monthOptions}
            value={
              monthOptions.find((o) => o.id === selectedMonth) ?? undefined
            }
            onChange={(_, value) => setSelectedMonth(value?.id ?? currentMonth)}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Mês"
                placeholder="Selecione o mês"
              />
            )}
            sx={{ width: 220 }}
            disableClearable
          />
        }
      />
      <CardContent>
        {err && (
          <Box mb={2}>
            <Typography color="error">{err}</Typography>
          </Box>
        )}

        <Box sx={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke={gridColor} />
              <XAxis
                dataKey="label"
                interval={0}
                tickLine={{ stroke: lineColor, strokeWidth: 2 }}
                axisLine={{ stroke: lineColor, strokeWidth: 2 }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                width={100}
                tickLine={{ stroke: lineColor, strokeWidth: 2 }}
                axisLine={{ stroke: lineColor, strokeWidth: 2 }}
                tickFormatter={(v) => formatCurrency(Number(v))}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  String(name),
                ]}
                labelFormatter={(label) => `Dia ${label}`}
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
      </CardContent>
    </Card>
  );
}
