import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface DeleteConversationModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  conversationTitle: string;
  isLoading?: boolean;
}

const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  open,
  onClose,
  onDelete,
  conversationTitle,
  isLoading,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Excluir Conversa</DialogTitle>
      <DialogContent>
        <Typography pt={2}>
          Tem certeza que deseja excluir <strong>{conversationTitle}</strong>?
          Essa ação não poderá ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant={'outlined'} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onDelete}
          loading={isLoading}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConversationModal;
