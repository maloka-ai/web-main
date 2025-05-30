// app/components/Analises/subpages/CockpitPage.tsx
'use client';

import { Box, Typography } from '@mui/material';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import ResumoKPI from '../widgets/ResumoKPI';

const exemploDados = [
  {
    titulo: 'Receita Hoje',
    subtitulo: 'vs Previsão',
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
    subtitulo: 'Rendimento médio por venda de produto',
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

export default function CockpitPage() {
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
            Venda: Produto
          </Typography>
          <Box sx={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {exemploDados.map((item, idx) => (
              <ResumoKPI
                key={idx}
                titulo={item.titulo}
                subtitulo={item.subtitulo}
                data={item.data}
                gain={item.gain} // Simulando ganho aleatório
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
