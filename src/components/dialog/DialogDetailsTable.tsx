'use client';

import { Button } from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { DynamicTable } from '@/components/table/DynamicTable';
import DialogDetails from '@/components/dialog/DialogDetails';

export type DetailsDialogTableProps = {
  title: string;
  description: string;
  numberColumnsDataTable?: number;
  linkDataTable?: string;
  type?: 'alerta' | 'acao';
};

interface DetailsAlertsAndActionsProps {
  data: DetailsDialogTableProps | null;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export default function DialogDetailsTable({
  data,
  open,
  onClose,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  if (!data) {
    return null;
  }
  const { linkDataTable, numberColumnsDataTable, type } = data;
  const hasDownload = Boolean(onDownload);
  const hasTable = Boolean(linkDataTable);

  return (
    <DialogDetails data={data} open={open} onClose={onClose}>
      <>
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
        {hasTable && (
          <DynamicTable
            data={{
              linkData: data.linkDataTable || '',
              countColumns: numberColumnsDataTable || 5,
            }}
          />
        )}
      </>
    </DialogDetails>
  );
}
