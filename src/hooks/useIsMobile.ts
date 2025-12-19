import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

/**
 * Retorna true se a tela estiver abaixo de md (mobile)
 * Pode ser usado em qualquer componente.
 */
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
}
