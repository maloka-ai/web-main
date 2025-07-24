// app/components/AssistantChat/CreateConversationModal.tsx
'use client';

import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { AssistantType } from '@/services/AssistantService';
import { Assistants } from './AssistenteSelector';

interface CreateConversationModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, type: AssistantType) => void;
}

export default function CreateConversationModal({ open, onClose, onCreate }: CreateConversationModalProps) {
  const [title, setTitle] = useState('');
  const [assistantType, setAssistantType] = useState<AssistantType>(AssistantType.GENERAL)

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title.trim(), assistantType);
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: '#fdfcf7',
          width: '400px',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          outline: 'none',
          position: 'relative',
          margin: '15vh auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" mb={2} fontWeight={500}
          sx={{ color: '#4b4b4b' }}
          >
            Nova conversa
          </Typography>

        <FormControl fullWidth>
          <TextField
            value={title}
            label="Título"
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Escolha um agente</InputLabel>
          <Select
            value={assistantType}
            label="Escolha um agente"
            onChange={(e) => setAssistantType(e.target.value as AssistantType)}
            sx={{ mb: 3 }}
            >
            {Assistants.map(assistant => (
              <MenuItem key={assistant.type} value={assistant.type}>{assistant.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#df8157',
              color: '#df8157',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{
              backgroundColor: '#df8157',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: '#eb9b76',
              }
            }}
          >
            Criar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
