'use client';

import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import { formatCurrency, formatDate } from '@/utils/format';
import { RenderDetailsPanelSales } from '@/components/Analises/subpages/customers/components/RenderDetailsPanelSales';
import { useCustomerSales } from '@/services/customer/queries';
import { CustomerSale } from '@/services/customer/types';

interface CardCustomerProfileProps {
  customerId: number;
}
export function CardListSalesCustomer({
  customerId,
}: CardCustomerProfileProps) {
  const { data: sales, isLoading } = useCustomerSales(customerId);

  const columns: MRT_ColumnDef<CustomerSale>[] = [
    {
      accessorKey: 'data_venda',
      header: 'Data',
      Cell: ({ cell }) => formatDate(cell.getValue() as any),
    },
    { accessorKey: 'nome_cliente', header: 'Cliente' },
    { accessorKey: 'nome_loja', header: 'Loja' },
    { accessorKey: 'nome_vendedor', header: 'Vendedor' },
    {
      accessorKey: 'total_venda',
      header: 'Total',
      Cell: ({ cell }) => formatCurrency(cell.getValue() as any),
    },
    { accessorKey: 'situacao_venda', header: 'Situação' },

    { accessorKey: 'tipo_venda', header: 'Tipo' },
  ];

  const table = useMaterialReactTable({
    columns,
    state: {
      isLoading,
    },
    getRowId: (originalRow) => String(originalRow.id_venda),
    data: sales || [],
    enableDensityToggle: false,
    enableColumnActions: false,
    enableColumnFilterModes: false,
    enableColumnResizing: false,
    enableExpandAll: false,
    enableExpanding: true,
    enableFullScreenToggle: false,
    muiTableBodyRowProps: {
      sx: {
        '& > td': { borderBottom: 'none' }, // remove a borda entre linha e painel
      },
    },
    localization: MRT_Localization_PT_BR,
    paginateExpandedRows: false,
    displayColumnDefOptions: {
      'mrt-row-expand': {
        header: '',
        size: 20,
      },
    },
    renderDetailPanel: ({ row }) => (
      <RenderDetailsPanelSales id_venda={row.original.id_venda} />
    ),
  });

  const totalSales = sales?.length ?? 0;

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
            Vendas realizadas
          </Typography>
        }
        subheader={`Total de vendas ${totalSales}`}
      />
      <CardContent>
        <MaterialReactTable table={table} />
      </CardContent>
    </Card>
  );
}
