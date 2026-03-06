'use client';

import { useEffect, useMemo, useState } from 'react';
import { ptBR } from 'date-fns/locale';
import { format, isAfter, isBefore, isSameMonth, startOfMonth } from 'date-fns';

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {
  analysisService,
  type ProductByABC,
  type ProductDetail,
} from '@/services/analysis/analysisService';

interface ProductAnalysisProps {
  product: ProductByABC;
}

type Point = { label: string; value: number; date: Date };

export const DEFAULT_COLORS = [
  '#CFE5A7',
  '#D7B79A',
  '#B894D6',
  '#DDD39B',
  '#9AB6D3',
  '#DFB1C8',
  '#BFE1B8',
  '#E6E29F',
  '#BFE2E6',
  '#C7857F',
  '#FF8C00',
] as const;

const COLOR_MAP = {
  vendas: DEFAULT_COLORS[4],
  mediaMovel3m: DEFAULT_COLORS[0],
  mediaGeral: DEFAULT_COLORS[3],
  max: DEFAULT_COLORS[9],
  min: DEFAULT_COLORS[8],
  atual: DEFAULT_COLORS[5],
  previsao: DEFAULT_COLORS[10],
} as const;

function toMonthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

function normalizeMonth(date: Date | null | undefined) {
  return date ? startOfMonth(date) : null;
}

