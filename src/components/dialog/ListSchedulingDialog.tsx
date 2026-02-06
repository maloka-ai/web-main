import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DialogProps } from '@/components/dialog/DialogDetails';
import CloseIcon from '@mui/icons-material/Close';

export function ListSchedulingDialog({ open, onClose }: DialogProps) {
  return (
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
        <Typography fontWeight={'bold'}>Agendamento de notificações</Typography>
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
        <Typography py={2}>
          Você têm: <b>0 Agendamentos</b>
        </Typography>
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
            <Typography component={'span'} fontWeight={600} fontSize={'medium'}>
              Assistente
            </Typography>
            . Se a análise for válida, será exibida
            <br />o botão{' '}
            <Typography component={'span'} fontWeight={600} fontSize={'medium'}>
              "Agendar relatório periódico"
            </Typography>
            . Toque nele e defina as demais informações.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
