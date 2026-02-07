import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DialogProps } from '@/components/dialog/DialogDetails';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface Props extends DialogProps {
  onAction: () => void;
  description: string | React.ReactNode;
  title: string | React.ReactNode;
  textConfirm?: string;
  colorConfirm?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  showBackButton?: boolean;
}
export function ConfirmDialog({
  open,
  onClose,
  onAction,
  description,
  title,
  textConfirm = 'Confirmar',
  colorConfirm = 'primary',
  showBackButton = true,
}: Props) {
  const isDescriptionString = description instanceof String;
  const isTitleString = isDescriptionString ? isDescriptionString : title;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={'sm'}>
      <DialogTitle>
        {isTitleString ? <Typography>{title}</Typography> : title}

        <IconButton onClick={onClose}>
          <CloseIcon color={'primary'} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 2,
        }}
      >
        {isDescriptionString ? (
          <Typography py={2}>{description}</Typography>
        ) : (
          description
        )}

        <DialogActions>
          {showBackButton && (
            <Button
              size={'small'}
              color={'primary'}
              variant={'outlined'}
              onClick={onClose}
            >
              Voltar
            </Button>
          )}

          <Button
            size={'small'}
            color={colorConfirm}
            onClick={onAction}
            variant={'contained'}
          >
            {textConfirm}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
