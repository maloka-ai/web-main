'use client';

import { Box, Stack, Typography } from '@mui/material';
import { CardCustomerProfile } from './CardCustomerProfile';
import { CardListSalesCustomer } from './CardListSalesCustomer';
import { CardAnalysisSales } from './CardAnalyisSales';
import { Customer } from '@/services/customer/types';

interface CustomerAnalysisProps {
  customer: Customer;
}

export default function CustomerAnalysis({ customer }: CustomerAnalysisProps) {
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack spacing={3}>
        <CardCustomerProfile
          customerId={customer.id_cliente}
          customer={customer}
        />
        
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 1 }}>
            Histórico de Vendas
          </Typography>
          <CardListSalesCustomer customerId={customer.id_cliente} />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 1 }}>
            Análise de Evolução
          </Typography>
          <CardAnalysisSales customerId={customer.id_cliente} />
        </Box>
      </Stack>
    </Box>
  );
}
