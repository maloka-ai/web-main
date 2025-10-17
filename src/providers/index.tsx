// providers.js
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme';

const queryClient = new QueryClient();

interface AppProps {
  children: React.ReactNode;
}

export default function Providers({ children }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider options={{ enableCssLayer: true, key: 'css' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
