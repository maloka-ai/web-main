'use client';

import { Snackbar, Alert } from '@mui/material';
import { useEffect, useState } from 'react';

let showSnackbarExternally: (() => void) | null = null;

export function triggerSessionExpiredSnackbar() {
  if (showSnackbarExternally) {
    showSnackbarExternally();
  }
}

export default function SessionExpiredSnackbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    showSnackbarExternally = () => setOpen(true);
    return () => {
      showSnackbarExternally = null;
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.clear();
    window.location.href = '/v0/login';
  };

  return (
    <Snackbar open={open} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity="warning" variant="filled" sx={{ width: '100%' }}>
        Sua sessão expirou. Faça login novamente.
      </Alert>
    </Snackbar>
  );
}
