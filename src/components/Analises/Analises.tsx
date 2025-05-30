// app/components/Analises/Analises.tsx
'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import HeaderAnalises from './HeaderAnalises';
import CockpitPage from './subpages/CockpitPage';

const subpages = {
  cockpit: <CockpitPage />,
};

export default function Analises() {
  const [activePage, setActivePage] = useState<'cockpit'>('cockpit');

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <HeaderAnalises current={activePage} onNavigate={setActivePage} />
      <Box sx={{ padding: '1rem', overflowY: 'auto', height: 'calc(100% - 60px)' }}>
        {subpages[activePage]}
      </Box>
    </Box>
  );
}
