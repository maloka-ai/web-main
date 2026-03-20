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
import CustomerAnalysis from './CustomerAnalysis';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_SortingState,
} from 'material-react-table';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import { buildDynamicColumns } from '@/components/table/buildColumns';
import { tokenMatchFilterFn, tokenMatchSortingFn } from '@/utils/mrtFiltering';
import { Customer } from '@/services/customer/types';

export type DetailsDialogTableProps = {
  title: string;
  description: string;
  linkDataTable?: string;
};

interface DetailsAlertsAndActionsProps {
  data: DetailsDialogTableProps;
  onDownload?: () => void;
}

export default function CardDetailsCustomersSegmentation({
  data,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  const { linkDataTable } = data;
  const [customerSelect, setCustomerSelect] = useState<Customer | null>(null);
  const [keysStable, setKeysStable] = useState<string[]>();
  const [toastOpen, setToastOpen] = useState(false);

  // State for global filter and sorting
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { data: listCustomers, isLoading } = useQuery<Customer[]>({
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
    gcTime: 5 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const columnsKeys = useMemo(() => {
    if (!keysStable) return buildDynamicColumns(keysStable, 26);
    return buildDynamicColumns(keysStable, 26, { copyId: true });
  }, [keysStable]);

  function clearSelectedCustomer() {
    setCustomerSelect(null);
  }

  const hasDownload = Boolean(onDownload);

  const isOpenDialog = !!customerSelect;
  const dataDialog = customerSelect
    ? {
        title: 'Análise detalhada do cliente',
      }
    : null;

  // Effect to manage sorting based on global filter
  useEffect(() => {
    if (globalFilter) {
      setSorting([{ id: '_mrt_filterMatchScore', desc: true }]);
    } else {
      setSorting([]);
    }
  }, [globalFilter]);

  const table = useMaterialReactTable<Customer>({
    columns: columnsKeys as any,
    data: listCustomers || [],
    localization: MRT_Localization_PT_BR,
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 30],
      shape: 'circular',
      variant: 'outlined',
    },
    state: { isLoading, globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    enableColumnActions: false,
    globalFilterFn: 'tokenMatch',
    filterFns: {
      tokenMatch: tokenMatchFilterFn,
    },
    sortingFns: {
      _mrt_filterMatchScore: tokenMatchSortingFn,
    },

    initialState: { showColumnFilters: true },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setCustomerSelect(row.original);
      },
      sx: { cursor: 'pointer' },
    }),

    muiTableBodyCellProps: ({ cell }) => ({
      onClick: (e) => {
        const columnId = cell.column.id;
        if (columnId === 'id_cliente') {
          e.stopPropagation();
          const value = cell.getValue()?.toString();
          if (value) {
            navigator.clipboard.writeText(value);
            setToastOpen(true);
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
        cursor: cell.column.id === 'id_cliente' ? 'copy' : 'pointer',
      },
    }),
  });

  useEffect(() => {
    const cardDetails = document.getElementById('card-details-customers');
    if (cardDetails) {
      cardDetails.scrollIntoView({ behavior: 'smooth' });
    }
  }, [linkDataTable]);

  return (
    <Card id={'card-details-customers'}>
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
                  color={'primary'}
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
        onClose={clearSelectedCustomer}
      >
        <CustomerAnalysis customer={customerSelect!} />
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
          ID Cliente copiado!
        </Alert>
      </Snackbar>
    </Card>
  );
}
