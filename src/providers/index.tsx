// providers.js
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { ToastContainer } from 'react-toastify';
import React from 'react';

const queryClient = new QueryClient();

interface AppProps {
  children: React.ReactNode;
}

export default function Providers({ children }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider options={{ enableCssLayer: true, key: 'css' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
              toastStyle={{
                borderRadius: 12,
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </ThemeProvider>
        </LocalizationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
