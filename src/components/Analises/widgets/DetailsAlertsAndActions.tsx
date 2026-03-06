'use client';

import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CockpitAlert } from '@/services/analysis/analysisService';
import { FileDownloadOutlined } from '@mui/icons-material';
import { DynamicTable } from '@/components/table/DynamicTable';
import { useState } from 'react';
import ProductAnalysis from '@/components/Analises/subpages/stock-management/ProductAnalysis';
import DialogDetails from '@/components/dialog/DialogDetails';

interface DetailsAlertsAndActionsProps {
  alert: CockpitAlert | null;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function DetailsAlertsAndActions({
  alert,
  open,
  onClose,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  const [productIdSelect, setProductIdSelect] = useState<number | null>(null);
  if (!alert) {
    return null;
  }

  function handleClickClose() {
    if (productIdSelect) {
      setProductIdSelect(null);
    } else {
      onClose();
    }
  }

  return (
    <>
      <Modal open={open} onClose={handleClickClose}>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: '#fdfcf7',
            maxWidth: '80%',
            maxHeight: '95vh',
            margin: '4vh auto',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            outline: 'none',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight={800}
            mb={1}
            sx={{ color: '#4b4b4b' }}
          >
            {alert?.titulo}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={2}
            sx={{ color: '#777' }}
          >
            {alert?.descricao}
          </Typography>
          <div>
            {' '}
            <Button
              variant="contained"
              startIcon={<FileDownloadOutlined />}
              color={alert?.tipo === 'alerta' ? 'error' : 'primary'}
              sx={{
                textTransform: 'none',
                borderRadius: '16px',
                mb: 2,
              }}
              onClick={onDownload}
            >
              Baixar tabela completa
            </Button>
          </div>

          <DynamicTable
            onClickRow={(data) => {
              if (
                data &&
                data.id_produto &&
                alert?.titulo !== 'Inativo (Com estoque)'
              ) {
                setProductIdSelect(data.id_produto);
              }
            }}
            data={{
              linkData: alert.link_detalhamento,
              countColumns: 5,
            }}
          />
        </Box>
      </Modal>
      <DialogDetails
        data={{
          title: 'Análise detalhada do produto',
        }}
        open={!!productIdSelect}
        onClose={handleClickClose}
      >
        <ProductAnalysis product={{ id_produto: productIdSelect } as any} />
      </DialogDetails>
    </>
  );
}
