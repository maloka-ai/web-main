// app/components/Layout/UserAccountDropdown.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function UserAccount({ email }: { email: string }) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <Box>
      <Box
        onClick={handleClick}
        sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
      >
        <AccountCircleIcon sx={{ fontSize: 20, color: '#a36e4f' }} />
        <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#4b4b4b' }}>
          {email}
        </Typography>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 500 }}>
          Sair da conta
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserAccount;