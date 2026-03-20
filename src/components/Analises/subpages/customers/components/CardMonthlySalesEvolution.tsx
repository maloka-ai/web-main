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
  useTheme,
  alpha,
  Chip,
  Checkbox,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
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

type StoreOption = {
  id: number;
  label: string;
  isGroup?: boolean;
  storeIds?: number[];
};

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

/**
 * Extrai o prefixo de um nome de loja com base em separadores comuns
 * ou as duas primeiras palavras.
 */
function getPrefix(name: string): string {
  if (!name) return '';
  const separators = [' - ', ' . ', ' : ', ' / '];
  for (const sep of separators) {
    if (name.includes(sep)) {
      return name.split(sep)[0].trim();
    }
  }
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0]} ${words[1]}`;
  }
  return '';
}

export function CardMonthlySalesEvolution({
  height = 340,
}: {
  height?: number;
}) {
  const theme = useTheme();
  const gridColor = alpha(theme.palette.divider, 0.7);
  const lineColor = alpha(theme.palette.divider, 1);
  const [raw, setRaw] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [selectedStores, setSelectedStores] = useState<StoreOption[]>([]);

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

  // Opções de loja com agrupamento dinâmico
  const storeOptions = useMemo<StoreOption[]>(() => {
    const map = new Map<number, string>();
    raw.forEach((r) => {
      if (!map.has(r.id_loja)) map.set(r.id_loja, r.nome_loja);
    });

    const individuals: StoreOption[] = Array.from(map.entries()).map(
      ([id, label]) => ({ id, label }),
    );

    // Identificar grupos por prefixo
    const prefixMap = new Map<string, number[]>();
    individuals.forEach((opt) => {
      const p = getPrefix(opt.label);
      if (p) {
        if (!prefixMap.has(p)) prefixMap.set(p, []);
        prefixMap.get(p)!.push(opt.id);
      }
    });

    const groups: StoreOption[] = [];
    prefixMap.forEach((ids, prefix) => {
      if (ids.length > 1) {
        groups.push({
          // Gerar um ID negativo único baseado no prefixo para não colidir com IDs de loja reais
          id: -Math.abs(
            prefix.split('').reduce((a, b) => a + b.charCodeAt(0), 0),
          ),
          label: `GRUPO: ${prefix}`,
          isGroup: true,
          storeIds: ids,
        });
      }
    });

    // Ordenar: Grupos primeiro, depois individuais
    return [...groups, ...individuals].sort((a, b) => {
      if (a.isGroup && !b.isGroup) return -1;
      if (!a.isGroup && b.isGroup) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [raw]);

  // Lista flat de todos os IDs de lojas selecionados (incluindo as de grupos)
  const selectedIds = useMemo(() => {
    const ids = new Set<number>();
    selectedStores.forEach((s) => {
      if (s.isGroup && s.storeIds) {
        s.storeIds.forEach((id) => ids.add(id));
      } else {
        ids.add(s.id);
      }
    });
    return Array.from(ids);
  }, [selectedStores]);

  const filtered = useMemo(
    () =>
      selectedIds.length === 0
        ? []
        : raw.filter((r) => selectedIds.includes(r.id_loja)),
    [raw, selectedIds],
  );

  const years = useMemo<number[]>(
    () =>
      selectedIds.length === 0
        ? []
        : Array.from(new Set(filtered.map((r) => r.ano))).sort((a, b) => a - b),
    [filtered, selectedIds],
  );

  const chartData = useMemo<ChartRow[]>(() => {
    if (selectedIds.length === 0) return [];

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
  }, [filtered, years, selectedIds]);

  const showChart = selectedIds.length > 0;

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
            sx={{ minWidth: 400 }}
          >
            <Autocomplete
              multiple
              size="small"
              options={storeOptions}
              disableCloseOnSelect
              value={selectedStores}
              onChange={(_, value) => {
                // Evitar redundância: se um grupo for selecionado, removemos as lojas individuais desse grupo da lista de tags
                const groups = value.filter((v) => v.isGroup);
                const filteredValue = value.filter((v) => {
                  if (v.isGroup) return true;
                  return !groups.some((g) => g.storeIds?.includes(v.id));
                });
                setSelectedStores(filteredValue);
              }}
              getOptionLabel={(o) => o.label}
              loading={loading}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              groupBy={(option) =>
                option.isGroup ? 'Grupos de Lojas' : 'Lojas Individuais'
              }
              renderOption={(props, option, { selected }) => {
                // Visualmente marcar como selecionado se a loja individual pertence a um grupo selecionado
                const isSelected =
                  selected ||
                  (!option.isGroup &&
                    selectedStores.some(
                      (s) => s.isGroup && s.storeIds?.includes(option.id),
                    ));

                return (
                  <li {...props}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={isSelected}
                    />
                    {option.label}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecionar lojas"
                  placeholder="Escolha uma ou mais lojas"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.label}
                    size="small"
                    color={option.isGroup ? 'primary' : 'default'}
                    variant={option.isGroup ? 'filled' : 'outlined'}
                  />
                ))
              }
              sx={{ width: '100%' }}
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
              Selecione uma ou mais lojas para exibir o gráfico comparativo
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
                <CartesianGrid stroke={gridColor} />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                  tickLine={{ stroke: lineColor, strokeWidth: 2 }}
                  axisLine={{ stroke: lineColor, strokeWidth: 2 }}
                />
                <YAxis
                  tickLine={{ stroke: lineColor, strokeWidth: 2 }}
                  axisLine={{ stroke: lineColor, strokeWidth: 2 }}
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
