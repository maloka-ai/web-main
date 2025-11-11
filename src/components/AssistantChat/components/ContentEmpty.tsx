import { Button, Stack, Typography } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useEffect, useState } from 'react';

function getGreetingByHour(date = new Date()) {
  const h = date.getHours(); // horário local do navegador
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';

  return 'Boa noite';
}

function Greeting() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreetingByHour());
  }, []);

  return (
    <Typography variant="subtitle1" align="center">
      <b>{greeting},</b>
      <br /> como posso te ajudar?
    </Typography>
  );
}
type Props = {
  handleSendMessage: (message: string) => void;
};
export function ContentEmpty({ handleSendMessage }: Props) {
  const messages = [
    'Mostre reativação de sumidos',
    'Compare os novos clientes',
    'Crie um gráfico dos mais vendidos',
  ];
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
        <Greeting />
      </Stack>
      <Stack direction={'column'} alignItems={'center'} mb={2} spacing={1}>
        <TipsAndUpdatesOutlinedIcon fontSize={'large'} color={'primary'} />
        {messages.map((message) => (
          <Button
            key={message}
            sx={{ color: 'gray' }}
            color={'inherit'}
            variant="outlined"
            size={'small'}
            onClick={() => handleSendMessage(message)}
          >
            {message}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
