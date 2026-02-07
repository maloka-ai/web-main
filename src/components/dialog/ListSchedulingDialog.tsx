'use client';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DialogProps } from '@/components/dialog/DialogDetails';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { useControlModal } from '@/hooks/useControlModal';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { ScheduleCard } from '@/components/AssistantChat/components/ScheduleCard';
import { useQueryReports } from '@/services/reports/queries';
import { ScheduleCardSkeleton } from '@/components/AssistantChat/components/ScheduleCardSkeleton';
import { useMutationDeleteReport } from '@/services/reports/mutations';

export function ListSchedulingDialog({ open, onClose }: DialogProps) {
  const { mutateAsync, isPending } = useMutationDeleteReport();
  const [openHelpDialog, handleOpenHelpDialog, handleCloseHelpDialog] =
    useControlModal();
  const { data: reports, isLoading } = useQueryReports();

  const isEmptyTasks = reports?.length === 0 && !isLoading;
  const numbersReports = reports ? reports.length : 0;

  async function handleDeleteReport(report_id: string) {
    try {
      await mutateAsync(report_id);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={'lg'}
        sx={{
          height: '100%',
        }}
        slotProps={{
          paper: {
            style: {
              height: '90%',
            },
          },
        }}
      >
        <DialogTitle>
          <Typography fontWeight={'bold'}>
            Agendamento de notificações
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon color={'primary'} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography py={2}>
              Você têm: <b>{numbersReports} Agendamentos</b>
            </Typography>

            {!isEmptyTasks && (
              <Typography
                onClick={() => handleOpenHelpDialog()}
                py={2}
                color={'primary'}
                sx={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Como criar um novo agendamento?
              </Typography>
            )}
          </Stack>
          {isLoading && (
            <>
              <ScheduleCardSkeleton />
              <Box mt={2} />
              <ScheduleCardSkeleton />
              <Box mt={2} />
              <ScheduleCardSkeleton />
            </>
          )}

          {isEmptyTasks && (
            <Box
              sx={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CalendarMonthIcon
                sx={{
                  color: 'highlight.main',
                  height: '60px',
                  width: '60px',
                }}
              />
              <Typography
                sx={{
                  color: 'highlight.main',
                }}
                fontSize={'medium'}
                fontWeight={500}
              >
                Você não tem agendamentos cadastrado
              </Typography>
              <Divider
                sx={{
                  width: '60%',
                  my: 1,
                }}
              />
              <Typography fontWeight={600} fontSize={'medium'} mb={1}>
                Como criar um novo agendamento?
              </Typography>
              <Typography>
                Solicite uma análise na área do{' '}
                <Typography
                  component={'span'}
                  fontWeight={600}
                  fontSize={'medium'}
                >
                  Assistente
                </Typography>
                . Se a análise for válida, será exibida
                <br />o botão{' '}
                <Typography
                  component={'span'}
                  fontWeight={600}
                  fontSize={'medium'}
                >
                  "Agendar relatório periódico"
                </Typography>
                . Toque nele e defina as demais informações.
              </Typography>
            </Box>
          )}
          {!isEmptyTasks &&
            reports &&
            reports?.map((report) => (
              <ScheduleCard report={report} onDelete={handleDeleteReport} />
            ))}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        onAction={handleCloseHelpDialog}
        description={
          'Solicite uma análise na área do Assistente. Se a análise for válida, será exibido o botão “Agendar relatório periódico”. Toque nele e defina as demais informações'
        }
        title={'Como criar um novo agendamento?'}
        onClose={handleCloseHelpDialog}
        open={openHelpDialog}
        showBackButton={false}
        textConfirm={'Ok, entendi'}
      />
    </>
  );
}
