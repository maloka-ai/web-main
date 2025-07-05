// app/components/Analises/subpages/CockpitPage.tsx
'use client';

import { Box, Typography } from '@mui/material';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import ResumoKPI from '../widgets/ResumoKPI';
import { useEffect, useState } from 'react';
import { analysisService, SegmentacaoCliente } from '@/services/analysisService';
import ClientesAtivosKPI from '../widgets/ClientesAtivosKPI';
import NovosClientesKPI from '../widgets/NovosClientesKPI';
import TaxaRecorrenciaTrimestral from '../widgets/TaxaRecorrenciaTrimestral';
import GraficoRetencaoAnual, { RetencaoAnual } from '../widgets/RetencaoAnual';
import ResumoGraficoLinha from '../widgets/ResumoGraficoLinha';

const exemploDados = [
  {
    titulo: 'Receita Hoje',
    subtitulo: 'vs Previsão',
    valor: 'R$ 14.527.000',
    gain: 3,
    data: [
      { name: 'Seg', value: 120 },
      { name: 'Ter', value: 95 },
      { name: 'Qua', value: 110 },
      { name: 'Qui', value: 130 },
      { name: 'Sex', value: 90 },
    ]
  },
  {
    titulo: 'Ticket médio',
    subtitulo: 'vs Semana Anterior',
    valor: 'R$ 457',
    gain: -2,
    data: [
      { name: 'Seg', value: 78 },
      { name: 'Ter', value: 85 },
      { name: 'Qua', value: 82 },
      { name: 'Qui', value: 88 },
      { name: 'Sex', value: 92 },
    ]
  }
];

const dadosRetencao: RetencaoAnual[] = [
  { ano: '2022', taxa: 0.62 },
  { ano: '2023', taxa: 0.67 },
  { ano: '2024', taxa: 0.73 },
];

export const listaDeCompras = [
  // Cliente 1 — comprou nos 3 últimos trimestres (recorrente)
  { id_cliente: 1, data_compra: '2023-10-15' }, // Q4 2023
  { id_cliente: 1, data_compra: '2024-02-20' }, // Q1 2024
  { id_cliente: 1, data_compra: '2024-05-01' }, // Q2 2024

  // Cliente 2 — comprou apenas em Q1 e Q2 2024
  { id_cliente: 2, data_compra: '2024-03-18' }, // Q1 2024
  { id_cliente: 2, data_compra: '2024-04-10' }, // Q2 2024

  // Cliente 3 — comprou apenas em Q2 2024 (novo no trimestre)
  { id_cliente: 3, data_compra: '2024-05-12' }, // Q2 2024

  // Cliente 4 — comprou em Q4 2023 e Q1 2024 (recorrente), parou depois
  { id_cliente: 4, data_compra: '2023-11-03' }, // Q4 2023
  { id_cliente: 4, data_compra: '2024-01-25' }, // Q1 2024

  // Cliente 5 — comprou em Q4 2023 e Q2 2024 (não conta como recorrente)
  { id_cliente: 5, data_compra: '2023-12-10' }, // Q4 2023
  { id_cliente: 5, data_compra: '2024-04-08' }, // Q2 2024

  // Cliente 6 — comprou só em Q1 2024
  { id_cliente: 6, data_compra: '2024-02-01' }, // Q1 2024
];


export default function CockpitPage() {

  const [clientes, setClientes] = useState<SegmentacaoCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getSegmentacaoClientes()
      .then(setClientes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <Box sx={{ display: 'flex', gap: '1.5rem' }}>
      {/* Alertas e Ações à esquerda */}
      <Box sx={{ width: '350px' }}>
        <Typography
          variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1}
        >
          Alertas e Ações
        </Typography>
        <AlertasEAcoes />
      </Box>

      {/* Resultados e KPIs à direita - a implementar depois */}
      <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" fontWeight={600} color="#4b4b4b" mb={1.5}>
          Resultados • KPIs
        </Typography>

        {/* Venda: Produto */}
        <Box sx={{
          marginBottom: '2rem',
          overflowY: 'auto',
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="#4b4b4b" mb={1}>
            Cliente
          </Typography>
          <Box sx={{
            padding: '4px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {/* {exemploDados.map((item, idx) => (
              <ResumoKPI
                key={idx}
                titulo={item.titulo}
                subtitulo={item.subtitulo}
                data={item.data}
                valor={item.valor}
                gain={item.gain} // Simulando ganho aleatório
              />
            ))} */}
            <ClientesAtivosKPI clientes={clientes} />
            <NovosClientesKPI clientes={clientes} />
            {/* <TaxaRecorrenciaTrimestral compras={listaDeCompras} />
            <GraficoRetencaoAnual data={dadosRetencao} /> */}
            <ResumoGraficoLinha
              titulo="Taxa de Recorrência Trimestral"
              subtitulo="Últimos 3 trimestres"
              valor="48%"
              gain={23}
              data={[
                { name: '2023Q4', value: 30 },
                { name: '2024Q1', value: 48 },
                { name: '2024Q2', value: 48 },
              ]}
              xLabelMap={{
                '2023Q4': '2023/T4',
                '2024Q1': '2024/T1',
                '2024Q2': '2024/T2',
              }}
            />
            <ResumoGraficoLinha
              titulo="Taxa de Retenção Anual"
              subtitulo="Últimos 3 anos"
              valor="64%"
              gain={8}
              data={[
                { name: '2022', value: 62 },
                { name: '2023', value: 67 },
                { name: '2024', value: 73 },
              ]}
              xLabelMap={{
                '2022': '2022',
                '2023': '2023',
                '2024': '2024',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
