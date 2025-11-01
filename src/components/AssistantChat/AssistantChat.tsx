// app/components/AssistantChat.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Recharts from 'recharts';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Skeleton,
  ClickAwayListener,
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ArrowLeft, ArrowRight, MoreVert } from '@mui/icons-material';

import styles from './assistantChat.module.css';
import assistantService, {
  AssistanteMessage,
  AssistantThreadResume,
  AssistantType,
} from '@/services/AssistantService';

import CreateConversationModal from './CreateConversationModal';
import AssistantSelector from './AssistenteSelector';
import MarkdownMUI from '../MarkdownMUI/MarkdownMUI';

import * as XLSX from 'xlsx';
import EditConversationModal from './EditConversationModal';
import DeleteConversationModal from './DeleteConversationModal';
import { useIsMobile } from '@/hooks/useIsMobile';

function downloadCSVasXLSX(csvString: string, filename = 'dados.xlsx') {
  const worksheet = XLSX.read(csvString, { type: 'string' }).Sheets.Sheet1;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha');
  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function TypingIndicator() {
  return (
    <div className={styles.containerSingleDot}>
      <span className={styles.singleDot}></span>
    </div>
  );
}

/**
 * DynamicChart component
 *
 * Renderiza o TSX recebido dentro de um iframe. O iframe carrega:
 *  - React + ReactDOM (via unpkg)
 *  - Recharts (via unpkg)
 *  - Babel standalone para transpilar JSX em runtime (type="text/babel")
 *
 * O code string deve exportar um componente default (ex: export default function MyChart() { return (<div>...</div>); })
 *
 * Observação de segurança: código arbitrário será executado dentro de um iframe. Este iframe
 * carrega libs via CDN. Se desejar restringir CDN ou usar outro método (por exemplo código pré-transpilado),
 * posso ajustar.
 */
function DynamicChart({
  code,
  height = 320,
}: {
  code: string;
  height?: number | string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    async function renderChart() {
      try {
        const Babel = await import('@babel/standalone');

        let transformed = code;
        let componentName = '';
        const replaceComponentName = 'ChartComponent';

        // === 1. Captura os componentes importados do Recharts ===
        const rechartsImportRegex =
          /import\s*{\s*([^}]+)\s*}\s*from\s*['"]recharts['"];?/;
        const rechartsMatch = transformed.match(rechartsImportRegex);
        if (rechartsMatch) {
          const components = rechartsMatch[1]
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
          for (const comp of components) {
            const compRegex = new RegExp(`\\b${comp}\\b`, 'g');
            transformed = transformed.replace(compRegex, `Recharts.${comp}`);
          }
          transformed = transformed.replace(rechartsImportRegex, '');
        }

        // === 2. Remove importações React ===
        transformed = transformed.replace(
          /import\s+React.*from\s+['"]react['"];?/g,
          '',
        );

        // === 3. Captura o nome do componente exportado ===
        const exportFnMatch = transformed.match(
          /export\s+default\s+function\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+)/,
        );
        if (exportFnMatch) {
          componentName = exportFnMatch[1];
          transformed = transformed.replace(
            /export\s+default\s+function\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+)/,
            'function ' + replaceComponentName,
          );
        } else if (/export\s+default\s+(\w+);?/.test(transformed)) {
          const match = transformed.match(
            /export\s+default\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+);?/,
          );
          if (match) {
            transformed = transformed.replace(
              /export\s+default\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+);?/,
              '',
            );
          }
        }

        // === 4. Envolve tudo num IIFE (sem return no topo) ===
        const wrappedCode = `
          (function() {
            ${transformed}
            return ${replaceComponentName};
          })()
        `;

        // === 5. Transpila JSX -> JS ===
        console.log('Wrapped Code:', wrappedCode);
        const { code: jsCode } = Babel.transform(wrappedCode, {
          presets: ['react'],
        });

        // === 6. Executa ===
        const createComponent = new Function(
          'React',
          'Recharts',
          `return ${jsCode}`,
        );
        const Component = createComponent(React, Recharts);

        if (!Component)
          throw new Error('O código não exportou um componente válido.');

        // === 7. Renderiza ===
        const mod = await import('react-dom/client');
        const ReactDOM = mod.default || mod;
        const root = ReactDOM.createRoot(containerRef.current!);
        root.render(React.createElement(Component));
      } catch (err) {
        console.error('Erro ao interpretar gráfico:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color:#b91c1c;padding:8px;">Erro ao renderizar gráfico: ${
            (err as Error).message
          }</div>`;
        }
      }
    }

    renderChart();
  }, [code]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    />
  );
}

export default function AssistantChat() {
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messages, setMessages] = useState<AssistanteMessage[]>([]);
  const [conversations, setConversations] = useState<AssistantThreadResume[]>(
    [],
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [assistantType, setAssistantType] = useState<AssistantType>(
    AssistantType.GENERAL,
  );
  const [isGeneratingMessage, setIsGeneratingMessage] =
    useState<boolean>(false);
  const isMobile = useIsMobile();

  // chart states: por mensagem id
  const [chartComponents, setChartComponents] = useState<
    Record<string, string>
  >({});
  const [chartLoading, setChartLoading] = useState<Record<string, boolean>>({});

  // ===== Scroll & Anchoring Refs/State =====
  const messageAreaRef = useRef<HTMLDivElement | null>(null);

  // ID da última mensagem do usuário (âncora) e seu nó
  const [lastUserMsgId, setLastUserMsgId] = useState<string | null>(null);
  const lastUserMsgRef = useRef<HTMLDivElement | null>(null);

  // Autoscroll durante streaming por chunk (desliga quando a msg do usuário encosta no topo)
  const [chunkAutoScroll, _setChunkAutoScroll] = useState(false);

  const chunkAutoScrollRef = useRef(chunkAutoScroll);

  const lastScrollTsRef = useRef(0);
  const SCROLL_THROTTLE_MS = 80;
  // ===== ================ =====

  const tryScrollThrottled = () => {
    const now = performance.now();
    if (now - lastScrollTsRef.current < SCROLL_THROTTLE_MS) return;
    lastScrollTsRef.current = now;

    if (userMsgReachedTop(0)) {
      setChunkAutoScroll(false);
    } else {
      scrollToUserMessage('auto');
    }
  };

  const setChunkAutoScroll = (v: boolean | ((prev: boolean) => boolean)) => {
    // suporta set direto ou com função
    const next =
      typeof v === 'function'
        ? (v as (p: boolean) => boolean)(chunkAutoScrollRef.current)
        : v;
    chunkAutoScrollRef.current = next;
    _setChunkAutoScroll(next);
  };

  const scrollToUserMessage = (behavior: ScrollBehavior = 'smooth') => {
    const container = messageAreaRef.current;
    const target = lastUserMsgRef.current;
    if (!container || !target) return;

    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();

    // alinhar o topo da msg com o topo do container (ajuste um padding se quiser)
    const padding = 8; // px
    const delta = tRect.top - cRect.top - padding;

    container.scrollTo({
      top: container.scrollTop + delta,
      behavior,
    });
  };
  const userMsgReachedTop = (threshold = 10) => {
    const area = messageAreaRef.current;
    const node = lastUserMsgRef.current;
    if (!area || !node) return false;
    const areaTop = area.getBoundingClientRect().top;
    const nodeTop = node.getBoundingClientRect().top;
    return nodeTop <= areaTop + threshold;
  };

  // Atualiza lista de conversas
  const updateListConversations = async () => {
    const data = await assistantService.listConversations().catch((error) => {
      console.error('Error fetching conversations:', error);
    });
    if (!data || !Array.isArray(data)) {
      console.error('Invalid conversations data:', data);
      return;
    }
    setConversations(data);
    return data;
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    conversation: any,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    handleMenuClose();
    setDeleteModalOpen(true);
  };

  // Carrega mensagens quando muda a conversa ativa
  useEffect(() => {
    if (!activeConversationId) return;

    updateListConversations().then((conversations_) => {
      if (!conversations_ || !Array.isArray(conversations_)) {
        console.error('Invalid conversations data:', conversations_);
        return;
      }
      setAssistantType(
        conversations_.find((c) => c.thread_id === activeConversationId)
          ?.assistant_id || assistantType,
      );
    });

    assistantService.listMessages(activeConversationId).then((data) => {
      if (!data || !Array.isArray(data)) {
        console.error('Invalid messages data:', data);
        return;
      }
      // set chartComponents if chart_code is present
      //O argumento do tipo 'string[]' não é atribuível ao parâmetro do tipo 'SetStateAction<Record<string, string>>'.
      //O tipo 'string[]' não pode ser atribuído ao tipo 'Record<string, string>'.
      //A assinatura do índice para o tipo 'string' está ausente no tipo 'string[]'.ts(2345)

      const chartComponents = data.reduce(
        (acc, msg) => {
          if (msg.chart_code) {
            acc[msg.id] = msg.chart_code;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
      setChartComponents(chartComponents);
      setMessages(data.length ? data : []);
    });
  }, [activeConversationId]);

  //Atualiza as ultimas conversas
  useEffect(() => {
    updateListConversations();
  }, [drawerOpen]);

  //// Efeito para scrollar a tela quando usuário fazer nova pergunta
  useEffect(() => {
    if (lastUserMsgId) {
      scrollToUserMessage('smooth');
    }
  }, [lastUserMsgId]);

  const handleSend = async () => {
    const inputMessage = input.trim();
    if (!inputMessage || isGeneratingMessage) return;
    setInput('');
    setIsGeneratingMessage(true);

    // Cria mensagem do usuário + placeholder do assistente
    const userMsgId = crypto.randomUUID();
    const assistantPlaceholderId = crypto.randomUUID();

    const newMessages: AssistanteMessage[] = [
      ...messages,
      {
        content: inputMessage,
        role: 'user',
        id: userMsgId,
        spreadsheet_metadata: null,
        chart_code: null,
        created_at: new Date(),
        thread_id: activeConversationId ?? '',
        user_id: '',
      },
      {
        content: '',
        role: 'assistant',
        id: assistantPlaceholderId,
        spreadsheet_metadata: null,
        chart_code: null,
        created_at: new Date(),
        thread_id: activeConversationId ?? '',
        user_id: '',
      },
    ];
    setMessages(newMessages);
    setLastUserMsgId(userMsgId);

    // Define título da conversa (se for criar)
    const title =
      inputMessage.length > 150
        ? inputMessage.substring(0, 150) + '...'
        : inputMessage;

    const isNewConversation =
      !activeConversationId ||
      conversations.find((c) => c.thread_id === activeConversationId)
        ?.assistant_id !== assistantType;

    let conversationId: string = activeConversationId || '';

    if (isNewConversation) {
      const newConversation = await assistantService.createConversation(
        assistantType,
        title,
      );
      conversationId = newConversation.thread_id;
      setActiveConversationId(newConversation.thread_id);
    }

    setChunkAutoScroll(true);

    await assistantService.sendMessageStreaming(
      inputMessage,
      conversationId ?? '',
      {
        onChunk: (chunk) => {
          setMessages((prev) => {
            const i = prev.length - 1;
            const last = prev[i];

            if (i >= 0 && last?.role === 'assistant') {
              const updated = {
                ...last,
                content: (last.content ?? '') + chunk,
              };
              return [...prev.slice(0, i), updated];
            }

            return [
              ...prev,
              { role: 'assistant', content: chunk } as AssistanteMessage,
            ];
          });

          // Enquanto estiver em autoscroll, rola para o fim,
          // mas para quando a msg do usuário encostar no topo.
          if (!chunkAutoScrollRef.current) return;
          // aguarda layout antes de verificar/rolar
          requestAnimationFrame(() => {
            tryScrollThrottled();
          });
        },
        onMetadata: (meta) => {
          setMessages((prev) => {
            const i = prev.length - 1;
            const last = prev[i];

            if (i >= 0 && last?.role === 'assistant') {
              const updated = {
                ...last,
                ...meta,
              } as AssistanteMessage;
              return [...prev.slice(0, i), updated];
            }
            return prev;
          });
        },
        onChartCodeLoading: () => {
          // mostra skeleton para a mensagem placeholder
          setChartLoading((prev) => ({
            ...prev,
            [assistantPlaceholderId]: true,
          }));
        },
        onChartCode: (chartCode) => {
          // salva código do chart e desliga loading
          setChartComponents((prev) => ({
            ...prev,
            [assistantPlaceholderId]: chartCode,
          }));
          setChartLoading((prev) => ({
            ...prev,
            [assistantPlaceholderId]: false,
          }));
          // também garante que a mensagem do assistant (placeholder) tenha conteúdo se estiver vazia
          setMessages((prev) => {
            const i = prev.length - 1;
            const last = prev[i];
            if (
              i >= 0 &&
              last?.role === 'assistant' &&
              (!last.content || last.content.trim() === '')
            ) {
              const updated = { ...last, content: '' } as AssistanteMessage;
              return [...prev.slice(0, i), updated];
            }
            return prev;
          });
        },
        onChartCodeEnd: () => {
          setChartLoading((prev) => ({
            ...prev,
            [assistantPlaceholderId]: false,
          }));
        },
        onError: (err) => {
          //////////// FAZER COMPONENTE PARA ERRO
          console.error('Invalid response message:', err);
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1), // remove mensagem
          ]);
          setChunkAutoScroll(false);
          setIsGeneratingMessage(false);
        },
        onDone: () => {
          setChunkAutoScroll(false);
          setIsGeneratingMessage(false);
        },
      },
    );
  };

  const handleCreateConversation = async (
    title: string,
    type: AssistantType,
  ) => {
    const newConversation = await assistantService.createConversation(
      type,
      title,
    );
    setActiveConversationId(newConversation.thread_id);
    setMessages([]);
  };

  async function handleDownloadMetada(msg: AssistanteMessage) {
    if (msg.spreadsheet_metadata) {
      try {
        const msgId =
          typeof msg.spreadsheet_metadata === 'object' &&
          'message_id' in msg.spreadsheet_metadata
            ? msg.spreadsheet_metadata.message_id
            : msg.id;
        const csvData = await assistantService.downloadSpreadsheet(msgId);
        downloadCSVasXLSX(csvData, `spreadsheet_${msg.id}.xlsx`);
      } catch (error) {
        console.error('Error downloading spreadsheet:', error);
      }
    }
  }

  return (
    <Box
      className={styles.wrapper}
      sx={{
        pt: {
          md: '40px',
        },
        width: {
          xs: '100%',
          md: !expanded ? '25%' : '60%',
        },
      }}
    >
      {!isMobile && (
        <IconButton
          className={styles.toggleButton}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ArrowLeft /> : <ArrowRight />}
        </IconButton>
      )}

      <Box
        className={styles.drawerOverlay}
        sx={{
          display: drawerOpen ? 'block' : 'none',
          top: {
            xs: '0',
            md: '40px',
          },
        }}
      >
        <Box className={styles.drawer}>
          <Box className={styles.drawerHeader}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <MenuOpenIcon />
            </IconButton>
            <Typography variant="h6" className={styles.drawerTitle}>
              Histórico
            </Typography>
          </Box>
          <List>
            {conversations.map(({ thread_id: id, title }) => (
              <ListItem
                key={`${id}`}
                className={`${styles.conversationItem} ${id === activeConversationId ? styles.activeConversation : ''}`}
                onClick={() => {
                  setActiveConversationId(id);
                  setDrawerOpen(false);
                }}
              >
                <span className={styles.conversationName}>{title}</span>
                <IconButton
                  className={styles.menuButton}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, { thread_id: id, title });
                  }}
                >
                  <MoreVert fontSize="small" sx={{ color: '#df8157' }} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          className={styles.drawerBackdrop}
          onClick={() => setDrawerOpen(false)}
        />
      </Box>

      {/* Menu de opções */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Renomear</MenuItem>
        <MenuItem onClick={handleDelete}>Excluir</MenuItem>
      </Menu>
      {/* Modais */}
      {selectedConversation && (
        <>
          <EditConversationModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            currentTitle={selectedConversation.title}
            onSave={async (newTitle) => {
              const changeThread = await assistantService.editConversation(
                selectedConversation.thread_id,
                newTitle,
              );
              if (changeThread.title) {
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.thread_id === changeThread.thread_id
                      ? { ...conv, title: changeThread.title }
                      : conv,
                  ),
                );
              }
              setEditModalOpen(false);
            }}
          />

          <DeleteConversationModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            conversationTitle={selectedConversation.title}
            onDelete={async () => {
              const deletedThread = await assistantService.deleteConversation(
                selectedConversation.thread_id,
              );

              if (
                deletedThread.message &&
                activeConversationId === selectedConversation.thread_id
              ) {
                setActiveConversationId(null);
                setMessages([]);
                setConversations((prev) =>
                  prev.filter(
                    (conv) => conv.thread_id !== selectedConversation.thread_id,
                  ),
                );
              }
              setDeleteModalOpen(false);
            }}
          />
        </>
      )}

      <CreateConversationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateConversation}
      />

      {/* Chat Box */}
      <Paper
        elevation={3}
        className={styles.chatContainer}
        sx={{
          position: 'relative',
          borderRadius: {
            md: '12px 12px 0 0',
          },
          minHeight: {
            md: '600px',
          },
        }}
      >
        <Box
          className={styles.header}
          sx={{
            background: 'inherit',
            xs: {
              position: 'sticky',
              top: 0,
            },
          }}
        >
          <IconButton
            onClick={(e) => {
              console.log('passou aqui');
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            color={'primary'}
          >
            <MenuOpenIcon />
          </IconButton>
          <Typography variant="h6" className={styles.headerTitle}>
            Assistente
          </Typography>
          <IconButton
            onClick={() => setCreateModalOpen(true)}
            color={'primary'}
          >
            <AddBoxOutlinedIcon />
          </IconButton>
        </Box>

        {/* Área de mensagens */}
        <Box
          className={styles.messageArea}
          ref={messageAreaRef}
          sx={{
            xs: {
              overflow: 'hidden',
            },
          }}
        >
          {messages.map((msg, index) => {
            const isGeneratingMessage =
              msg.role === 'assistant' &&
              index === messages.length - 1 &&
              !msg.content;

            // Ref para a última mensagem do usuário (âncora)
            const maybeUserRefProps =
              msg.role === 'user' && msg.id === lastUserMsgId
                ? { ref: lastUserMsgRef }
                : {};

            if (isGeneratingMessage) {
              return (
                <Box key={msg.id} className={styles.botMsg}>
                  Analisando
                  <span className={styles.typingDots} aria-label="digitando" />
                </Box>
              );
            }

            return (
              <Box
                key={msg.id}
                {...maybeUserRefProps}
                className={msg.role === 'user' ? styles.userMsg : styles.botMsg}
              >
                <MarkdownMUI>{msg.content}</MarkdownMUI>

                {/* Se a mensagem tem spreadsheet_metadata, botão de download */}
                {msg.spreadsheet_metadata && (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      marginTop: '8px',
                      color: '#df8157',
                      borderColor: '#df8157',
                    }}
                    onClick={() => {
                      handleDownloadMetada(msg);
                    }}
                  >
                    Baixar Planilha
                  </Button>
                )}

                {/* CHART: Skeleton se estiver carregando */}
                {chartLoading[msg.id] && (
                  <Box sx={{ marginTop: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={320} />
                  </Box>
                )}

                {/* CHART: se temos o component code, renderiza via DynamicChart */}
                {chartComponents[msg.id] && (
                  <Box sx={{ marginTop: 2 }}>
                    <DynamicChart
                      code={chartComponents[msg.id]}
                      height={'100%'}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Input */}
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
                  e.preventDefault();
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
            <AssistantSelector
              assistantType={assistantType}
              className={styles.inputSelector}
              onSelectAssistantType={(type) => setAssistantType(type)}
            />
          </Box>
          <IconButton
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isGeneratingMessage}
            color="primary"
          >
            {isGeneratingMessage ? (
              <TypingIndicator />
            ) : (
              <ArrowUpwardIcon sx={{ color: '#fff' }} />
            )}{' '}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
