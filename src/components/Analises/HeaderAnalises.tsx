// app/components/Analises/HeaderAnalises.tsx
'use client';

import { Box, Typography, IconButton, InputBase } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface Props {
  current: 'cockpit';
  onNavigate: (page: 'cockpit') => void;
}

export default function HeaderAnalises({ current, onNavigate }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid #e3e3e3',
        height: '60px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Typography variant="h6" fontWeight={500} color="#324b4b">
          <span style={{ color: '#9c5d40', marginRight: '0.25rem' }}>|</span> Painel <strong>• Cockpit</strong>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
          <SearchIcon fontSize="small" sx={{ color: '#9c5d40' }} />
          <InputBase placeholder="" sx={{ marginLeft: '0.5rem', fontSize: '0.9rem' }} />
        </Box>
      </Box>

    </Box>
  );
}
