'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from '@mui/material';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';

import { salesService } from '@/services/salesService';
import { CardMonthlySalesEvolution } from '@/components/Analises/subpages/customers/CardMonthlySalesEvolution';
import { formatCurrency } from '@/utils/format';

type YearDetailRow = {
  ano: number;
  vendas: number;
  crescimento: number | null;
  isBase: boolean;
};

function formatPercentSigned(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function CustomerBussinessGrowth() {
  const [rows, setRows] = useState<YearDetailRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    salesService
      .getAnnualRevenue()
      .then((res) => {
        const base = res
          .map((r) => ({ ano: r.ano, vendas: r.total_de_faturamento }))
          .sort((a, b) => a.ano - b.ano);

        const withGrowth: YearDetailRow[] = base.map((curr, idx) => {
          if (idx === 0) {
            return {
              ano: curr.ano,
              vendas: curr.vendas,
              crescimento: null,
              isBase: true,
            };
          }
          const prev = base[idx - 1];
          const crescimento =
            prev.vendas === 0
              ? 0
              : ((curr.vendas - prev.vendas) / prev.vendas) * 100;
          return {
            ano: curr.ano,
            vendas: curr.vendas,
            crescimento,
            isBase: false,
          };
        });

        setRows(withGrowth);
      })
      .catch((e) => {
        console.error(e);
        setError('Falha ao carregar faturamento anual.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const columns = useMemo<MRT_ColumnDef<YearDetailRow>[]>(
    () => [
      {
        accessorKey: 'ano',
        header: 'Ano',
        enableSorting: true,
        size: 80,
      },
      {
        accessorKey: 'vendas',
        header: 'Vendas',
        enableSorting: true,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
      },
      {
        accessorKey: 'crescimento',
        header: 'Crescimento',
        enableSorting: true,
        // Renderização com cor: verde (positivo), vermelho (negativo) e "Ano base" para o primeiro ano
        Cell: ({ row, cell }) => {
          const isBase = row.original.isBase;
          if (isBase) return <Typography variant="body2">Ano base</Typography>;

          const v = cell.getValue<number | null>();
          if (v === null || Number.isNaN(v)) return '—';

          const color =
            v > 0 ? 'success.main' : v < 0 ? 'error.main' : 'text.primary';
          return (
            <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
              {formatPercentSigned(v)}
            </Typography>
          );
        },
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },

        sortingFn: (a, b, columnId) => {
          const va = a.getValue<number | null>(columnId);
          const vb = b.getValue<number | null>(columnId);
          if (va === null && vb === null) return 0;
          if (va === null) return 1;
          if (vb === null) return -1;
          return va - vb;
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: rows,
    state: {
      isLoading,
      showAlertBanner: !!error,
    },
    enableTableFooter: false,
    enableTopToolbar: false,
    enablePagination: false,
    localization: MRT_Localization_PT_BR,
    initialState: {
      sorting: [{ id: 'ano', desc: false }], // crescente por ano
      density: 'comfortable',
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableHiding: false,
    muiToolbarAlertBannerProps: error
      ? { color: 'error', children: error }
      : undefined,
  });

  return (
    <Stack spacing={3} mb={12}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={700}>
              Detalhamento por ano
            </Typography>
          }
          subheader="Vendas anuais e crescimento ano a ano (menor ano = Ano base)"
        />
        <CardContent>
          <MaterialReactTable table={table} />
        </CardContent>
      </Card>

      <CardMonthlySalesEvolution />
    </Stack>
  );
}
