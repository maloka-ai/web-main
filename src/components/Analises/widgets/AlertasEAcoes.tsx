// app/components/Analises/widgets/AlertasEAcoes.tsx
'use client';

import { ReactElement, useState } from 'react';
import {
  Box,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { analysisService, CockpitAlert } from '@/services/analysisService';

import * as XLSX from 'xlsx';
import { FileDownloadOutlined } from '@mui/icons-material';
import DetailsAlertsAndActions from '@/components/Analises/widgets/DetailsAlertsAndActions';

export async function handleDownloadAlertDetail(
  subpath: string,
  filename: string,
) {
  try {
    const detail = await analysisService.getCockpitAlertDetail(subpath);

    if (!Array.isArray(detail)) {
      throw new Error('Resposta do detalhe não é um array');
    }

    downloadArrayAsXLSX(detail, filename);
  } catch (error) {
    console.error('Erro ao baixar detalhes do alerta:', error);
  }
}

function downloadArrayAsXLSX<T extends Record<string, any>>(
  data: T[],
  filename = 'relatorio.xlsx',
) {
  if (!data || data.length === 0) {
    console.warn('Dados vazios. Nada para exportar.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalhes');

  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ActionsAlertProps {
  cockpitAlert: CockpitAlert[];
}

function AlertaSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        maxWidth: '350px',
        position: 'relative',
        justifyContent: 'end',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          zIndex: 2,
        }}
      >
        <Skeleton variant="rounded" width={60} height={35} />

        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" height={22} />
          <Skeleton variant="text" width="60%" height={18} />
        </Box>
      </Box>

      <Box
        sx={{
          paddingTop: '20px',
          display: 'flex',
          width: '100%',
          paddingLeft: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
          position: 'absolute',
          bottom: '-40px',
        }}
      >
        <BoltOutlinedIcon sx={{ color: '#ebd93b' }} />
        <Box
          sx={{
            backgroundColor: '#f8ebe3',
            height: '45px',
            width: '90%',
            borderRadius: '0 0 12px 12px',
            padding: '0.65rem 1rem',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#4b4b4b',
            fontSize: '0.75rem',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Skeleton variant="text" width="70%" height={18} />
          <PlayArrowOutlinedIcon sx={{ color: '#df8157' }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function AlertasEAcoes({
  cockpitAlert,
}: ActionsAlertProps): ReactElement {
  const [alertDetailsl, setAlertDetails] = useState<CockpitAlert | null>(null);

  function handleAlertDetail(alert: CockpitAlert) {
    setAlertDetails(alert);
  }

  function closeAlertDetail() {
    setAlertDetails(null);
  }

  if (!cockpitAlert.length) {
    return (
      <Grid container spacing={'3.5rem'}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 12,
          }}
        >
          <AlertaSkeleton />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 12,
          }}
        >
          <AlertaSkeleton />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={'3.5rem'}>
      {cockpitAlert.map(
        (item, index) =>
          Number(item.indicador) !== 0 && (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 12,
              }}
              key={index}
            >
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: {
                    md: '350px',
                  },
                  position: 'relative',
                  justifyContent: 'end',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#e59a8c',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '0.25rem 0.75rem',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      width: 60,
                      height: 35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.indicador}
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={600}
                      fontSize="0.95rem"
                      color="#333"
                    >
                      {item.titulo}
                    </Typography>
                    <Typography fontSize="0.85rem" color="#777">
                      {item.descricao}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    paddingTop: '20px',
                    display: 'flex',
                    width: '100%',
                    paddingLeft: '10px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 1,
                    position: 'absolute',
                    bottom: '-40px',
                  }}
                >
                  <BoltOutlinedIcon
                    sx={{
                      color: '#ebd93b',
                    }}
                  />
                  <Box
                    sx={{
                      backgroundColor: '#f8ebe3',
                      height: '45px',
                      width: '90%',
                      borderRadius: '0 0 12px 12px',
                      padding: '0.65rem 1rem',
                      paddingTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#4b4b4b',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {item.acao}
                    <Stack direction="row" spacing={0}>
                      <IconButton>
                        <FileDownloadOutlined
                          onClick={() =>
                            handleDownloadAlertDetail(
                              item.link_detalhamento,
                              `alerta_${item.descricao.toLowerCase().replace(/\s+/g, '_')}.xlsx`,
                            )
                          }
                          sx={{ color: '#df8157' }}
                        />
                      </IconButton>
                      <IconButton>
                        <RemoveRedEyeIcon
                          onClick={() => handleAlertDetail(item)}
                          sx={{ color: '#df8157' }}
                        />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ),
      )}
      <DetailsAlertsAndActions
        alert={alertDetailsl}
        open={!!alertDetailsl}
        onClose={closeAlertDetail}
        onDownload={() =>
          alertDetailsl
            ? handleDownloadAlertDetail(
                alertDetailsl.link_detalhamento,
                `alerta_${alertDetailsl.descricao.toLowerCase().replace(/\s+/g, '_')}.xlsx`,
              )
            : null
        }
      />
    </Grid>
  );
}
