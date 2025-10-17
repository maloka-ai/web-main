'use client';

import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { formatCurrency } from '@/utils/format';
import { useCustomerDetails } from '@/services/customer/queries';
import { Customer } from '@/services/customer/types';

interface CardCustomerProfileProps {
  customerId: number;
  customer: Customer;
}

export function CardCustomerProfile({
  customerId,
  customer,
}: CardCustomerProfileProps) {
  const { data: detailsCustomer, isLoading } = useCustomerDetails(customerId);

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            Perfil do cliente
          </Typography>
        }
      />
      {isLoading && (
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Carregando informações do cliente...
          </Typography>
        </CardContent>
      )}
      {!isLoading && (
        <CardContent>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Nome
                </Typography>
                <Typography>{customer.nome}</Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  CPF / CNPJ
                </Typography>
                <Typography>{customer.cpf || customer.cnpj || '—'}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  E-mail
                </Typography>
                <Typography>{customer.email || '—'}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography>{customer.telefone || '—'}</Typography>
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Antiguidade
                </Typography>
                <Typography>{customer.antiguidade} dias</Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Recência
                </Typography>
                <Typography>{customer.recencia} dias</Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Frequência
                </Typography>
                <Typography>{customer.frequencia} compras</Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Valor Monetário
                </Typography>
                <Typography>
                  {formatCurrency(customer.valor_monetario)}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            <Grid container>
              <Grid size={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Segmento
                </Typography>
                <Typography fontWeight={600}>{customer.segmento}</Typography>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
