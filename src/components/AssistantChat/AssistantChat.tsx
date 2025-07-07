// app/components/AssistantChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import styles from './assistantChat.module.css';
import { createConversation, listConversations, listMessages, sendMessage } from '@/services/apiService';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import CreateConversationModal from './CreateConversationModal';
import AssistenteSelector from './AssistenteSelector';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface Conversation {
  id: string;
  title: string;
}

const conversationsMock = [
  {
    id: "6bb7af3e-3bda-4ef9-9aad-373f9d503d33",
    title: "Destaque dos clientes campeões",
  },
  {
    id: "9af45b37-e544-4a19-8ba2-4c0a0eb1ea90",
    title: "Alerta de Produtos com Baixo Estoque"
  }
]

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(conversationsMock);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!activeConversationId) return;
    listMessages(activeConversationId).then((data) => {
      if (!data || !Array.isArray(data)) {
        console.error('Invalid messages data:', data);
        return;
      }
      if (data.length === 0) {
        setMessages([]);
        return;
      }
      setMessages(data);
    });
  }, [activeConversationId]);

  useEffect(() => {
    listConversations().then((data) => {
      if (!data || !Array.isArray(data)) {
        console.error('Invalid conversations data:', data);
        return;
      }
      setConversations(data);
    }).catch((error) => {
      console.error('Error fetching conversations:', error);
    });
  }, [drawerOpen]);

  const handleSend = async () => {
    const inputMessage = input.trim();
    if (!inputMessage) return;
    setInput('');
    const newMessages = [
      ...messages,
      { content: input, role: 'user' },
      { content: 'Analisando...', role: 'assistant' }

    ];
    setMessages(newMessages as Message[]);
    let responseMessage
    // title = inputMessage, mas se for maior que 150 caracteres, só usar 150 e adicionar "..." no final
    let title;
    if (inputMessage.length > 150) {
      title = inputMessage.substring(0, 150) + '...';
    }else {
      title = inputMessage;
    }
    if (!activeConversationId) {
      const newConversation = await createConversation(title)
      setActiveConversationId(newConversation.conversation_id);
      responseMessage = await sendMessage(newConversation.conversation_id, inputMessage);
    }else{
      responseMessage = await sendMessage(activeConversationId, inputMessage);
    }

    if (!responseMessage || !responseMessage.response) {
      console.error('Invalid response message:', responseMessage);
      return;
    }

    const newMessage: Message = {
      content: responseMessage.response,
      role: 'assistant',
    };

    console.log('New message received:', newMessage);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    console.log('Updating messages with new message:', newMessage);
    setMessages((prev) => {
      const updatedMessages = [...prev];
      if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].content === 'Analisando...') {
        updatedMessages.pop();
      }
      return [...updatedMessages, newMessage];
    });
  };

  const handleCreateConversation = async (title: string) => {
    const newConversation = await createConversation(title);
    setActiveConversationId(newConversation.conversation_id);
    setMessages([]);
  };

  return (
    <Box className={`${styles.wrapper} ${expanded ? styles['wrapper-expanded'] : ''}`}>
      <IconButton
        className={styles.toggleButton}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ArrowLeft /> : <ArrowRight />}
      </IconButton>

      <Box className={styles.drawerOverlay} style={{ display: drawerOpen ? 'block' : 'none' }}>
        <Box className={styles.drawer}>
          <Box className={styles.drawerHeader}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <MenuOpenIcon />
            </IconButton>
            <Typography variant="h6" className={styles.drawerTitle}>Histórico</Typography>
          </Box>
          <List>
            {conversations.map(({id, title}) => (
                <ListItem
                  key={`${id}`}
                  className={`${styles.conversationItem} ${id === activeConversationId ? styles.activeConversation : ''}`}
                  onClick={() => {
                    setActiveConversationId(id);
                    setDrawerOpen(false);
                  }}>
                    <span className={styles.conversationName}>{title}</span>
                </ListItem>
              ))}
          </List>
        </Box>
        <Box className={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} />
      </Box>

      <CreateConversationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateConversation}
      />

      <Paper elevation={3} className={styles.chatContainer}>
        <Box className={styles.header}>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuOpenIcon />
          </IconButton>
          <Typography variant="h6" className={styles.headerTitle}>
            Assistente
          </Typography>
          <IconButton onClick={() => setCreateModalOpen(true)}>
            <AddBoxOutlinedIcon />
          </IconButton>
        </Box>

        <Box className={styles.messageArea}>
          {messages.map((msg, index) => (
            <Box key={index} className={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
              {msg.content}
            </Box>
          ))}
        </Box>

        <Box className={styles.inputArea}>
          <Box className={styles.inputWrapper}>
          <TextField
            fullWidth
            placeholder="Escreva aqui sua solicitação"
            multiline
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className={styles.inputField}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: '#f9f8f4',
                borderRadius: '12px',
                border: 'none !important',
                boxShadow: 'none !important',
              },
              '& textarea': {
                minHeight: '70px',
                maxHeight: '200px',
                overflowY: 'scroll',
                marginBottom: '40px',
              },
            }}
          />
          <AssistenteSelector className={styles.inputSelector} />
          </Box>
          <IconButton className={styles.sendButton} onClick={handleSend} color="primary">
            <ArrowUpwardIcon sx={{color: '#fff'}} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
