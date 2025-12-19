'use client';

import {
  alpha,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { useTotalSalesByMonth } from '@/services/customer/queries';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import { useTopItensByCustomer } from '@/services/sales/queries';
import { GraphType } from '@/utils/enums';
import { BarDatum, GraphData } from '@/utils/graphics';
import RenderGraphic from '@/components/Analises/widgets/RenderGraphic';

interface CardCustomerProfileProps {
  customerId: number;
}
export function CardAnalysisSales({ customerId }: CardCustomerProfileProps) {
  const { data, isLoading } = useTotalSalesByMonth(customerId, {
    monthsBack: 12,
  });
  const { data: topItens } = useTopItensByCustomer(customerId);
  const theme = useTheme();
  const gridColor = alpha(theme.palette.divider, 0.7);
  const lineColor = alpha(theme.palette.divider, 1);

  const graphs: GraphData[] = [];
  const segmentMap: Record<string, { value: number }> = {};
  topItens &&
    topItens.slice(0, 5).forEach(({ produto, soma_quantidade_atipica }) => {
      if (!segmentMap[produto]) {
        segmentMap[produto] = { value: 0 };
      }
      segmentMap[produto].value += soma_quantidade_atipica;
    });
  const segments: BarDatum[] = Object.entries(segmentMap).map(
    ([name, { value }]) => ({
      name,
      value,
    }),
  );
  graphs.push({
    type: GraphType.BAR,
    title: '',
    data: segments,
    legendTitle: 'Produtos',
    sampleLabel: 'Quantidade',
    height: 400,
    tooltipFormatter: (v) => v.toLocaleString('pt-BR', { style: 'decimal' }),
    xAxisAngle: -45,
  });

  return (
    <Card
      sx={{
        maxWidth: {
          xs: '100%',
          md: '70vw',
          lg: '75vw',
          xl: '75vw',
        },
        overflow: 'auto',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            Análise de vendas
          </Typography>
        }
      />
      <CardContent>
        {isLoading && (
          <Typography variant="body2" color="text.secondary">
            Carregando análise de vendas...
          </Typography>
        )}

        {!isLoading && (
          <Grid container>
            <Grid size={12}>
              <Typography mb={2} variant={'subtitle1'} color={'textSecondary'}>
                Valor total de compras por mês
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
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
                    formatter={(v: number) => formatCurrency(Number(v))}
                  />
                  <Line type="monotone" dataKey="total" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
            <Grid size={12}>
              <Typography mb={2} variant={'subtitle1'} color={'textSecondary'}>
                Top 5 produtos vendidos
              </Typography>
              <RenderGraphic graph={{ ...graphs[0] }} />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
