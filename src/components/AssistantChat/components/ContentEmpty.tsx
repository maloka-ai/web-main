import { Button, Stack, Typography } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';

export function ContentEmpty() {
  return (
    <Stack
      direction={'column'}
      sx={{
        height: '100%',
      }}
      justifyContent={'center'}
    >
      <Stack
        sx={{ flexGrow: 1 }}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Typography variant="subtitle1" align="center">
          <b> Boa tarde, </b>
          <br /> como posso te ajudar?
        </Typography>
      </Stack>
      <Stack direction={'column'} alignItems={'center'} mb={2} spacing={1}>
        <TipsAndUpdatesOutlinedIcon fontSize={'large'} color={'primary'} />
        <Button
          sx={{ color: 'gray' }}
          color={'inherit'}
          variant="outlined"
          size={'small'}
        >
          Mostre reativação de sumidos
        </Button>
        <Button
          sx={{ color: 'gray' }}
          color={'inherit'}
          variant="outlined"
          size={'small'}
        >
          Compare os novos clientes
        </Button>
        <Button
          sx={{ color: 'gray' }}
          color={'inherit'}
          variant="outlined"
          size={'small'}
        >
          Crie um gráfico dos mais vendidos
        </Button>
      </Stack>
    </Stack>
  );
}
