'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Snackbar,
} from '@mui/material';

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';

import {
  analysisService,
  type ProductByABC,
  ProductStatus,
  ABCCurve,
} from '@/services/analysis/analysisService';
import DialogDetails from '@/components/dialog/DialogDetails';
import ProductAnalysis from '@/components/Analises/subpages/stock-management/ProductAnalysis';
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';

type CurvaFilter = '' | ABCCurve;
type SituacaoFilter = '' | ProductStatus;

export default function SkuAnalysisPage() {
  const [productSelected, setProductSelected] = useState<ProductByABC | null>(
    null,
  );
  const [curva, setCurva] = useState<CurvaFilter>('');
  const [situacao, setSituacao] = useState<SituacaoFilter>(
    ProductStatus.ActiveInStock,
  );

  // dados da tabela
  const [rows, setRows] = useState<ProductByABC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);

  function handleSelectProduct(row: ProductByABC) {
    setProductSelected(row);
  }

  function clearSelectedProduct() {
    setProductSelected(null);
  }

  // columns da tabela
  const columns = useMemo<MRT_ColumnDef<ProductByABC>[]>(
    () => [
      {
        accessorKey: 'id_sku',
        header: 'ID SKU',
        size: 110,
        filterFn: 'contains',
      },
      {
        accessorKey: 'nome_produto',
        header: 'Produto',
        size: 280,
        filterFn: 'contains',
      },
      {
        accessorKey: 'nome_categoria',
        header: 'Categoria',
        size: 180,
        filterFn: 'contains',
      },
      {
        accessorKey: 'estoque_atual',
        header: 'Estoque Atual',
        size: 120,
        filterFn: 'contains',
      },
      {
        accessorKey: 'curva_abc',
        header: 'Curva ABC',
        size: 100,
        filterFn: 'contains',
      },
      {
        accessorKey: 'situacao_do_produto',
        header: 'Situação',
        size: 200,
        filterFn: 'contains',
      },
      {
        accessorKey: 'data_ultima_venda',
        header: 'Última Venda',
        size: 160,
        filterFn: 'contains',
      },
    ],
    [],
  );

  const table = useMaterialReactTable<ProductByABC>({
    columns,
    data: rows,
    localization: MRT_Localization_PT_BR,
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 30],
      shape: 'circular',
      variant: 'outlined',
    },
    state: { isLoading: loading },
    enableColumnActions: false,
    globalFilterFn: 'contains',

    initialState: { showColumnFilters: true },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        handleSelectProduct(row.original);
      },
      sx: { cursor: 'pointer' },
    }),

    muiTableBodyCellProps: ({ cell }) => ({
      onClick: (e) => {
        const columnId = cell.column.id;
        if (columnId === 'id_sku') {
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
      sx: { cursor: cell.column.id === 'id_sku' ? 'copy' : 'pointer' },
    }),
  });

  // busca inicial (se quiser já começar com Ativo em estoque)
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch() {
    try {
      setError(null);
      setLoading(true);

      const query: Parameters<typeof analysisService.getProductsByABC>[0] = {};
      if (curva) query.curva_abc = curva;
      if (situacao) query.situacao_do_produto = situacao;

      const data = await analysisService.getProductsByABC(query);
      setRows(data ?? []);
    } catch (e: any) {
      setError(
        e?.message ??
          'Não foi possível carregar os produtos. Tente novamente em instantes.',
      );
    } finally {
      setLoading(false);
    }
  }

  const dataDialog = productSelected
    ? {
        title: 'Análise detalhada do produto',
      }
    : null;

  const isOpenDialog = !!productSelected;
  return (
    <Box
      sx={{
        marginBottom: 2,
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>
        Análise por SKU
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Filtre por Curva ABC e Situação do produto e visualize os SKUs
        correspondentes.
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Curva ABC"
                value={curva}
                onChange={(e) => setCurva(e.target.value as CurvaFilter)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value={ABCCurve.A}>A</MenuItem>
                <MenuItem value={ABCCurve.B}>B</MenuItem>
                <MenuItem value={ABCCurve.C}>C</MenuItem>
                <MenuItem value={ABCCurve.NoSale}>Sem Venda</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Situação do Produto"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as SituacaoFilter)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value={ProductStatus.ActiveInStock}>
                  {ProductStatus.ActiveInStock}
                </MenuItem>
                <MenuItem value={ProductStatus.InactiveInStock}>
                  {ProductStatus.InactiveInStock}
                </MenuItem>
                <MenuItem value={ProductStatus.NotMarketedInStock}>
                  {ProductStatus.NotMarketedInStock}
                </MenuItem>
                <MenuItem value={ProductStatus.ActiveOutOfStock}>
                  {ProductStatus.ActiveOutOfStock}
                </MenuItem>
                <MenuItem value={ProductStatus.InactiveOutOfStock}>
                  {ProductStatus.InactiveOutOfStock}
                </MenuItem>
                <MenuItem value={ProductStatus.NotMarketedOutOfStock}>
                  {ProductStatus.NotMarketedOutOfStock}
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 'auto' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Pesquisar'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/*<Card variant="outlined" sx={{ overflow: 'hidden' }}>*/}
      {/*  <CardHeader title="Produtos por Curva ABC / Situação" />*/}
      {/*  <CardContent sx={{ overflowX: 'auto' }}>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
      <Box
        sx={{
          maxWidth: {
            xs: '100%',
            md: '70vw',
            lg: '70vw',
            xl: '70vw',
          },
          overflow: 'auto',
        }}
      >
        <MaterialReactTable table={table} />

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
      </Box>

      <DialogDetails
        data={dataDialog}
        open={isOpenDialog}
        onClose={clearSelectedProduct}
      >
        <ProductAnalysis product={productSelected!} />
      </DialogDetails>
    </Box>
  );
}
