'use client';
import { useEffect, useState } from 'react';
import { getString } from '@/utils/strings';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  analysisService,
  StockSituation,
} from '@/services/analysis/analysisService';
import { handleDownloadAlertDetail } from '../../widgets/AlertasEAcoes';
import RenderGraphic from '../../widgets/RenderGraphic';
import { makeStockReplenishmentGraphs } from '@/components/Analises/helpers/StockReplenishmentHelper';
import { DetailsDialogTableProps } from '@/components/dialog/DialogDetailsTable';
import { GRAPH_ALL_LABEL } from '../../widgets/graphics';
import CardDetailsReplenishment from '@/components/Analises/subpages/stock-management/components/CardDetailsReplenishment';

const StockReplenishmentPage = () => {
  const [detailsTable, setDetailsTable] =
    useState<DetailsDialogTableProps | null>(null);
  const [stockSituation, setStockSituation] = useState<StockSituation[]>([]);

  useEffect(() => {
    analysisService
      .getStockSituation()
      .then(setStockSituation)
      .catch(console.error);
  }, []);

  function handleBarSelected(name: string) {
    setDetailsTable({
      title: `Produtos com Criticidade: ${name}`,
      description: `Exibindo todos os produtos com cobertura ${name}`,
      linkDataTable: `/stock/cobertura/produtos_por_criticidade?criticidade=${
        GRAPH_ALL_LABEL !== name ? encodeURIComponent(name) : ''
      }`,
    });
  }

  function handleDownloadTable(data: DetailsDialogTableProps | null) {
    if (data) {
      handleDownloadAlertDetail(
        data.linkDataTable!,
        `estoque_${data
          .description!.toString()
          .toLowerCase()
          .replace(/\s+/g, '_')}.xlsx`,
      );
    }
  }
  return (
    <Box>
      <Card
        sx={{
          marginBottom: 2,
        }}
      >
        <CardContent sx={{ padding: '0.5rem' }}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight={700} m={0} p={0}>
                {getString('analysis-stock-replenishment-graph-title')}{' '}
              </Typography>
            }
          />

          <RenderGraphic
            graph={{
              ...makeStockReplenishmentGraphs(stockSituation)[0],
              onBarSelected: handleBarSelected,
            }}
          />
        </CardContent>
      </Card>

      {detailsTable && (
        <CardDetailsReplenishment
          data={detailsTable}
          open={!!detailsTable}
          onClose={() => {
            setDetailsTable(null);
          }}
          onDownload={() => handleDownloadTable(detailsTable)}
        />
      )}
    </Box>
  );
};

export default StockReplenishmentPage;
