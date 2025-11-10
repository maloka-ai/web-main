// AssistenteSelector.tsx
'use client';

import {
  Box,
  Typography,
  IconButton,
  Popover,
  MenuItem,
  Select,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import { useState, ReactElement } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AssistantType } from '@/services/AssistantService';

export const AssistantTypeLabels: Record<AssistantType, string> = {
  [AssistantType.GENERAL]: 'Assistente geral',
  [AssistantType.SHOPPING]: 'Assistente de compras',
  [AssistantType.DATA]: 'Analista de Vendas',
} as const;

export const AssistantTypeLegends: Record<AssistantType, string> = {
  [AssistantType.GENERAL]:
    'Solicite análises baseadas nos dados da sua empresa',
  [AssistantType.SHOPPING]:
    'Solicite análises baseadas nos dados da sua empresa',
  [AssistantType.DATA]: 'Solicite análises baseadas nos dados da sua empresa',
} as const;
export const Assistants = [
  {
    id: 'geral',
    label: 'Assistente geral',
    description: 'Converse sobre assuntos além de sua empresa',
    type: AssistantType.GENERAL,
    icon: '🤖',
  },
  {
    id: 'compras',
    label: 'Assistente de compras',
    description: 'Planeje as compras da sua empresa',
    type: AssistantType.SHOPPING,
    icon: '🛒',
  },
  {
    id: 'dados',
    label: 'Analista de Vendas',
    description: 'Solicite análises baseadas nos dados da sua empresa',
    type: AssistantType.DATA,
    icon: '📊',
  },
];

interface AssistantSelectorProps {
  assistantType: AssistantType;
  className?: string;
  onSelectAssistantType: (type: AssistantType) => void;
}

export default function AssistantSelector({
  assistantType,
  className,
  onSelectAssistantType,
}: AssistantSelectorProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [current, setCurrent] = useState(
    Assistants.find((assitant) => assitant.type === assistantType)?.id ||
      'geral',
  );

  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (id: string) => {
    setCurrent(id);
    onSelectAssistantType(
      Assistants.find((assistant) => assistant.id === id)?.type ||
        AssistantType.GENERAL,
    );
    handleClose();
  };

  const selected = Assistants.find(
    (a) =>
      a.id ===
      (Assistants.find((assitant) => assitant.type === assistantType)?.id ||
        'geral'),
  );

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
          background: '#fcfcf8',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            fontSize="1rem"
            sx={{ fontFamily: 'Poppins', fontWeight: 600 }}
          >
            {selected?.icon}
          </Typography>
          <Typography
            fontSize="0.85rem"
            sx={{ fontFamily: 'Poppins', fontWeight: 600 }}
          >
            {selected?.label}
          </Typography>
        </Box>
        {/* <Typography fontSize="0.85rem" sx={{ fontFamily: 'Poppins'}}>{selected?.label}</Typography> */}
        {/*<Divider orientation="vertical" flexItem />*/}
        <ExpandMoreIcon
          color={'primary'}
          fontSize={'medium'}
          sx={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ mt: -1 }}
        slotProps={{
          paper: {
            sx: {
              padding: 1,
              borderRadius: '12px',
              width: 300,
              background: '#f4f3ed',
              boxShadow: '0 0 2.3px 2.2px rgba(0, 0, 0, 0.07)',
            },
          },
        }}
      >
        <Typography
          fontWeight={'normal'}
          fontSize="0.9rem"
          color={'#3e3e3e'}
          mb={0.5}
        >
          Assistentes
        </Typography>
        <Divider sx={{ mb: '2px' }} />
        {Assistants.map((a) => (
          <Box
            key={a.id}
            onClick={() => handleSelect(a.id)}
            sx={{
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: a.id === current ? '#fefefc' : 'transparent',
              '&:hover': { backgroundColor: '#f9f9f3' },
              display: 'grid',
              gridTemplateColumns: 'min-content 1fr',
              columnGap: '8px',
            }}
          >
            {a.icon}
            <Typography
              fontWeight={a.id === current ? '600' : '400'}
              fontSize="0.9rem"
            >
              {a.label}
            </Typography>
            <Typography
              fontSize="0.75rem"
              color="#888"
              sx={{
                gridColumn: '2 / 3',
              }}
            >
              {a.description}
            </Typography>
          </Box>
        ))}
      </Popover>
    </Box>
  );
}
