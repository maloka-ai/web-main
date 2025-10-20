import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteConversationModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  conversationTitle: string;
}

const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  open,
  onClose,
  onDelete,
  conversationTitle,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Excluir Conversa</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir <strong>{conversationTitle}</strong>?
          Essa ação não poderá ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onDelete}>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConversationModal;
