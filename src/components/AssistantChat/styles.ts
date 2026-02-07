import { ButtonGroup, styled } from '@mui/material';

export const SideButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: '-27px',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#bfbba9',
  boxShadow: theme.shadows[2],
  borderTopRightRadius: 12,
  borderBottomRightRadius: 12,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  overflow: 'hidden',
  // tira borda entre os botões
  '& .MuiButton-root': {
    minWidth: 0,
    padding: 4,
    border: 'none',
    color: '#fff',
    backgroundColor: '#d4d1c5',
    boxShadow: 'none',
  },
  // botão de cima: maior à direita, cortado em diagonal na parte de baixo

  '& .btn-top': {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 73%)',
    backgroundColor: '#d3d1c6',
  },
  // botão de baixo: maior à esquerda, encaixando na diagonal
  '& .btn-bottom': {
    clipPath: 'polygon(0 0, 100% 27%, 100% 100%, 0 100%)',
    backgroundColor: '#c5c2b2',
    marginTop: '-12px',
  },
}));
