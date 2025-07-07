'use client';

import { Box, Typography } from '@mui/material';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import { use, useEffect, useState } from 'react';
import { analysisService, SegmentacaoCliente } from '@/services/analysisService';
import { clientsMakeGraphs, salesMakeGraphs, stockMakeGraphs } from '../helpers/CockpitHelper';
import RenderGraph from '../widgets/RenderGraph';

export default function CockpitPage() {

  const [clientes, setClientes] = useState<SegmentacaoCliente[]>([]);
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
      .finally(() => setclientsLoading(false));

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
  }, [annualRevenues, monthlyRevenues]);

  return (
    <Box sx={{ display: 'flex', gap: '1.5rem' }}>
      <Box sx={{ width: '350px' }}>
        <Typography
          variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}
        >
          Alertas e Ações
        </Typography>
        <AlertasEAcoes />
      </Box>

      <Box sx={{ flex: 1 }}>
      <Typography variant="h6" fontWeight={600} color="#4b4b4b" mb={1.5}>
          Resultados • KPIs
        </Typography>

        <Box sx={{
          marginBottom: '2rem',
          overflowY: 'auto',
        }}>
          <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}>
            Cliente
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {clientes && clientsMakeGraphs(clientes).map((graph, index) => (
                <RenderGraph key={index} graph={graph} index={index} />
              ))}

          </Box>

          <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1} mt={2}>
            Vendas
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {
                stock &&
                stockMakeGraphs(stock).map((graph, index) => (
                  <RenderGraph key={index} graph={graph} index={index} />
                ))
              }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
