// AssistenteSelector.tsx
'use client';

import {
  Box, Typography, IconButton, Popover, MenuItem, Select, SelectChangeEvent
} from '@mui/material';
import { useState, ReactElement } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const assistentes = [
  {
    id: 'dados',
    label: 'Assistente de dados',
    description: 'Solicite análises baseadas nos dados da sua empresa',
    icon: '📊',
  },
  {
    id: 'compras',
    label: 'Assistente de compras',
    description: 'Planeje as compras da sua empresa',
    icon: '🛒',
  },
  {
    id: 'geral',
    label: 'Assistente geral',
    description: 'Converse sobre assuntos além de sua empresa',
    icon: '🤖',
  },
];

interface AssistenteSelectorProps {
  className?: string;
}

export default function AssistenteSelector({className}: AssistenteSelectorProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [current, setCurrent] = useState('geral');

  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (id: string) => {
    setCurrent(id);
    handleClose();
  };

  const selected = assistentes.find((a) => a.id === current);

  return (
    <Box className={className}>
      <Box
        onClick={handleOpen}
        sx={{
          border: '1px solid #ccc',
          borderRadius: '12px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          cursor: 'pointer',
          background: '#fff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontSize="1rem" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
            {selected?.icon}
          </Typography>
          <Typography fontSize="0.85rem" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
            {selected?.label}
          </Typography>
        </Box>
        {/* <Typography fontSize="0.85rem" sx={{ fontFamily: 'Poppins'}}>{selected?.label}</Typography> */}
        <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ mt: -1 }}
        PaperProps={{
          sx: {
            padding: 1,
            borderRadius: '12px',
            width: 300,
            background: '#fdfcf7',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Typography fontWeight={600} fontSize="0.9rem" color="#555" mb={1}>
          Assistentes
        </Typography>
        {assistentes.map((a) => (
          <Box
            key={a.id}
            onClick={() => handleSelect(a.id)}
            sx={{
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: a.id === current ? '#f4efeb' : 'transparent',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <Typography fontWeight={600} fontSize="0.9rem">
              {a.icon} {a.label}
            </Typography>
            <Typography fontSize="0.75rem" color="#888">
              {a.description}
            </Typography>
          </Box>
        ))}
      </Popover>
    </Box>
  );
}
