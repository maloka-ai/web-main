import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { CardCustomerProfile } from '@/components/Analises/subpages/customers/components/CardCustomerProfile';
import { CardListSalesCustomer } from '@/components/Analises/subpages/customers/components/CardListSalesCustomer';
import { CardAnalysisSales } from '@/components/Analises/subpages/customers/components/CardAnalyisSales';
import { Customer } from '@/services/customer/types';
import { useCustomers } from '@/services/customer/queries';

export function Customer360() {
  const { data: customers, isLoading } = useCustomers();
  const [customerSelected, setCustomerSelected] = useState<Customer | null>(
    null,
  );

  return (
    <Stack spacing={2} pb={40}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={700}>
              Análise 360º do cliente
            </Typography>
          }
          subheader="Selecione um cliente para ver detalhes sobre seu comportamento de vendas e histórico."
        />
        <CardContent>
          <Autocomplete<Customer>
            loading={isLoading}
            options={customers || []}
            value={customerSelected}
            getOptionKey={(customer) => customer.id_cliente}
            onChange={(_: any, newValue) => {
              setCustomerSelected(newValue);
            }}
            getOptionLabel={(option) => option.nome}
            renderInput={(params) => <TextField {...params} label="Cliente" />}
          />
        </CardContent>
      </Card>
      {!customerSelected && (
        <Typography variant="body2" color="textSecondary" mt={2}>
          Selecione um cliente para ver o perfil detalhado.
        </Typography>
      )}
      {customerSelected && (
        <>
          <CardCustomerProfile
            customerId={customerSelected.id_cliente}
            customer={customerSelected}
          />
          <CardListSalesCustomer customerId={customerSelected.id_cliente} />
          <CardAnalysisSales customerId={customerSelected.id_cliente} />
        </>
      )}
    </Stack>
  );
}
