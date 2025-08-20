// app/components/Layout/SystemHeader.tsx
'use client';

import { Box, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import Image from 'next/image';
import UserAccount from '../UserAccount/UserAccount';

export default function HeaderSistema() {
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') ?? '' : '';

  return (
    <Box
      sx={{
        width: '100%',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 1.5rem',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Image src='/v0/images/marca-maloka-medio@3x.png' alt="Maloka'ai" width={147} height={22} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <TuneIcon sx={{ fontSize: 20, color: '#a36e4f' }} />
          <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#4b4b4b' }}>Configurações</Typography>
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <UserAccount email={userEmail} />
        </Box>
      </Box>
    </Box>
  );
}
