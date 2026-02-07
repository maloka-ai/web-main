'use client';

import { useEffect, useMemo, useState } from 'react';
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
  '#FF8C00', // Dark Orange
] as const;

const COLOR_MAP = {
  vendas: DEFAULT_COLORS[4], // azul suave
  mediaMovel3m: DEFAULT_COLORS[0], // verde claro
  mediaGeral: DEFAULT_COLORS[3], // amarelo pálido (linha de referência)
  max: DEFAULT_COLORS[9], // vermelho terroso
  min: DEFAULT_COLORS[8], // ciano claro
  atual: DEFAULT_COLORS[5], // rosa claro
  previsao: DEFAULT_COLORS[10], // Dark Orange
} as const;

export default function ProductAnalysis({ product }: ProductAnalysisProps) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [product.id_produto]);

  // --- Helpers
  const fmtInt = (v: number | null | undefined) =>
    (v ?? 0).toLocaleString('pt-BR');
  const fmtBRL = (v: number | null | undefined) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

  const { salesSeries, forecastSeries } = useMemo(() => {
    if (!detail) return { salesSeries: [], forecastSeries: [] };

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
      const label = d.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      }); // ex: set/25
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
      ];

      currentForecastSeries = forecastMonths.map(({ key, offset }) => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const label = d.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        });
        const value = Number((detail as any)[key] ?? 0);
        return { label, value, date: d };
      });
    }

    return { salesSeries: currentSalesSeries, forecastSeries: currentForecastSeries };
  }, [detail]);

  // Combine sales and forecast for the chart
  const series = useMemo(() => {
    const combinedSeriesMap = new Map<string, Point>();
    salesSeries.forEach((p: any) => combinedSeriesMap.set(p.label, p));
    forecastSeries.forEach((p: any) => {
      // For forecast points, we also want to keep the sales value if it exists for the same month
      const existing = combinedSeriesMap.get(p.label);
      combinedSeriesMap.set(p.label, { ...p, value: existing?.value ?? null });
    });

    return Array.from(combinedSeriesMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [salesSeries, forecastSeries]);

  // --- Estatísticas / linhas auxiliares
  const mean = useMemo(() => {
    if (!salesSeries.length) return 0;
    const sum = salesSeries.reduce((acc: number, p: Point) => acc + p.value, 0);
    return sum / salesSeries.length;
  }, [salesSeries]);

  // média móvel simples de 3 meses (SMA-3)
  const sma3 = useMemo(() => {
    if (!salesSeries.length) return [] as (number | null)[];
    const out: (number | null)[] = salesSeries.map((_, i) => {
      if (i < 2) return null;
      const v =
        (salesSeries[i].value + salesSeries[i - 1].value + salesSeries[i - 2].value) / 3;
      return v;
    });
    return out;
  }, [salesSeries]);

  const extremes = useMemo(() => {
    // Extremes should only consider sales data
    if (!salesSeries.length)
      return {
        max: null as Point | null,
        min: null as Point | null,
        current: null as Point | null,
      };
    let max = salesSeries[0],
      min = salesSeries[0];
    for (const p of salesSeries) {
      if (p.value > max.value) max = p;
      if (p.value < min.value) min = p;
    }
    const current = salesSeries[salesSeries.length - 1];
    return { max, min, current };
  }, [salesSeries]);

  const chartData = useMemo(() => {
    const combinedMap = new Map<string, any>();

    // Add sales data first
    salesSeries.forEach((p, i) => {
      combinedMap.set(p.label, {
        label: p.label,
        vendas: p.value,
        mediaMovel3m: sma3[i] ?? null,
        mediaGeral: mean,
        date: p.date, // Keep date for sorting
      });
    });

    // Add forecast data, merging with existing sales data if labels overlap
    forecastSeries.forEach((p) => {
      const existing = combinedMap.get(p.label);
      combinedMap.set(p.label, {
        ...existing, // Keep sales data if exists for this month
        label: p.label,
        previsao: p.value,
        date: p.date, // Keep date for sorting
      });
    });

    // Ensure chartData is sorted by date
    return Array.from(combinedMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [salesSeries, forecastSeries, sma3, mean]);

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* Header com dados do produto */}
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
              <Typography variant="h6">{product.nome_produto}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`SKU ID: ${product.id_produto}`} size="small" />
                <Chip
                  label={`Código: ${product.codigo_barras || '—'}`}
                  size="small"
                />
                <Chip label={`Curva: ${product.curva_abc}`} size="small" />
                <Chip
                  label={`Situação: ${product.situacao_do_produto}`}
                  size="small"
                />
                <Chip
                  label={`Estoque: ${fmtInt(product.qt_estoque_disponivel)}`}
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
            {/* Helper para renderizar um card de compra */}
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
                  title={<Typography variant="subtitle2">{c.title}</Typography>}
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
      <CardContent sx={{ height: 380, p: 2 }}>
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: 300 }}
          >
            <CircularProgress />
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            {/* Gráfico à esquerda */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                >
                  <CartesianGrid />

                  {/* Highlight the prediction region */}
                  {detail?.possui_previsao && forecastSeries.length > 0 && (
                    <ReferenceArea
                      x1={forecastSeries[0].label}
                      x2={forecastSeries[forecastSeries.length - 1].label}
                      fill="#e0e0e0" // Light gray
                      fillOpacity={0.3}
                      key="prediction-area"
                    />
                  )}

                  <XAxis dataKey="label" />
                  <YAxis />

                  <RTooltip
                    formatter={(value: any, name: string) => {
                      const num = Number(value);
                      const formatted = isNaN(num) ? value : num.toFixed(2);

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
                                : 'Previsão (6m)',
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

                  {/* Linha média geral (constante) */}
                  <Line
                    type="monotone"
                    dataKey="mediaGeral"
                    name="Média geral"
                    stroke={COLOR_MAP.mediaGeral}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="6 4" // <<-- deixa tracejada
                  />

                  {/* Linha de Previsão */}
                  {detail?.possui_previsao && (
                    <Line
                      type="monotone"
                      dataKey="previsao"
                      name="Previsão (6m)"
                      stroke={COLOR_MAP.previsao}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}

                  {/* Pontos: Máximo, Mínimo, Atual — usar ReferenceDot com X categórico */}
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

            {/* Legenda à direita (card) */}
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

              {/* Item */}
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

              {detail?.possui_previsao && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLOR_MAP.previsao,
                    }}
                  />
                  <Typography variant="body2">Previsão (6m)</Typography>
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
        )}
      </CardContent>
    </Box>
  );
}
