// app/components/Analises/widgets/DetalheKPI.tsx
'use client';

import { Modal, Box, Typography, IconButton, Chip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KPIData {
  titulo: string;
  data: string;
}

interface DetailsKPIProps {
  open: boolean;
  onClose: () => void;
  kpi: KPIData;
}

export default function DetailsKPI({ open, onClose, kpi }: DetailsKPIProps) {

  const sugestoes: string[] = [
    'Aumentar a frequência de postagens',
    'Melhorar a segmentação de anúncios',
    'Analisar concorrência para ajustar estratégias',
  ];
  const descricao: string = 'Análise detalhada do desempenho deste KPI ao longo do tempo, considerando as metas estabelecidas e as variações observadas.';
  const categorias: string[] = ['Marketing', 'Vendas', 'Suporte'];

  return (
    <Modal open={open} onClose={()=>{}}>
      <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        backgroundColor: '#fdfcf7',
        width: '700px',
        maxHeight: '95vh',
        overflowY: 'auto',
        margin: '4vh auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        outline: 'none',
        position: 'relative'
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          fontWeight={500}
          mb={1}
          sx={{ color: '#4b4b4b' }}
        >{kpi.titulo}</Typography>

        <Box>
          <Typography variant="h3" fontWeight={600} color="#78a27f">
            {kpi.data}
          </Typography>
        </Box>

        {/* Tabs mock */}
        {categorias && (
          <Box sx={{ display: 'flex', gap: '0.5rem', mt: 2 }}>
            {categorias.map((cat, idx) => (
              <Chip
                key={idx}
                label={cat}
                variant={idx === 0 ? 'filled' : 'outlined'}
                sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', paddingX: '0.5rem' }}
              />
            ))}
          </Box>
        )}

        <Box mt={3}>
          <Typography fontWeight={600} fontSize="1rem" color="#4b4b4b" gutterBottom>
            Análise do Assistente
          </Typography>
          <Typography fontSize="0.9rem" color="#666">
            {descricao}
          </Typography>
        </Box>

        <Box mt={4}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LightbulbOutlinedIcon sx={{ color: '#df8157' }} />
            <Typography
              fontWeight={600}
              fontSize="0.95rem"
              sx={{ color: '#4b4b4b' }}
            >
              Sugestões do Assistente
            </Typography>
          </Box>
          <Typography fontSize="0.85rem" color="#777" mb={1.5}>
            Toque nas sugestões abaixo para enviar para o assistente detalhar a sugestão
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {sugestoes.map((texto, idx) => (
              <Button
                key={idx}
                variant="outlined"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  borderColor: '#df8157',
                  color: '#4b4b4b',
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem'
                }}
                endIcon={<ArrowUpwardIcon sx={{ color: '#df8157' }} />}
              >
                {texto}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
