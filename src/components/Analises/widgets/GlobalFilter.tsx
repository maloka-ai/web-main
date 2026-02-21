'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useGlobalFiltersStore } from '@/store/globalFiltersStore';

const UNIDADES_OPCOES = [
  'Unidade 1',
  'Unidade 2',
  'Unidade 3',
  'Unidade 4',
  'Unidade 5',
];
const TIPO_CLIENTE_OPCOES = ['CPF', 'CNPJ'];

export default function GlobalFilter() {
  const { filters, setFilters, resetFilters } = useGlobalFiltersStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempUnidades, setTempUnidades] = useState<string[]>(filters.unidades);
  const [tempTipoClientes, setTempTipoClientes] = useState<string[]>(
    filters.tipoClientes
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempUnidades(filters.unidades);
    setTempTipoClientes(filters.tipoClientes);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    setFilters({ unidades: tempUnidades, tipoClientes: tempTipoClientes });
    handleClose();
  };

  const handleReset = () => {
    resetFilters();
    setTempUnidades([]);
    setTempTipoClientes([]);
  };

  const toggleUnidade = (unidade: string) => {
    setTempUnidades((prev) =>
      prev.includes(unidade)
        ? prev.filter((u) => u !== unidade)
        : [...prev, unidade]
    );
  };

  const toggleTipoCliente = (tipo: string) => {
    setTempTipoClientes((prev) =>
      prev.includes(tipo)
        ? prev.filter((t) => t !== tipo)
        : [...prev, tipo]
    );
  };

  const open = Boolean(anchorEl);

  const labelText = () => {
    const parts = [];
    if (filters.unidades.length > 0) {
      parts.push(`${filters.unidades.length} unidades`);
    }
    if (filters.tipoClientes.length > 0) {
      parts.push(filters.tipoClientes.join(', '));
    }
    return parts.length > 0 ? parts.join(' • ') : 'Filtros';
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        sx={{
          color: '#324b4b',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          backgroundColor: '#f4f3ed',
          borderRadius: '20px',
          padding: '4px 16px',
          '&:hover': {
            backgroundColor: '#e9e8df',
          },
        }}
      >
        {labelText()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: '280px',
              padding: '1.5rem',
              borderRadius: '16px',
              backgroundColor: '#f4f3ed',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              mt: 1,
            },
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={1} color="#3e3e3e">
          Unidades da empresa
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack spacing={0.5} mb={2}>
          {UNIDADES_OPCOES.map((u) => (
            <FormControlLabel
              key={u}
              control={
                <Checkbox
                  checked={tempUnidades.includes(u)}
                  onChange={() => toggleUnidade(u)}
                  size="small"
                  sx={{ color: '#9c5d40', '&.Mui-checked': { color: '#8db600' } }}
                />
              }
              label={<Typography fontSize="0.9rem">{u}</Typography>}
            />
          ))}
        </Stack>

        <Typography variant="subtitle1" fontWeight={600} mb={1} color="#3e3e3e">
          Tipo de clientes
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack spacing={0.5} mb={3}>
          {TIPO_CLIENTE_OPCOES.map((t) => (
            <FormControlLabel
              key={t}
              control={
                <Checkbox
                  checked={tempTipoClientes.includes(t)}
                  onChange={() => toggleTipoCliente(t)}
                  size="small"
                  sx={{ color: '#9c5d40', '&.Mui-checked': { color: '#8db600' } }}
                />
              }
              label={<Typography fontSize="0.9rem">{t}</Typography>}
            />
          ))}
        </Stack>

        <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button
            onClick={handleReset}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: '#9c5d40',
              color: '#9c5d40',
              minWidth: '100px',
              '&:hover': {
                borderColor: '#9c5d40',
                backgroundColor: 'rgba(156, 93, 64, 0.04)',
              },
            }}
          >
            Redefinir
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              backgroundColor: '#9c5d40',
              minWidth: '100px',
              '&:hover': {
                backgroundColor: '#7a4a32',
              },
            }}
          >
            Aplicar
          </Button>
        </Box>
      </Popover>
    </>
  );
}
