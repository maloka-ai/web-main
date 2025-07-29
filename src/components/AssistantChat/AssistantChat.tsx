// app/components/AssistantChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import styles from './assistantChat.module.css';
import assistantService, { Assistant, AssistanteMessage, AssistantThreadResume, AssistantType } from '@/services/AssistantService';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import CreateConversationModal from './CreateConversationModal';
import AssistantSelector from './AssistenteSelector';

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
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [messages, setMessages] = useState<AssistanteMessage[]>([]);
  const [conversations, setConversations] = useState<AssistantThreadResume[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [assistantType, setAssistantType] = useState<AssistantType>(AssistantType.GENERAL)

  useEffect(() => {
    if (!activeConversationId) return;

    setAssistantType(conversations.find(conversation => conversation.thread_id===activeConversationId)?.assistant_id || AssistantType.GENERAL)

    assistantService.listMessages(activeConversationId).then((data) => {
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
    assistantService.listConversations().then((data) => {
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
    setMessages(newMessages as AssistanteMessage[]);
    let responseMessage
    let title;
    if (inputMessage.length > 150) {
      title = inputMessage.substring(0, 150) + '...';
    }else {
      title = inputMessage;
    }
    if (!activeConversationId || conversations.find(c => c.thread_id===activeConversationId)?.assistant_id !== assistantType) {
      const newConversation = await assistantService.createConversation(assistantType, title)
      setActiveConversationId(newConversation.thread_id);
      responseMessage = await assistantService.sendMessage(newConversation.thread_id, inputMessage);
    }else{
      responseMessage = await assistantService.sendMessage(activeConversationId, inputMessage);
    }

    if (!responseMessage) {
      console.error('Invalid response message:', responseMessage);
      return;
    }


    console.log('New message received:', responseMessage.content);

    setMessages([...messages.splice(0, -1), responseMessage]);
  };

  const handleCreateConversation = async (title: string, type: AssistantType) => {

    const newConversation = await assistantService.createConversation(type, title);
    setActiveConversationId(newConversation.thread_id);
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
            {conversations.map(({thread_id: id}) => (
                <ListItem
                  key={`${id}`}
                  className={`${styles.conversationItem} ${id === activeConversationId ? styles.activeConversation : ''}`}
                  onClick={() => {
                    setActiveConversationId(id);
                    setDrawerOpen(false);
                  }}>
                    <span className={styles.conversationName}>{id}</span>
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
          <AssistantSelector assistantType={assistantType} className={styles.inputSelector} onSelectAssistantType={(type)=>setAssistantType(type)}/>
          </Box>
          <IconButton className={styles.sendButton} onClick={handleSend} color="primary">
            <ArrowUpwardIcon sx={{color: '#fff'}} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
