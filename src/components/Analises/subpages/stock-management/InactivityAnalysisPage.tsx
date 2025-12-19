

import { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { handleDownloadAlertDetail } from "../../widgets/AlertasEAcoes";
import DialogDetailsTable, { DetailsDialogTableProps } from "@/components/dialog/DialogDetailsTable";
import RangeFilter from "@/components/filters/RangeFilter/RangeFilter";
import { fmtDate } from "@/utils/date";


const InactiveityAnalysisPage = () => {
  const [detailsTable, setDetailsTable] =
    useState<DetailsDialogTableProps | null>(null);

  function handleDownloadTable(data: DetailsDialogTableProps | null) {
      if (data) {
        handleDownloadAlertDetail(
          data.linkDataTable!,
          `estoque_${data
            .description!.toString()
            .toLowerCase()
            .replace(/\s+/g, "_")}.xlsx`,
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

        <RangeFilter
          title={'Filtro de Tempo de Inatividade'}
          lockEndDays={0}
          initialRangeDays={[0, 365]}
          onApply={({ start, end, rangeDays }) => {
            setDetailsTable({
              title: `Lista de produtos inatuvos: Ultimos ${rangeDays[1]} dias`,
              description: `Exibindo todos os produtos que não foram vendidos no período selecionado ${fmtDate(start)} — ${fmtDate(end)}`,
              linkDataTable: `/stock/inatividade/produtos_inativos?recencia_dias=${rangeDays[1]}`,
            });
          }}
        />
      </Box>

      <DialogDetailsTable
        data={detailsTable}
        open={!!detailsTable}
        onClose={() => {
          setDetailsTable(null);
        }}
        onDownload={() => handleDownloadTable(detailsTable)}
      />
    </>
  )
};

export default InactiveityAnalysisPage;