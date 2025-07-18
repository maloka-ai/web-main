'use client';

import { Box, Typography } from '@mui/material';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import { use, useEffect, useState } from 'react';
import { analysisService, CustomerAnnualRecurrence, CustomerQuarterlyRecurrence, SegmentacaoCliente } from '@/services/analysisService';
import { clientsMakeGraphs, salesMakeGraphs, stockMakeGraphs } from '../helpers/CockpitHelper';
import RenderGraph from '../widgets/RenderGraph';

export default function CockpitPage() {

  const [clientes, setClientes] = useState<SegmentacaoCliente[]>([]);
  const [customerQuarterlyRecurrence, setCustomerQuarterlyRecurrence] = useState<CustomerQuarterlyRecurrence[]>([]);
  const [customerAnnualRecurrence, setCustomerAnnualRecurrence] = useState<CustomerAnnualRecurrence[]>([]);
  const [clientsLoading, setclientsLoading] = useState(true);
  const [annualRevenues, setAnnualRevenues] = useState<any[]>([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [stock, setStock] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    analysisService.getSegmentacaoClientes()
      .then(setClientes)
      .catch(console.error)

    analysisService.getCustomerQuarterlyRecurrence((new Date()).getFullYear() - 1)
      .then(setCustomerQuarterlyRecurrence)
      .catch(console.error)
    analysisService.getCustomerAnnualRecurrence((new Date()).getFullYear() - 2)
      .then(setCustomerAnnualRecurrence)
      .catch(console.error)

    analysisService.getAnnualRevenues()
      .then(setAnnualRevenues)
      .catch(console.error);

    analysisService.getMonthlyRevenues()
      .then(setMonthlyRevenues)
      .catch(console.error);

    analysisService.getStockMetrics()
      .then(setStock)
      .catch(console.error)
      .finally(() => setStockLoading(false));
  }, []);

  useEffect(() => {
    if (annualRevenues && monthlyRevenues) {
      setSalesLoading(false);
    }
    if (clientes && customerQuarterlyRecurrence && customerAnnualRecurrence) {
      setclientsLoading(false);
    }
  }, [annualRevenues, monthlyRevenues, clientes, customerQuarterlyRecurrence, customerAnnualRecurrence]);

  return (
    <Box sx={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      <Box sx={{ width: '350px', overflow: 'auto', pr: 1, pb:16 }}>
        <Typography
          variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}
        >
          Alertas e Ações
        </Typography>
        <AlertasEAcoes />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, pb: 10 }}>
      <Typography variant="h6" fontWeight={600} color="#4b4b4b" mb={1.5}>
          Resultados • KPIs
        </Typography>

        <Box sx={{
          marginBottom: '2rem',
          // overflowY: 'auto',
        }}>


          <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1} mt={2}>
            Vendas
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))' }}>
              {
                annualRevenues &&
                monthlyRevenues &&
                salesMakeGraphs(annualRevenues, monthlyRevenues).map((graph, index) => (
                  <RenderGraph key={index} graph={graph} index={index} />
                ))
              }
          </Box>

          <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1} mt={2}>
            Estoque
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            mb: 4,
            gap: '1rem',
            gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))' }}>
              {
                stock &&
                stockMakeGraphs(stock).map((graph, index) => (
                  <RenderGraph key={index} graph={graph} index={index} />
                ))
              }
          </Box>

          <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}>
            Cliente
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))' }}>
              {clientes && customerQuarterlyRecurrence && customerAnnualRecurrence && clientsMakeGraphs(clientes, customerQuarterlyRecurrence, customerAnnualRecurrence).map((graph, index) => (
                <RenderGraph key={index} graph={graph} index={index} />
              ))}

          </Box>
        </Box>
      </Box>
    </Box>
  );
}
