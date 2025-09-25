'use client';

import { Box, IconButton, Modal, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type DetailsDialogProps = {
  title: string;
  description?: string;
};

interface DetailsAlertsAndActionsProps {
  data: DetailsDialogProps | null;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function DialogDetails({
  data,
  open,
  children,
  onClose,
}: DetailsAlertsAndActionsProps) {
  if (!data) {
    return null;
  }
  const { title, description } = data;
  const hasDescription = Boolean(description);
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: '#fdfcf7',
          maxWidth: '80%',
          maxHeight: '95vh',
          overflowY: 'auto',
          margin: '4vh auto',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          outline: 'none',
          position: 'relative',
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
          {title}
        </Typography>
        {hasDescription && (
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={2}
            sx={{ color: '#777' }}
          >
            {description}
          </Typography>
        )}

        {children}
      </Box>
    </Modal>
  );
}
