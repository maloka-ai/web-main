'use client';

import {
  Modal,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import RenderGraphic from './RenderGraphic';
import { GraphData } from '@/utils/graphics';

interface DetailGraphProps {
  open: boolean;
  onClose: () => void;
  graph: GraphData;
}

export default function DetailGraph({
  open,
  onClose,
  graph,
}: DetailGraphProps) {
  const {
    type,
    title,
    subtitle,
    value,
    gain,
    data,
    secondData,
    xLabelMap,
    hideXAxis,
    xAxisAngle,
    tooltipFormatter,
  } = graph;

  // const sugestoes: string[] = [
  //   'Aumentar a frequência de postagens',
  //   'Melhorar a segmentação de anúncios',
  //   'Analisar concorrência para ajustar estratégias',
  // ];
  // const descricao: string = 'Análise detalhada do desempenho deste KPI ao longo do tempo, considerando as metas estabelecidas e as variações observadas.';
  // const categorias: string[] = ['Marketing', 'Vendas', 'Suporte'];

  return (
    <Modal open={open} onClose={() => {}}>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: '#fdfcf7',
          width: {
            xs: '100%',
            md: '700px',
          },
          maxWidth: '700px',
          maxHeight: '95vh',
          overflowY: 'auto',
          margin: '4vh auto',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          outline: 'none',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          fontWeight={500}
          mb={1}
          sx={{ color: '#4b4b4b' }}
        >
          {title}
        </Typography>

        <Box>
          {value !== 'undefined' && (
            <Typography variant="h3" fontWeight={600} color="#78a27f">
              {value}
            </Typography>
          )}
          <Box sx={{ height: 200 }}>
            <RenderGraphic
              graph={{
                type,
                data,
                secondData,
                xLabelMap,
                hideXAxis,
                xAxisAngle,
                tooltipFormatter,
              }}
            />
          </Box>
          {subtitle && (
            <Typography variant="body2" fontWeight={400} color="#777" mt={1}>
              {subtitle}
              {gain && (
                <span
                  style={{
                    color: gain >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 600,
                    marginLeft: '0.5rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {gain >= 0 ? '+' : ''}
                  {gain}%
                </span>
              )}
            </Typography>
          )}
        </Box>

        {/* Tabs mock */}
        {/*{categorias && (
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
        </Box> */}
      </Box>
    </Modal>
  );
}
