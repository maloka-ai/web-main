'use client';

import { Stack } from '@mui/material';
import { CardMonthlySalesEvolution } from '@/components/Analises/subpages/customers/CardMonthlySalesEvolution';
import { CardYearEvolution } from '@/components/Analises/subpages/customers/CardYearEvolution';
import { CardDailySalesComparison } from '@/components/Analises/subpages/customers/CardDailySalesComparison';

export function CustomerBussinessGrowth() {
  return (
    <Stack spacing={3} mb={12}>
      <CardYearEvolution />
      <CardMonthlySalesEvolution />
      <CardDailySalesComparison />
    </Stack>
  );
}
