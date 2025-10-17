'use client';

import { Card, CardContent, CardHeader, Typography } from '@mui/material';

interface CardCustomerProfileProps {
  customerId: number;
}
export function CardAnalysisSales({ customerId }: CardCustomerProfileProps) {
  return (
    <Card
      sx={{
        maxWidth: {
          xs: '100%',
          md: '70vw',
          lg: '75vw',
          xl: '75vw',
        },
        overflow: 'auto',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            Análise de vendas
          </Typography>
        }
      />
      <CardContent>hahaha</CardContent>
    </Card>
  );
}
