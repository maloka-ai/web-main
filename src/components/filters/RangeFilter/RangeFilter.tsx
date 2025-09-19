'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Chip,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import { addDays, dateFromDaysAgo, diffInDays, fmtDate, startOfMonth, today } from '@/utils/date';


const fmtTick = (v: number) => {
  if (v === 0) return '0d';
  if (v === 7) return '7d';
  if (v % 30 === 0) return `${v / 30}m`;
  return `${v}d`;
};

const marks = [
  { value: 0, label: '0d' },
  { value: 7, label: '7d' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1) * 30,
    label: `${i + 1}m`,
  })),
];

export type RangeDays = [number, number];

interface Props {
  title?: string;
  initialRangeDays?: RangeDays;
  onApply: (range: { start: Date; end: Date; rangeDays: RangeDays }) => void;
  helperText?: string;
  lockEndDays?: number;
  lockStartDays?: number;
  hideFixedThumb?: boolean;
}

export default function RangeFilter({
  title,
  initialRangeDays = [30, 180],
  onApply,
  helperText,
  lockEndDays,
  lockStartDays,
  hideFixedThumb = true,
}: Props) {
  const [range, setRange] = useState<RangeDays>([
    Math.min(...initialRangeDays),
    Math.max(...initialRangeDays),
  ]);

  useEffect(() => {
    setRange(prev => {
      let [min, max] = prev;
      if (typeof lockEndDays === 'number') min = lockEndDays;
      if (typeof lockStartDays === 'number') max = lockStartDays;
      if (min > max) [min, max] = [Math.min(min, max), Math.max(min, max)];
      return [min, max];
    });
  }, [lockEndDays, lockStartDays]);

  const { start, end } = useMemo(() => {
    const startDate = dateFromDaysAgo(range[1]);
    const endDate = dateFromDaysAgo(range[0]);
    return { start: startDate, end: endDate };
  }, [range]);

  const setLast7Days = () => setRange([0, 7]);
  const setCurrentMonth = () => {
    const d = today();
    const ini = startOfMonth(d);
    const daysFromIni = diffInDays(d, ini);
    setRange([0, daysFromIni]);
  };
  const setLast180Days = () => setRange([0, 180]);

  const handleChange = (_: Event, value: number | number[], activeThumb?: number) => {
    if (!Array.isArray(value)) return;
    let [min, max] = value as RangeDays;

    if (min > max) [min, max] = [max, min];

    if (typeof lockEndDays === 'number') {
      if (activeThumb === 0) return;
      min = lockEndDays;
    }

    if (typeof lockStartDays === 'number') {
      if (activeThumb === 1) return;
      max = lockStartDays;
    }

    setRange([min, max]);
  };

  const handleApply = () => onApply({ start, end, rangeDays: range });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid #e6e0cf',
        background: '#fbfaf5',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip
            variant="outlined"
            label="Últimos 7 dias"
            onClick={setLast7Days}
            sx={{ borderRadius: 1.5 }}
          />
          <Chip
            variant="outlined"
            label="Mês atual"
            onClick={setCurrentMonth}
            sx={{ borderRadius: 1.5 }}
          />
          <Chip
            variant="outlined"
            label="Últimos 180 dias"
            onClick={setLast180Days}
            sx={{ borderRadius: 1.5 }}
          />
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ px: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selecione o período mínimo e máximo de inatividade:
        </Typography>

        <Slider
          value={range}
          min={0}
          max={360}
          step={1}
          marks={marks}
          onChange={handleChange}
          valueLabelDisplay="auto"
          getAriaLabel={() => 'Intervalo em dias'}
          valueLabelFormat={(v: any) => fmtTick(v as number)}
          sx={{
            '& .MuiSlider-markLabel': { color: '#9a8f73', fontSize: 12 },
            '& .MuiSlider-thumb': { width: 16, height: 16 },
            '& .MuiSlider-track': { color: '#df8157' },
            '& .MuiSlider-rail': { opacity: 0.4 },
            ...(hideFixedThumb && typeof lockStartDays === 'number'
              ? { '& .MuiSlider-thumb[data-index="1"]': { display: 'none' } }
              : {}),
            ...(hideFixedThumb && typeof lockEndDays === 'number'
              ? { '& .MuiSlider-thumb[data-index="0"]': { display: 'none' } }
              : {}),
          }}

        />

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Período selecionado: {fmtDate(start)} — {fmtDate(end)}
          </Typography>
          {helperText && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {helperText}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mt: 2, mb: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            bgcolor: '#df8157',
            '&:hover': { bgcolor: '#eb9b76' },
            borderRadius: 2,
            px: 2.5,
          }}
        >
          Buscar
        </Button>
      </Box>
    </Paper>
  );
}