export default function ProductAnalysis({ product }: ProductAnalysisProps) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    analysisService
      .getProductDetailById(product.id_produto)
      .then((res) => {
        if (!alive) return;
        setDetail(res);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(
          e?.message ??
            'Não foi possível carregar os detalhes do produto. Tente novamente.',
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [product.id_produto]);

  const fmtInt = (v: number | null | undefined) =>
    (v ?? 0).toLocaleString('pt-BR');

  const fmtBRL = (v: number | null | undefined) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

  const { salesSeries, forecastSeries } = useMemo(() => {
    if (!detail)
      return { salesSeries: [] as Point[], forecastSeries: [] as Point[] };

    const now = new Date();

    const months: { key: keyof ProductDetail; offset: number }[] = [
      { key: 'qtd_vendas_11m_atras', offset: 11 },
      { key: 'qtd_vendas_10m_atras', offset: 10 },
      { key: 'qtd_vendas_9m_atras', offset: 9 },
      { key: 'qtd_vendas_8m_atras', offset: 8 },
      { key: 'qtd_vendas_7m_atras', offset: 7 },
      { key: 'qtd_vendas_6m_atras', offset: 6 },
      { key: 'qtd_vendas_5m_atras', offset: 5 },
      { key: 'qtd_vendas_4m_atras', offset: 4 },
      { key: 'qtd_vendas_3m_atras', offset: 3 },
      { key: 'qtd_vendas_2m_atras', offset: 2 },
      { key: 'qtd_vendas_1m_atras', offset: 1 },
      { key: 'qtd_vendas_mes_atual', offset: 0 },
    ];

    const currentSalesSeries = months.map(({ key, offset }) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const label = format(d, 'MMM/yy', { locale: ptBR });
      const value = Number((detail as any)[key] ?? 0);
      return { label, value, date: d };
    });

    let currentForecastSeries: Point[] = [];

    if (detail.possui_previsao) {
      const forecastMonths = [
        { key: 'total_previsto_1m', offset: 1 },
        { key: 'total_previsto_2m', offset: 2 },
        { key: 'total_previsto_3m', offset: 3 },
        { key: 'total_previsto_4m', offset: 4 },
        { key: 'total_previsto_5m', offset: 5 },
        { key: 'total_previsto_6m', offset: 6 },
      ] as const;

      currentForecastSeries = forecastMonths.map(({ key, offset }, index) => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const label = format(d, 'MMM/yy', { locale: ptBR });

        const currentValue = Number((detail as any)[key] ?? 0);
        let value = currentValue;

        if (index > 0) {
          const prevKey = forecastMonths[index - 1].key;
          const prevValue = Number((detail as any)[prevKey] ?? 0);
          value = currentValue - prevValue;
        }

        return { label, value, date: d };
      });
    }

    return {
      salesSeries: currentSalesSeries,
      forecastSeries: currentForecastSeries,
    };
  }, [detail]);

  const minMonth = useMemo(
    () => (salesSeries.length ? startOfMonth(salesSeries[0].date) : null),
    [salesSeries],
  );

  const maxMonth = useMemo(
    () =>
      salesSeries.length
        ? startOfMonth(salesSeries[salesSeries.length - 1].date)
        : null,
    [salesSeries],
  );

  const validMonthKeys = useMemo(
    () => new Set(salesSeries.map((p) => toMonthKey(p.date))),
    [salesSeries],
  );

  useEffect(() => {
    if (!minMonth || !maxMonth) return;
    setPeriodStart((prev) => prev ?? minMonth);
    setPeriodEnd((prev) => prev ?? maxMonth);
  }, [minMonth, maxMonth]);

  const normalizedPeriodStart = useMemo(() => {
    if (!periodStart) return null;
    const normalized = startOfMonth(periodStart);
    return validMonthKeys.has(toMonthKey(normalized)) ? normalized : minMonth;
  }, [periodStart, validMonthKeys, minMonth]);

  const normalizedPeriodEnd = useMemo(() => {
    if (!periodEnd) return null;
    const normalized = startOfMonth(periodEnd);
    return validMonthKeys.has(toMonthKey(normalized)) ? normalized : maxMonth;
  }, [periodEnd, validMonthKeys, maxMonth]);

  const filteredSalesSeries = useMemo(() => {
    if (!salesSeries.length || !normalizedPeriodStart || !normalizedPeriodEnd) {
      return salesSeries;
    }

    const start = normalizedPeriodStart.getTime();
    const end = normalizedPeriodEnd.getTime();

    const min = Math.min(start, end);
    const max = Math.max(start, end);

    return salesSeries.filter((p) => {
      const time = startOfMonth(p.date).getTime();
      return time >= min && time <= max;
    });
  }, [salesSeries, normalizedPeriodStart, normalizedPeriodEnd]);

  const shouldShowForecast = useMemo(() => {
    if (!detail?.possui_previsao || !maxMonth || !normalizedPeriodEnd)
      return false;
    return isSameMonth(normalizedPeriodEnd, maxMonth);
  }, [detail?.possui_previsao, normalizedPeriodEnd, maxMonth]);

  const visibleForecastSeries = useMemo(() => {
    return shouldShowForecast ? forecastSeries : [];
  }, [forecastSeries, shouldShowForecast]);

  const mean = useMemo(() => {
    if (!filteredSalesSeries.length) return 0;
    const sum = filteredSalesSeries.reduce((acc, p) => acc + p.value, 0);
    return sum / filteredSalesSeries.length;
  }, [filteredSalesSeries]);

  const sma3 = useMemo(() => {
    if (!filteredSalesSeries.length) return [] as (number | null)[];
    return filteredSalesSeries.map((_, i) => {
      if (i < 2) return null;
      return (
        (filteredSalesSeries[i].value +
          filteredSalesSeries[i - 1].value +
          filteredSalesSeries[i - 2].value) /
        3
      );
    });
  }, [filteredSalesSeries]);

  const extremes = useMemo(() => {
    if (!filteredSalesSeries.length) {
      return {
        max: null as Point | null,
        min: null as Point | null,
        current: null as Point | null,
      };
    }

    let max = filteredSalesSeries[0];
    let min = filteredSalesSeries[0];

    for (const p of filteredSalesSeries) {
      if (p.value > max.value) max = p;
      if (p.value < min.value) min = p;
    }

    const current = filteredSalesSeries[filteredSalesSeries.length - 1];
    return { max, min, current };
  }, [filteredSalesSeries]);

  const chartData = useMemo(() => {
    const combinedMap = new Map<string, any>();

    filteredSalesSeries.forEach((p, i) => {
      combinedMap.set(p.label, {
        label: p.label,
        vendas: p.value,
        mediaMovel3m: sma3[i] ?? null,
        mediaGeral: mean,
        date: p.date,
      });
    });

    visibleForecastSeries.forEach((p) => {
      const existing = combinedMap.get(p.label);
      combinedMap.set(p.label, {
        ...existing,
        label: p.label,
        previsao: p.value,
        date: p.date,
      });
    });

    return Array.from(combinedMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [filteredSalesSeries, visibleForecastSeries, sma3, mean]);

  const handleChangeStart = (value: Date | null) => {
    const next = normalizeMonth(value) ?? minMonth;
    setPeriodStart(next);

    if (next && normalizedPeriodEnd && isAfter(next, normalizedPeriodEnd)) {
      setPeriodEnd(next);
    }
  };

  const handleChangeEnd = (value: Date | null) => {
    const next = normalizeMonth(value) ?? maxMonth;
    setPeriodEnd(next);

    if (
      next &&
      normalizedPeriodStart &&
      isBefore(next, normalizedPeriodStart)
    ) {
      setPeriodStart(next);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader
            title={
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                flexWrap="wrap"
              >
                <Typography variant="h6">{detail?.nome_produto}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`SKU ID: ${detail?.id_produto || '—'}`}
                    size="small"
                  />
                  <Chip
                    label={`Código: ${product.codigo_barras || '—'}`}
                    size="small"
                  />
                  <Chip label={`Curva: ${product.curva_abc}`} size="small" />
                  <Chip
                    label={`Situação: ${product.situacao_do_produto || '—'}`}
                    size="small"
                  />
                  <Chip
                    label={`Estoque: ${fmtInt(detail?.estoque_atual) || '—'}`}
                    size="small"
                  />
                </Stack>
              </Stack>
            }
            subheader={
              detail ? (
                <Stack direction="row" spacing={2} flexWrap="wrap" mt={1}>
                  <Typography variant="body2">
                    Categoria: {detail.nome_categoria ?? '—'}
                  </Typography>
                  <Typography variant="body2">
                    Última venda: {fmtDate(detail.data_ultima_venda)}
                  </Typography>
                  <Typography variant="body2">
                    Cobertura (dias): {detail.cobertura_dias ?? '—'}
                  </Typography>
                  <Typography variant="body2">
                    Cobertura 30d: {detail.cobertura_percentual ?? '—'}%
                  </Typography>
                  <Typography variant="body2">
                    Média 12m (qtd): {fmtInt(detail.qtd_media_vendas_12m)}
                  </Typography>
                  <Typography variant="body2">
                    Qtd total 12m: {fmtInt(detail.quantidade_total_12m)}
                  </Typography>
                  <Typography variant="body2">
                    Valor total 12m: {fmtBRL(detail.valor_total_12m)}
                  </Typography>
                  <Typography variant="body2">
                    Sugestão 1m: {detail.sugestao_1m}
                  </Typography>
                  <Typography variant="body2">
                    Sugestão 3m: {detail.sugestao_3m}
                  </Typography>
                  <Typography variant="body2">
                    Marca: {detail.nome_marca ?? '—'}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2">Carregando detalhes…</Typography>
              )
            }
          />
        </Card>

        {detail && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Últimas compras
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="stretch"
            >
              {[
                {
                  keyPrefix: 'ultimo',
                  title: 'Última compra',
                  price: detail.ultimo_preco_compra,
                  qty: detail.ultima_qtd_comprada,
                  supplier: detail.ultimo_fornecedor,
                  date: detail.data_ultima_compra,
                },
                {
                  keyPrefix: 'penultimo',
                  title: 'Penúltima compra',
                  price: detail.penultimo_preco_compra,
                  qty: detail.penultima_qtd_comprada,
                  supplier: detail.penultimo_fornecedor,
                  date: detail.data_penultima_compra,
                },
                {
                  keyPrefix: 'antepenultimo',
                  title: 'Antepenúltima compra',
                  price: detail.antepenultimo_preco_compra,
                  qty: detail.antepenultima_qtd_comprada,
                  supplier: detail.antepenultimo_fornecedor,
                  date: detail.data_antepenultima_compra,
                },
              ].map((c) => (
                <Card
                  key={c.keyPrefix}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant="subtitle2">{c.title}</Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        <strong>Fornecedor:</strong> {c.supplier ?? '—'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Preço:</strong> {fmtBRL(c.price)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Quantidade:</strong> {fmtInt(c.qty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Data:</strong> {fmtDate(c.date)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        <CardContent sx={{ height: 430, p: 2 }}>
          {loading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: 300 }}
            >
              <CircularProgress />
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                flexWrap="wrap"
              >
                <DatePicker
                  label="Período inicial"
                  views={['year', 'month']}
                  openTo="month"
                  format="MM/yyyy"
                  value={normalizedPeriodStart}
                  minDate={minMonth ?? undefined}
                  maxDate={maxMonth ?? undefined}
                  onChange={handleChangeStart}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { minWidth: 180 },
                    },
                  }}
                />

                <DatePicker
                  label="Período final"
                  views={['year', 'month']}
                  openTo="month"
                  format="MM/yyyy"
                  value={normalizedPeriodEnd}
                  minDate={minMonth ?? undefined}
                  maxDate={maxMonth ?? undefined}
                  onChange={handleChangeEnd}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { minWidth: 180 },
                    },
                  }}
                />

                <Stack justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Histórico disponível:{' '}
                    {minMonth ? format(minMonth, 'MM/yyyy') : '—'} até{' '}
                    {maxMonth ? format(maxMonth, 'MM/yyyy') : '—'}
                  </Typography>
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flex: 1,
                  minHeight: 0,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid />

                      {shouldShowForecast &&
                        visibleForecastSeries.length > 0 && (
                          <ReferenceArea
                            x1={visibleForecastSeries[0].label}
                            x2={
                              visibleForecastSeries[
                                visibleForecastSeries.length - 1
                              ].label
                            }
                            fill="#e0e0e0"
                            fillOpacity={0.3}
                          />
                        )}

                      <XAxis dataKey="label" />
                      <YAxis />

                      <RTooltip
                        labelFormatter={(label) => `Período: ${label}`}
                        formatter={(value: any, name: string) => {
                          const num = Number(value);
                          const formatted = Number.isNaN(num)
                            ? value
                            : num.toFixed(2);

                          if (
                            name === 'vendas' ||
                            name === 'mediaMovel3m' ||
                            name === 'mediaGeral' ||
                            name === 'previsao'
                          ) {
                            return [
                              formatted,
                              name === 'vendas'
                                ? 'Vendas (mês)'
                                : name === 'mediaMovel3m'
                                  ? 'Média móvel (3m)'
                                  : name === 'mediaGeral'
                                    ? 'Média geral'
                                    : 'Previsão (mês)',
                            ];
                          }

                          return [formatted, name];
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="vendas"
                        name="Vendas (mês)"
                        stroke={COLOR_MAP.vendas}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="mediaMovel3m"
                        name="Média móvel (3m)"
                        stroke={COLOR_MAP.mediaMovel3m}
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="mediaGeral"
                        name="Média geral"
                        stroke={COLOR_MAP.mediaGeral}
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="6 4"
                      />

                      {shouldShowForecast && (
                        <Line
                          type="monotone"
                          dataKey="previsao"
                          name="Previsão (mês)"
                          stroke={COLOR_MAP.previsao}
                          strokeWidth={2}
                          dot={false}
                        />
                      )}

                      {extremes.max && (
                        <ReferenceDot
                          x={extremes.max.label}
                          y={extremes.max.value}
                          r={5}
                          fill={COLOR_MAP.max}
                          stroke="none"
                          ifOverflow="extendDomain"
                        />
                      )}

                      {extremes.min && (
                        <ReferenceDot
                          x={extremes.min.label}
                          y={extremes.min.value}
                          r={5}
                          fill={COLOR_MAP.min}
                          stroke="none"
                          ifOverflow="extendDomain"
                        />
                      )}

                      {extremes.current && (
                        <ReferenceDot
                          x={extremes.current.label}
                          y={extremes.current.value}
                          r={5}
                          fill={COLOR_MAP.atual}
                          stroke="none"
                          ifOverflow="extendDomain"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <Box
                  sx={{
                    width: 240,
                    flexShrink: 0,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    borderRadius: 1.5,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Legenda
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.vendas,
                      }}
                    />
                    <Typography variant="body2">Vendas (mês)</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.mediaMovel3m,
                      }}
                    />
                    <Typography variant="body2">Média móvel (3m)</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.mediaGeral,
                      }}
                    />
                    <Typography variant="body2">Média geral</Typography>
                  </Stack>

                  {shouldShowForecast && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLOR_MAP.previsao,
                        }}
                      />
                      <Typography variant="body2">Previsão (mês)</Typography>
                    </Stack>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.max,
                      }}
                    />
                    <Typography variant="body2">Máximo</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.min,
                      }}
                    />
                    <Typography variant="body2">Mínimo</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLOR_MAP.atual,
                      }}
                    />
                    <Typography variant="body2">Atual</Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Box>
    </LocalizationProvider>
  );
}
