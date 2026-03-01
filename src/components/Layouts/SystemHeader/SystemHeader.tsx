// app/components/Layout/SystemHeader.tsx
'use client';

import { Box, Button, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import UserAccount from '../UserAccount/UserAccount';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useControlModal } from '@/hooks/useControlModal';
import { ListSchedulingDialog } from '@/components/dialog/ListSchedulingDialog';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function HeaderSistema() {
  const userEmail =
    typeof window !== 'undefined'
      ? (localStorage.getItem('user_email') ?? '')
      : '';
  const [open, onOpen, onClose] = useControlModal();
  const isMobile = useIsMobile();

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
        <Image
          src="/images/marca-maloka-medio@3x.png"
          alt="Maloka'ai"
          width={147}
          height={22}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {isMobile ? (
          <IconButton title={'Agendamentos'} onClick={onOpen}>
            <CalendarMonthIcon sx={{ fontSize: 20, color: '#a36e4f' }} />
          </IconButton>
        ) : (
          <Button
            onClick={onOpen}
            startIcon={
              <CalendarMonthIcon sx={{ fontSize: 20, color: '#a36e4f' }} />
            }
            sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: '0.95rem', color: '#4b4b4b' }}
            >
              Agendamentos
            </Typography>
          </Button>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <UserAccount email={userEmail} />
        </Box>
      </Box>
      <ListSchedulingDialog open={open} onClose={onClose} />
    </Box>
  );
}
