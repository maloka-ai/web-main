'use client';

import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#ba6640', contrastText: '#ffffff' }, // laranja
    secondary: { main: '#BFA27B' }, // areia
    success: { main: '#7a9b53', contrastText: '#fff' },
    highlight: { main: '#737064', contrastText: '#ffffff' }, // 👈 nova cor

    error: { main: '#d13d3d', contrastText: '#fff' },
    warning: { main: '#dcd98d', contrastText: '#fff' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    divider: '#E6DCCB',
    text: { primary: '#3E3A37', secondary: '#8B6F52', disabled: '#B9A690' },
  },
  typography: {
    fontFamily: 'var(--font-poppins)',
    fontWeightBold: 700,
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    // borda do "card" super sutil, igual ao mock
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, border: '1px solid #E6DCCB' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f4f3ed',
          height: '90%',
          maxHeight: '900px',
          borderRadius: '7.5px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E6DCCB',
          margin: '0 1.5rem',
          padding: '0.5rem 0',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid #E6DCCB',
          // SE o footer estiver fora da tabela, deixe COM bottom para parecer um retângulo completo:
          borderBottom: '1px solid #E6DCCB', // mude para 0 se preferir colado no footer
          overflow: 'hidden',
        },
      },
    },

    // tabela “limpa”
    MuiTable: {
      styleOverrides: { root: { backgroundColor: '#FFF' } },
    },

    // cabeçalho bege + “diamante” laranja acima do título
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5EFE3',

          '& .MuiTableRow-root .MuiTableCell-head': {
            color: '#8B6F52',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderBottom: '1px solid #E6DCCB',
            position: 'relative',
            paddingBottom: 8,
            backgroundColor: '#f0eee0',
          },
          // divisor vertical suave entre colunas do header
          '& .MuiTableRow-root .MuiTableCell-head:not(:last-of-type)': {
            borderRight: '1px solid #E6DCCB',
          },
        },
      },
    },

    // corpo com divisórias finas e espaçamento como no mock
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:nth-of-type(odd)': {
            backgroundColor: '#fcfaf5  !important',
          }, // ímpar
          '& .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: '#ffffff  !important',
          }, // par
          '& .MuiTableCell-root': {
            borderBottom: '1px solid #E6DCCB',
            padding: '10px 16px',
          },
          // divisor vertical suave entre colunas do body
          '& .MuiTableRow-root .MuiTableCell-root:not(:last-of-type)': {
            borderRight: '1px solid #E6DCCB',
          },
          // hover bem leve
          '& .MuiTableRow-hover:hover': {
            backgroundColor: '#FFF9F3',
          },
        },
      },
    },

    // padding consistente
    MuiTableCell: { styleOverrides: { root: { padding: '10px 16px' } } },

    // última linha sem “risco” extra
    MuiTableRow: {
      styleOverrides: {
        root: { '&:last-of-type .MuiTableCell-root': { borderBottom: 0 } },
      },
    },

    // sort label (se você habilitar ordenação)
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: '#8B6F52',
          '&.Mui-active': { color: '#8B6F52' },
          '&:hover': { color: '#8B6F52' },
        },
        icon: { color: '#E58F55 !important' },
      },
    },

    // checkboxes bem clarinhos
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#C7B79F',
          '&.Mui-checked': { color: '#E58F55' },
          '&:hover': { backgroundColor: 'transparent' },
        },
      },
    },

    // botões do pager já ficam redondos; o preenchimento é definido no componente
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 999 },
        colorPrimary: {
          color: '#c47b5b',
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: '#E6DCCB' } } },
  },
});

export default theme;
