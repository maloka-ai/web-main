'use client';

import { Modal, Box, Typography, IconButton, Chip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface GraphData {
  titulo: string;
  data: { name: string; value: number }[];
  subtitulo?: string;
  valor?: string;
  gain?: number;
  xLabelMap?: Record<string, string>;
  hideXAxis?: boolean;
  xAxisAngle?: number;
  secondData?: { name: string; value: number }[];
  tooltipFormatter?: (value: number, name?: string) => string;
}

interface DetalheKPIProps {
  open: boolean;
  onClose: () => void;
  graph: GraphData;
}

export default function DetalheGraphLine({ open, onClose, graph }: DetalheKPIProps) {

  const meanValue = graph.data.length > 0
  ? graph.data.reduce((acc, curr) => acc + curr.value, 0) / graph.data.length
  : 0;
  const lastValue = graph.data[graph.data.length-1].value;

  const sugestoes: string[] = [
    'Aumentar a frequência de postagens',
    'Melhorar a segmentação de anúncios',
    'Analisar concorrência para ajustar estratégias',
  ];
  const descricao: string = 'Análise detalhada do desempenho deste KPI ao longo do tempo, considerando as metas estabelecidas e as variações observadas.';
  const categorias: string[] = ['Marketing', 'Vendas', 'Suporte'];

  const getStrokeColor = ()=>{
    let value_a, value_b;
    if (graph.secondData){
      value_a = meanValue;
      value_b = graph.secondData.length > 0
      ? graph.secondData.reduce((acc, curr) => acc + curr.value, 0) / graph.secondData.length
      : 0;
    } else {
      value_a = lastValue;
      value_b = meanValue;
    }

    if (value_a < value_b * 0.95 ) {
      return '#f44336';
    } else if ( value_a > value_b * 1.05) {
      return '#78a27f';
    } else {
      return '#f3b52e';
    }
  }

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
        >{graph.titulo}</Typography>

        <Box>
          {graph.valor!=='undefined' && (
            <Typography variant="h3" fontWeight={600} color="#78a27f">
              {graph.valor}
            </Typography>
          )
          }
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={graph.data} margin={{ top: graph.secondData ? 80 : 40, bottom: 5, left: 0, right: 0 }}>
            <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={false}
              hide={graph.hideXAxis}
              fontSize={12}
              tick={{ fill: '#666' }}
              padding={{ left: 24, right: 24 }}
              tickFormatter={(name) => graph.xLabelMap?.[name] || name}
              angle={graph.xAxisAngle ?? 0}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{ fontSize: '0.8rem' }}
              wrapperStyle={{ zIndex: 1000 }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#df8157', strokeWidth: 0.5 }}
              formatter={(value: number, name: string) =>
                graph.tooltipFormatter ? graph.tooltipFormatter(value, name) : value
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getStrokeColor()}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            {graph.secondData && (
              <Line
                type="monotone"
                dataKey="value"
                data={graph.secondData}
                stroke="#ccc"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            )}

          </LineChart>
            </ResponsiveContainer>
          </Box>
          {graph.gain && (<Typography mt={1} fontSize="0.9rem" color="#4b4b4b">
            vs Meta{' '}
            <span style={{ color: graph.gain>= 0 ? '#4caf50' : '#f44336', fontWeight: 600 }}>
            {graph.gain >= 0 ? '+' : ''}{graph.gain}%
            </span>
          </Typography>)}
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
