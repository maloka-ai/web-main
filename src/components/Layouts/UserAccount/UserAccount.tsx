// app/components/Layout/UserAccountDropdown.tsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Menu, MenuItem, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAssistantChatStore } from '@/store/sidebar.store';

function UserAccount({ email: propEmail }: { email?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const isMobile = useIsMobile();
  const expanded = useAssistantChatStore((store) => store.expanded);
  useEffect(() => {
    setMounted(true);
    const fromProp = (propEmail ?? '').trim();
    if (fromProp) setEmail(fromProp);
    else {
      try {
        setEmail(localStorage.getItem('email') || '');
      } catch {}
    }
  }, [propEmail]);

  if (!mounted) return null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const expadedFull = expanded === 'full';
  if (expadedFull) return null;
  return (
    <Box>
      {isMobile ? (
        <IconButton onClick={handleClick} size="large" color="inherit">
          <AccountCircleIcon sx={{ fontSize: 28, color: '#a36e4f' }} />
        </IconButton>
      ) : (
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            cursor: 'pointer',
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 20, color: '#a36e4f' }} />
          <Typography
            variant="body2"
            sx={{ fontSize: '0.95rem', color: '#4b4b4b' }}
          >
            {email}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 180,
            },
          },
        }}
      >
        <MenuItem
          onClick={handleLogout}
          sx={{ color: 'error.main', fontWeight: 500 }}
        >
          Sair da conta
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserAccount;
