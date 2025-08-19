// app/components/AssistantChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import styles from './assistantChat.module.css';
import assistantService, { Assistant, AssistanteMessage, AssistantThreadResume, AssistantType } from '@/services/AssistantService';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import CreateConversationModal from './CreateConversationModal';
import AssistantSelector from './AssistenteSelector';
import MarkdownMUI from '../MarkdownMUI/MarkdownMUI';

import * as XLSX from 'xlsx';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface Conversation {
  id: string;
  title: string;
}


function downloadCSVasXLSX(csvString: string, filename = 'dados.xlsx') {
  // Converte a string CSV para um worksheet
  const worksheet = XLSX.read(csvString, { type: 'string' }).Sheets.Sheet1;

  // Cria um novo workbook com a worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha');

  // Gera o array buffer
  const arrayBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Cria o Blob manualmente a partir do array
  const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Inicia o download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AssistantChat() {
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [messages, setMessages] = useState<AssistanteMessage[]>([]);
  const [conversations, setConversations] = useState<AssistantThreadResume[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [assistantType, setAssistantType] = useState<AssistantType>(AssistantType.GENERAL)

  const updateListConversations = async () => {
    const data = await assistantService
      .listConversations()
      .catch((error) => {
        console.error('Error fetching conversations:', error);
      });

    if (!data || !Array.isArray(data)) {
      console.error('Invalid conversations data:', data);
      return;
    }
    setConversations(data);
    return data;
  };

  useEffect(() => {
    if (!activeConversationId) return;

    updateListConversations().then((conversations_) => {
      if (!conversations_ || !Array.isArray(conversations_)) {
        console.error('Invalid conversations data:', conversations_);
        return;
      }
      setAssistantType(conversations_.find(conversation => conversation.thread_id===activeConversationId)?.assistant_id || assistantType)
    });

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
    updateListConversations();
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
      const newConversation = await assistantService.createConversation(assistantType, title);
      setActiveConversationId(newConversation.thread_id);
      responseMessage = await assistantService.sendMessage(newConversation.thread_id, inputMessage);
    }else{
      responseMessage = await assistantService.sendMessage(activeConversationId, inputMessage);
    }

    if (!responseMessage) {
      console.error('Invalid response message:', responseMessage);
      return;
    }

    setMessages(
      (prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the last "Analisando..." message
        {
          content: responseMessage.content,
          role: 'assistant',
          spreadsheet_metadata: responseMessage.spreadsheet_metadata,
          id: responseMessage.id
        },
      ] as AssistanteMessage[]
    );
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
            {conversations.map(({thread_id: id, title}) => (
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
              <MarkdownMUI>{msg.content}</MarkdownMUI>
              {/* Botão para baixar a planilha */}
              {msg.spreadsheet_metadata && (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ marginTop: '8px', color: '#df8157', borderColor: '#df8157' }}
                  onClick={() => {
                    if (msg.spreadsheet_metadata) {
                      assistantService.downloadSpreadsheet(msg.id)
                        .then((csvData) => {
                          downloadCSVasXLSX(csvData, `spreadsheet_${msg.id}.xlsx`);
                        })
                        .catch((error) => {
                          console.error('Error downloading spreadsheet:', error);
                        });
                    }
                  }}
                >
                  Baixar Planilha
                </Button>
              )}
            </Box>
          ))}
        </Box>

        <Box className={styles.inputArea}>
          <Box className={styles.inputWrapper}>
          <TextField
            fullWidth
            placeholder="Escreva aqui sua solicitação"
            multiline
            key={assistantType}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Impede quebra de linha
                handleSend();
              }
            }}
            sx={{
              borderRadius: '12px',
              backgroundColor: '#ffff',
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
