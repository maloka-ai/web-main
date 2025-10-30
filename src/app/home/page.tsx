'use client';

import { lazy, Suspense, useState } from 'react';
import {
  AppBar,
  Box,
  Stack,
  styled,
  Tab,
  tabClasses,
  Tabs,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from './page.module.css';

import HeaderSistema from '@/components/Layouts/SystemHeader/SystemHeader';
import Analises from '@/components/Analises/Analises';

// Dica: carregue o chat sob demanda (especialmente útil no mobile)
const AssistantChat = lazy(
  () => import('@/components/AssistantChat/AssistantChat'),
);
const TabItem = styled(Tab)(({ theme }) => ({
  minHeight: 53,
  minWidth: 80,
  textTransform: 'none',
  fontSize: 15,
  color: (theme.vars || theme).palette.text.primary,
  opacity: 1,
  borderBottom: `2px solid ${(theme.vars || theme).palette.divider}`,

  '&:not(:first-of-type)': {
    '&:before': {
      content: '" "',
      position: 'absolute',
      left: 0,
      display: 'block',
      height: 53,
      width: 2,
      zIndex: 1,
      backgroundColor: (theme.vars || theme).palette.divider,
    },
  },

  [theme.breakpoints.up('md')]: {
    minWidth: 120,
  },
  [`&.${tabClasses.selected}`]: {
    fontWeight: 700,
    color: (theme.vars || theme).palette.text.primary,
  },
}));

function TabPanel(props: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  const { value, index, children } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`tab-${index}`}
      style={{ flex: '1', overflow: 'hidden' }}
    >
      {value === index && children}
    </div>
  );
}

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [tab, setTab] = useState(0);

  if (isMobile) {
    return (
      <Box className={styles.mobileRoot}>
        <Stack direction={'column'} className={styles.navBar}>
          <HeaderSistema />

          <AppBar position="sticky" color="transparent" elevation={0}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              aria-label="Navegação principal"
            >
              <TabItem
                label="Assistente"
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <TabItem label="Análises" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>
          </AppBar>
        </Stack>
        {/* Abas: Chat | Análises */}
        <TabPanel value={tab} index={0}>
          <Suspense fallback={<div>Carregando chat…</div>}>
            <AssistantChat />
          </Suspense>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <Analises />
        </TabPanel>
      </Box>
    );
  }

  return (
    <Box
      className={styles.container}
      sx={{ display: { xs: 'none', md: 'flex' } }}
    >
      {' '}
      <AssistantChat />{' '}
      <Box className={styles.content}>
        {' '}
        <HeaderSistema /> <Analises />{' '}
      </Box>{' '}
    </Box>
  );
}
