import {useEffect, useState} from "react"
import {getString} from "@/utils/strings"
import {Typography} from "@mui/material"
import {Box} from "@mui/system"
import {analysisService, CustomerSegmentation} from "@/services/analysisService"
import {handleDownloadAlertDetail} from "../widgets/AlertasEAcoes"
import RenderGraphic from "../widgets/RenderGraphic"
import {makeSegmentationCustomerGraphs} from "../helpers/CustomerMoreLessActiveHelper"
import DialogDetailsTable, {DetailsDialogTableProps} from "@/components/dialog/DialogDetailsTable";


const CustomerMoreLessActivePage = () => {
  const [detailsTable, setDetailsTable] =
    useState<DetailsDialogTableProps | null>(null);
  const [segmentationCustomer, setSegmentationCustomer] = useState<
    CustomerSegmentation[]
  >([]);

  useEffect(() => {
    analysisService.getSegmentacaoClientes()
      .then(setSegmentationCustomer)
      .catch(console.error)
  }, [])

  const handleBarSelected = (name: string) => {
    setDetailsTable({
      title: `Clientes do seguimento: ${name}`,
      description: `Exibindo clientes do segmento ${name}.`,
      linkDataTable: `/customer/segmentacao/clientes_por_segmento?segmento=${encodeURIComponent(name)}`,
    });
  };

  return (
    <>
      <Box
        sx={{
          marginBottom: 2,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={500}
          fontSize={18}
          color="#3e3e3e"
        >
          {getString("analysis-customers-more-less-active-customers-graph-title")}
        </Typography>
      </Box>

      {/* <BarGraph
        data={[
          { name: 'Campeões', value: 1250, secondValue: 320 },
          { name: 'Novos', value: 1100, secondValue: 210 },
          { name: 'Fiéis Baixo Valor', value: 980, secondValue: 180 },
          { name: 'Fiéis Alto Valor', value: 890, secondValue: 420 },
          { name: 'Inativos', value: 780, secondValue: 120 },
          { name: 'Recentes Alto Valor', value: 540, secondValue: 310 },
          { name: 'Recentes Baixo Valor', value: 650, secondValue: 280 },
          { name: 'Sumidos', value: 380, secondValue: 150 },
        ]}
        legendTitle='Segmentos'
        sampleLabel="Clientes"
        secondValueLabel="Ticket Médio"
        tooltipFormatter={(v) =>
          v.toLocaleString('pt-BR', { style: 'decimal' })
        }
        secondValueFormatter={(v) =>
          v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }
        xAxisAngle={-45}
        onBarSelected={(name) => handleBarSelected(name)}
        height={400}
      /> */}

      <RenderGraphic
        graph={{ ...makeSegmentationCustomerGraphs(segmentationCustomer)[0], onBarSelected: handleBarSelected }}
      />

      <DialogDetailsTable
        data={detailsTable}
        open={!!detailsTable}
        onClose={() => {
          setDetailsTable(null);
        }}
        onDownload={() =>
          detailsTable
            ? handleDownloadAlertDetail(
                detailsTable.linkDataTable!,
                `alerta_${detailsTable.description!.toLowerCase().replace(/\s+/g, "_")}.xlsx`,
              )
            : null
        }
      />
    </>
  );
};

export default CustomerMoreLessActivePage;
