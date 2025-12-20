'use client';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import DialogDetails from '@/components/dialog/DialogDetails';
import { useEffect, useMemo, useState } from 'react';
import ProductAnalysis from '@/components/Analises/subpages/stock-management/ProductAnalysis';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { ProductByCriticity } from '@/services/analysis/analysisService';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import { buildDynamicColumns } from '@/components/table/buildColumns';

export type DetailsDialogTableProps = {
  title: string;
  description: string;
  numberColumnsDataTable?: number;
  linkDataTable?: string;
  type?: 'alerta' | 'acao';
};

interface DetailsAlertsAndActionsProps {
  data: DetailsDialogTableProps;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export default function CardDetailsReplenishment({
  data,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  const { linkDataTable, type } = data;
  const [productSelect, setProductSelect] = useState<any>();
  const [keysStable, setKeysStable] = useState<string[]>();
  const [toastOpen, setToastOpen] = useState(false);

  const { data: listProducts, isLoading } = useQuery<ProductByCriticity[]>({
    queryKey: [linkDataTable],
    queryFn: async () => {
      setKeysStable(undefined);
      const response = await api(linkDataTable || '');
      if (response.data[0]) {
        setKeysStable(Object.keys(response.data[0]));
      }
      return response.data;
    },
    enabled: !!linkDataTable,
  });
  const columnsKeys = useMemo(() => {
    if (!keysStable) return buildDynamicColumns(keysStable, 26);
    return buildDynamicColumns(keysStable, 26, { copyId: true });
  }, [keysStable]);

  function clearSelectedProduct() {
    setProductSelect(null);
  }

  const hasDownload = Boolean(onDownload);

  const isOpenDialog = !!productSelect;
  const dataDialog = productSelect
    ? {
        title: 'Análise detalhada do produto',
      }
    : null;
  const table = useMaterialReactTable<ProductByCriticity>({
    columns: columnsKeys as any,
    data: listProducts || [],
    localization: MRT_Localization_PT_BR,
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 30],
      shape: 'circular',
      variant: 'outlined',
    },
    state: { isLoading },
    enableColumnActions: false,
    globalFilterFn: 'contains',

    initialState: { showColumnFilters: true },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setProductSelect(row.original);
      },
      sx: { cursor: 'pointer' },
    }),

    muiTableBodyCellProps: ({ cell }) => ({
      onClick: (e) => {
        const columnId = cell.column.id;
        if (columnId === 'id_produto') {
          e.stopPropagation();
          const value = cell.getValue()?.toString();
          if (value) {
            navigator.clipboard.writeText(value);
            setToastOpen(true);
            // Pequeno feedback visual opcional
            const td = e.currentTarget as HTMLElement;
            td.style.transition = 'background 0.2s ease';
            td.style.background = '#f0f0f0';
            setTimeout(() => {
              td.style.background = '';
            }, 250);
          }
        }
      },
      sx: {
        cursor: cell.column.id === 'id_produto' ? 'copy' : 'pointer',
        backgroundColor: 'red',
      },
    }),
  });
  useEffect(() => {
    const cardDetails = document.getElementById('card-details-replenishment');
    if (cardDetails) {
      cardDetails.scrollIntoView({ behavior: 'smooth' });
    }
  }, [linkDataTable]);
  return (
    <Card id={'card-details-replenishment'}>
      <CardContent sx={{ padding: '0.5rem' }}>
        <CardHeader
          title={
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="h6" fontWeight={700} m={0} p={0}>
                {data.title}{' '}
              </Typography>
              {hasDownload && (
                <Button
                  variant="contained"
                  startIcon={<FileDownloadOutlined />}
                  color={type === 'alerta' ? 'error' : 'primary'}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '16px',
                    mb: 2,
                  }}
                  onClick={onDownload}
                >
                  Baixar tabela completa
                </Button>
              )}
            </Stack>
          }
        />

        <MaterialReactTable table={table} />
      </CardContent>
      <DialogDetails
        data={dataDialog}
        open={isOpenDialog}
        onClose={clearSelectedProduct}
      >
        <ProductAnalysis product={productSelect!} />
      </DialogDetails>
      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          ID SKU copiado!
        </Alert>
      </Snackbar>
    </Card>
  );
}
