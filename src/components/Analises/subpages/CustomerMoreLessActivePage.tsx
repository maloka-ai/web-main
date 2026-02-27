import { useState } from 'react';
import { getString } from '@/utils/strings';
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { handleDownloadAlertDetail } from '../widgets/AlertasEAcoes';
import RenderGraphic from '../widgets/RenderGraphic';
import { makeSegmentationCustomerGraphs } from '../helpers/CustomerMoreLessActiveHelper';
import { DetailsDialogTableProps } from '@/components/dialog/DialogDetailsTable';
import { useCustomerResumeSegmentations } from '@/services/customer/queries';
import CardDetailsCustomersSegmentation from '@/components/Analises/subpages/stock-management/components/CardDetailsCustomersSegmentation';

const CustomerMoreLessActivePage = () => {
  const [detailsTable, setDetailsTable] =
    useState<DetailsDialogTableProps | null>(null);
  const { data: resumeSegmentations } = useCustomerResumeSegmentations();

  const handleBarSelected = (name: string) => {
    const linkDataTable =
      name === 'Todos'
        ? `/customer/segmentacao/clientes_por_segmento`
        : `/customer/segmentacao/clientes_por_segmento?segmento=${encodeURIComponent(name)}`;
    setDetailsTable({
      title: `Clientes do seguimento: ${name}`,
      description: `Exibindo clientes do segmento ${name}.`,
      linkDataTable,
    });
  };
  function handleDownloadTable(data: DetailsDialogTableProps | null) {
    if (data) {
      handleDownloadAlertDetail(
        data.linkDataTable!,
        `alerta_${data.description!.toLowerCase().replace(/\s+/g, '_')}.xlsx`,
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
                {getString(
                  'analysis-customers-more-less-active-customers-graph-title',
                )}{' '}
              </Typography>
            }
          />
          <RenderGraphic
            graph={{
              ...makeSegmentationCustomerGraphs(resumeSegmentations || [])[0],
              onBarSelected: handleBarSelected,
            }}
          />
        </CardContent>
      </Card>
      {detailsTable && (
        <CardDetailsCustomersSegmentation
          data={detailsTable}
          onDownload={() => handleDownloadTable(detailsTable)}
        />
      )}
      {/*<DialogDetailsTable*/}
      {/*  data={detailsTable}*/}
      {/*  open={!!detailsTable}*/}
      {/*  onClose={() => {*/}
      {/*    setDetailsTable(null);*/}
      {/*  }}*/}
      {/*  onDownload={() =>*/}
      {/*    detailsTable*/}
      {/*      ? handleDownloadAlertDetail(*/}
      {/*          detailsTable.linkDataTable!,*/}
      {/*          `alerta_${detailsTable.description!.toLowerCase().replace(/\s+/g, '_')}.xlsx`,*/}
      {/*        )*/}
      {/*      : null*/}
      {/*  }*/}
      {/*/>*/}
    </Box>
  );
};

export default CustomerMoreLessActivePage;
