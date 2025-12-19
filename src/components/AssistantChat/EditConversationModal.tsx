import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface EditConversationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  currentTitle: string;
}

const EditConversationModal: React.FC<EditConversationModalProps> = ({
  open,
  onClose,
  onSave,
  currentTitle,
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (open) setTitle(currentTitle);
  }, [open, currentTitle]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Renomear Conversa</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Novo título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave(title);
            onClose();
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditConversationModal;
