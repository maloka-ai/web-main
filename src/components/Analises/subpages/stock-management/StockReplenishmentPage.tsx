import { useEffect, useState } from 'react';
import { getString } from '@/utils/strings';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  analysisService,
  StockSituation,
} from '@/services/analysis/analysisService';
import { handleDownloadAlertDetail } from '../../widgets/AlertasEAcoes';
import RenderGraphic from '../../widgets/RenderGraphic';
import { makeStockReplenishmentGraphs } from '@/components/Analises/helpers/StockReplenishmentHelper';
import DialogDetailsTable, {
  DetailsDialogTableProps,
} from '@/components/dialog/DialogDetailsTable';

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

  const handleBarSelected = (name: string) => {
    setDetailsTable({
      title: `Produtos com Criticidade: ${name}`,
      description: `Exibindo todos os produtos com cobertura ${name}`,
      linkDataTable: `/stock/cobertura/produtos_por_criticidade?criticidade=${encodeURIComponent(name)}`,
    });
  };

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
    <>
      <Box
        sx={{
          marginBottom: 2,
        }}
      >
        <Typography variant="h3" fontWeight={500} fontSize={18} color="#3e3e3e">
          {getString('analysis-stock-replenishment-graph-title')}
        </Typography>
      </Box>

      <RenderGraphic
        graph={{
          ...makeStockReplenishmentGraphs(stockSituation)[0],
          onBarSelected: handleBarSelected,
        }}
      />

      <DialogDetailsTable
        data={detailsTable}
        open={!!detailsTable}
        onClose={() => {
          setDetailsTable(null);
        }}
        onDownload={() => handleDownloadTable(detailsTable)}
      />
    </>
  );
};

export default StockReplenishmentPage;
