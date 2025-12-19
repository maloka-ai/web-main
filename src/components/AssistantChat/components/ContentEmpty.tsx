import { Button, Stack, Typography } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useEffect, useState } from 'react';
import { AssistantType } from '@/services/AssistantService';

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
  handleCopyMessageToInput: (message: string) => void;
  assistantType: AssistantType;
};

const messagesByAssistantType: Record<AssistantType, string[]> = {
  [AssistantType.GENERAL]: [
    'Indique 3 técnicas de negociação com fornecedores',
    'Defina ruptura de estoque e como posso evitar',
    'Sugira possíveis ações para recuperar clientes inativos',
  ],
  [AssistantType.SHOPPING]: [
    'O que comprar do fornecedor [nome do fornecedor]?',
    'Analise os produtos [informar descrição]',
    'Analise a categoria [especificar categoria]',
  ],
  [AssistantType.DATA]: [
    'Crie um gráfico com os produtos mais vendidos esse mês',
    'Compare as vendas do último mês com o mesmo período do ano anterior',
    'Mostre o ranking de vendedores do mês anterior',
  ],
};

export function ContentEmpty({
  handleSendMessage,
  handleCopyMessageToInput,
  assistantType,
}: Props) {
  const messages = messagesByAssistantType[assistantType] || [];

  const handleClick = (message: string) => {
    if (assistantType === AssistantType.SHOPPING) {
      handleCopyMessageToInput(message);
    } else {
      handleSendMessage(message);
    }
  };

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
            onClick={() => handleClick(message)}
          >
            {message}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
