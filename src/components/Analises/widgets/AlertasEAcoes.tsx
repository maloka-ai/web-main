// app/components/Analises/widgets/AlertasEAcoes.tsx
'use client';

import { Box, Typography, Button, IconButton, Card } from '@mui/material';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

const alertas = [
  {
    indicador: '150',
    titulo: 'Risco de Ruptura',
    subtitulo: 'SKUs abaixo do estoque de segurança',
    acao: 'Revisar Pedido Urgente',
  },
  {
    indicador: '8',
    titulo: 'Excesso de Estoque',
    subtitulo: 'SKUs com cobertura > 120 dias.',
    acao: 'Planejar Promoção',
  },
  {
    indicador: '-20%',
    titulo: 'Queda de Vendas',
    subtitulo: 'Categoria Tintas vs Semana Anterior',
    acao: 'Analisar Causa Raiz',
  },
  {
    indicador: '25',
    titulo: 'Vendas atípicas',
    subtitulo: 'vendas atípicas nos últimos 10 dias',
    acao: 'Ver mais detalhes',
  },
  {
    indicador: '325',
    titulo: 'Clientes Sumidos',
    subtitulo: 'em comprar entre 6 meses e 1 ano',
    acao: 'Iniciar Campanha de Retenção',
  }
];

export default function AlertasEAcoes() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '3.5rem',
      padding: '1rem 0',
      // overflowY: 'auto',
    }}>
      {alertas.map((item, index) => (
        <Box key={index} sx={{display: 'flex', width: '100%', maxWidth: '350px', position: 'relative', justifyContent: 'end' }}>
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#e59a8c',
                color: '#fff',
                borderRadius: '8px',
                padding: '0.25rem 0.75rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                width: 60,
                height: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.indicador}
            </Box>
            <Box>
              <Typography fontWeight={600} fontSize="0.95rem" color="#333">
                {item.titulo}
              </Typography>
              <Typography fontSize="0.85rem" color="#777">
                {item.subtitulo}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              paddingTop: '20px',
              display: 'flex',
              width: '100%',
              paddingLeft: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1,
              position: 'absolute',
              bottom: '-40px',
            }}
          >
            <BoltOutlinedIcon sx={{
              color: '#ebd93b',
            }} />
            <Box
              sx={{
                backgroundColor: '#f8ebe3',
                height: '45px',
                width: '90%',
                borderRadius: '0 0 12px 12px',
                padding: '0.65rem 1rem',
                paddingTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#4b4b4b',
                fontSize: '0.75rem',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {item.acao}
              <PlayArrowOutlinedIcon sx={{ color: '#df8157' }} />
            </Box>

          </Box>
        </Box>
      ))}
    </Box>
  );
}