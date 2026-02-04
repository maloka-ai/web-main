// app/components/AssistantChat.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Recharts from 'recharts';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import styles from './assistantChat.module.css';
import assistantService, {
  AssistanteMessage,
  AssistantThreadResume,
  AssistantType,
  SpreadsheetMetadata,
} from '@/services/AssistantService';

import CreateConversationModal from './CreateConversationModal';
import AssistantSelector, {
  Assistants,
  AssistantTypeLabels,
  AssistantTypeLegends,
} from './AssistenteSelector';
import MarkdownMUI from '../MarkdownMUI/MarkdownMUI';

import * as XLSX from 'xlsx';
import EditConversationModal from './EditConversationModal';
import DeleteConversationModal from './DeleteConversationModal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ContentEmpty } from '@/components/AssistantChat/components/ContentEmpty';
import { DrawerConversation } from '@/components/AssistantChat/components/DrawerConversation';

import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import {
  ExpandedState,
  useAssistantChatStore,
} from '@/store/assistantChatStore';
import SqlCodeBox from './components/SqlCodeBox/SqlCodeBox';
import TransferAgent, {
  Payload,
} from './components/TransferAgent/TransferAgent';
import { tr } from 'date-fns/locale';
import { downloadChartAsImage } from '@/utils/graphics';

const SideButtonGroup = styled(ButtonGroup)(({ theme }) => ({
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
    <div>
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
      <Button
        variant="outlined"
        color="primary"
        sx={{
          marginTop: '8px',
          color: '#df8157',
          borderColor: '#df8157',
        }}
        onClick={() => {
          if (containerRef.current) {
            downloadChartAsImage(containerRef.current);
          }
        }}
      >
        Baixar gráfico
      </Button>
    </div>
  );
}

export default function AssistantChat() {
  const [input, setInput] = useState('');
  const { expanded, expandStep, collapseStep } = useAssistantChatStore(
    (s) => s,
  );
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
    AssistantType.DATA,
  );
  const [isGeneratingMessage, setIsGeneratingMessage] =
    useState<boolean>(false);
  const [isShowEllipsisLoading, setIsShowEllipsisLoading] = useState(false);

  const isMobile = useIsMobile();

  // refs do timer/controle
  const ellipsisTimerRef = useRef<number | null>(null);

  const clearEllipsisTimer = () => {
    if (ellipsisTimerRef.current) {
      window.clearTimeout(ellipsisTimerRef.current);
      ellipsisTimerRef.current = null;
    }
  };

  const scheduleEllipsis = () => {
    clearEllipsisTimer();

    // em 1s sem chunk novo → mostra ...
    ellipsisTimerRef.current = window.setTimeout(() => {
      setIsShowEllipsisLoading(true);
    }, 1000);
  };

  const hideEllipsis = () => {
    setIsShowEllipsisLoading(false);
  };

  // chart states: por mensagem id
  const [chartComponents, setChartComponents] = useState<
    Record<string, string>
  >({});
  const [chartLoading, setChartLoading] = useState<Record<string, boolean>>({});
  const [chartError, setChartError] = useState<Record<string, string | true>>(
    {},
  );

  // transfer to agent states
  const [transferAgentInfo, setTransferAgentInfo] = useState<
    Record<string, { analyst: string; question: string }>
  >({});

  // ===== Scroll & Anchoring Refs/State =====
  const messageAreaRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ID da última mensagem do usuário (âncora) e seu nó
  const [lastUserMsgId, setLastUserMsgId] = useState<string | null>(null);
  const lastUserMsgRef = useRef<HTMLDivElement | null>(null);

  // Autoscroll durante streaming por chunk (desliga quando a msg do usuário encosta no topo)
  const [chunkAutoScroll, _setChunkAutoScroll] = useState(false);

  const chunkAutoScrollRef = useRef(chunkAutoScroll);

  const lastScrollTsRef = useRef(0);
  const SCROLL_THROTTLE_MS = 80;

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
    const target = messagesEndRef.current;
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior });
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

  const handleTransfer = async (p: { analyst: string; question: string }) => {
    handleCreateConversation(
      p.question,
      p.analyst as AssistantType,
      (conversationIdPersonalized: string) => {
        handleSend(p.question, true, conversationIdPersonalized);
      },
    );
  };

  const getAnalystInfo = (id: string) => {
    return {
      id,
      name: AssistantTypeLabels[id as AssistantType],
      avatar:
        Assistants.find((a) => a.type == (id as AssistantType))?.icon || '',
    };
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
      setTransferAgentInfo({});
    });
  }, [activeConversationId]);

  //Atualiza as ultimas conversas
  useEffect(() => {
    updateListConversations();
  }, [drawerOpen]);

  const handleSend = async (
    msgPersonalized?: string,
    reset?: boolean,
    conversationIdPersonalized?: string,
  ) => {
    const inputMessage = msgPersonalized ? msgPersonalized : input.trim();
    if (!inputMessage || isGeneratingMessage) return;
    setInput('');
    setIsGeneratingMessage(true);
    scrollToUserMessage('smooth');

    // Cria mensagem do usuário + placeholder do assistente
    const userMsgId = crypto.randomUUID();
    const assistantPlaceholderId = crypto.randomUUID();

    const newMessages: AssistanteMessage[] = [
      ...(reset ? [] : messages),
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
        transfer_to_agent: undefined,
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
      !reset &&
      (!activeConversationId ||
        conversations.find((c) => c.thread_id === activeConversationId)
          ?.assistant_id !== assistantType);

    let conversationId: string = conversationIdPersonalized
      ? conversationIdPersonalized
      : activeConversationId || '';

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
          hideEllipsis();
          scheduleEllipsis();

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
          setChartError((prev) => {
            const copy = { ...prev };
            delete copy[assistantPlaceholderId];
            return copy;
          });
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
          setChartError((prev) => {
            const copy = { ...prev };
            delete copy[assistantPlaceholderId];
            return copy;
          });
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
        onChartCodeError: (errorMsg) => {
          setChartLoading((prev) => ({
            ...prev,
            [assistantPlaceholderId]: false,
          }));
          setChartError((prev) => ({
            ...prev,
            [assistantPlaceholderId]: errorMsg ?? true,
          }));
        },
        onTransfer: (analyst, question) => {
          setMessages((prev) => {
            const i = prev.length - 1;
            const last = prev[i];

            if (i >= 0 && last?.role === 'assistant') {
              const updated = {
                ...last,
                transfer_to_agent: { analyst, question },
              };
              return [...prev.slice(0, i), updated];
            }

            return [
              ...prev,
              {
                role: 'assistant',
                transfer_to_agent: { analyst, question },
              } as AssistanteMessage,
            ];
          });

          setTransferAgentInfo((prev) => ({
            ...prev,
            [assistantPlaceholderId]: { analyst, question },
          }));
        },
        onError: (err) => {
          clearEllipsisTimer();

          //////////// FAZER COMPONENTE PARA ERRO
          console.error('Invalid response message:', err);
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1), // remove mensagem
          ]);
          setChunkAutoScroll(false);
          setIsGeneratingMessage(false);
        },
        onDone: () => {
          clearEllipsisTimer();

          setChunkAutoScroll(false);
          setIsGeneratingMessage(false);
        },
      },
    );
  };

  const handleCopyMessageToInput = (msg: string) => {
    setInput(msg);
  };

  const handleCreateConversation = async (
    title: string,
    type: AssistantType,
    callback?: ((conversationIdPersonalized: string) => void) | undefined,
  ) => {
    const newConversation = await assistantService.createConversation(
      type,
      title,
    );
    setActiveConversationId(newConversation.thread_id);
    if (callback) {
      setTimeout(() => callback(newConversation.thread_id), 2000);
      return;
    }
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

  function showDownloadSpreadsheetButton(msg: AssistanteMessage) {
    if (!msg.spreadsheet_metadata) return false;
    if (typeof msg.spreadsheet_metadata === 'object') {
      return (
        !!msg.spreadsheet_metadata.message_id &&
        !msg.spreadsheet_metadata.insufficient_data_
      );
    }
    return false;
  }

  function showCodeSQLContainer(msg: AssistanteMessage) {
    if (!msg.spreadsheet_metadata) return false;
    if (typeof msg.spreadsheet_metadata === 'object') {
      return !!msg.spreadsheet_metadata.code_sql;
    }
    return false;
  }

  function showInsufficientDataWarning(msg: AssistanteMessage) {
    if (!msg.spreadsheet_metadata) return false;
    if (typeof msg.spreadsheet_metadata === 'object') {
      return !!msg.spreadsheet_metadata.insufficient_data_;
    }
    return false;
  }

  const selectAssistantLabel =
    AssistantTypeLabels[assistantType] || 'Assistente';
  const assistantLegend = AssistantTypeLegends[assistantType] || '';
  const hasConversation = Boolean(activeConversationId) && messages.length > 0;
  const canExpand = expanded !== 'full';
  const canCollapse = expanded !== 'collapsed';
  const widthMap: Record<ExpandedState, string> = {
    collapsed: '25%',
    expanded: '40%',
    full: '100%',
  };
  const maxWidthMap: Record<ExpandedState, string> = {
    collapsed: '25%',
    expanded: '40%',
    full: 'calc(100% - 200px)',
  };

  return (
    <Box
      className={styles.wrapper}
      sx={{
        pt: {
          md: '40px',
        },
        width: {
          xs: '100%',
          md: widthMap[expanded],
        },
        maxWidth: {
          md: maxWidthMap[expanded],
        },
      }}
    >
      {!isMobile && (
        <SideButtonGroup orientation="vertical" variant="outlined">
          <Button
            sx={{
              padding: 0,
              margin: 0,
              border: 'none',
              width: '18px',
              height: '45px',
            }}
            className="btn-top"
            onClick={collapseStep}
            disabled={!canCollapse}
          >
            <ArrowLeftIcon fontSize="large" />
          </Button>

          <Button
            sx={{
              padding: 0,
              margin: 0,
              border: 'none',
              width: '18px',
              height: '45px',
            }}
            onClick={expandStep}
            disabled={!canExpand}
            className="btn-bottom"
          >
            <ArrowRightIcon fontSize="large" />
          </Button>
        </SideButtonGroup>
      )}
      {/*<IconButton*/}
      {/*    className={styles.toggleButton}*/}
      {/*    onClick={() => setExpanded(!expanded)}*/}
      {/*>*/}
      {/*  {expanded ? (*/}
      {/*      <ArrowLeft fontSize={'large'} />*/}
      {/*  ) : (*/}
      {/*      <ArrowRight fontSize={'large'} />*/}
      {/*  )}*/}
      {/*</IconButton>*/}
      <DrawerConversation
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        handleMenuOpen={handleMenuOpen}
      />

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
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            color={'primary'}
          >
            <MenuOpenIcon />
          </IconButton>
          <Stack direction={'column'} alignItems={'center'} spacing={0}>
            <Typography variant="h6" className={styles.headerTitle}>
              Assistente
            </Typography>
            <Typography variant="subtitle2" color={'#2970bf'}>
              {selectAssistantLabel}
            </Typography>
          </Stack>

          <IconButton
            onClick={() => setCreateModalOpen(true)}
            color={'primary'}
          >
            <AddBoxOutlinedIcon />
          </IconButton>
        </Box>

        {/* Área de mensagens */}
        {hasConversation ? (
          <Box
            className={styles.messageArea}
            ref={messageAreaRef}
            sx={{
              xs: {
                overflowX: 'hidden',
                overflowY: 'auto',
              },
            }}
          >
            {messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === 'assistant' && index === messages.length - 1;
              const hasChartForMsg = Boolean(chartComponents[msg.id]);
              const isChartLoadingForMsg = Boolean(chartLoading[msg.id]);
              const isTransferAgentMsg = Boolean(transferAgentInfo[msg.id]);
              const isContentEmpty = !msg.content || !msg.content.trim();

              const isGeneratingThisMessage =
                isLastAssistant &&
                isContentEmpty &&
                !hasChartForMsg &&
                !isChartLoadingForMsg;

              // Ref para a última mensagem do usuário (âncora)
              const maybeUserRefProps =
                msg.role === 'user' && msg.id === lastUserMsgId
                  ? { ref: lastUserMsgRef }
                  : {};

              if (isGeneratingThisMessage) {
                return (
                  <Box key={msg.id} className={styles.botMsg}>
                    Analisando
                    <span
                      className={styles.typingDots}
                      aria-label="digitando"
                    />
                  </Box>
                );
              }

              return (
                <Box
                  key={msg.id}
                  {...maybeUserRefProps}
                  className={
                    msg.role === 'user' ? styles.userMsg : styles.botMsg
                  }
                >
                  <MarkdownMUI>{msg.content}</MarkdownMUI>
                  {isGeneratingMessage &&
                  isShowEllipsisLoading &&
                  isLastAssistant ? (
                    <span
                      className={styles.typingDots}
                      aria-label="digitando"
                    />
                  ) : null}
                  {/* Se a mensagem tem spreadsheet_metadata, botão de download */}
                  {showInsufficientDataWarning(msg) && (
                    <Box
                      sx={{
                        marginTop: 2,
                        padding: 2,
                        borderRadius: 1,
                        backgroundColor: '#fff4e5',
                        border: '1px solid #ffd8b5',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#663c00' }}>
                        Não há dados suficientes para gerar a planilha
                        solicitada.
                      </Typography>
                    </Box>
                  )}
                  {showDownloadSpreadsheetButton(msg) && (
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

                  {showCodeSQLContainer(msg) && (
                    <SqlCodeBox
                      code={
                        (msg.spreadsheet_metadata as SpreadsheetMetadata)
                          .code_sql || ''
                      }
                    />
                  )}

                  {(!!msg.transfer_to_agent || isTransferAgentMsg) && (
                    <TransferAgent
                      payload={
                        (msg.transfer_to_agent as Payload) ||
                        transferAgentInfo[msg.id]
                      }
                      onTransfer={handleTransfer}
                      getAnalystInfo={getAnalystInfo}
                      editableQuestion={true}
                    />
                  )}

                  {/* CHART: Skeleton se estiver carregando */}
                  {chartLoading[msg.id] && (
                    <Box sx={{ marginTop: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={320}
                      />
                    </Box>
                  )}

                  {chartError[msg.id] && (
                    <Box
                      sx={{
                        marginTop: 2,
                        padding: 2,
                        borderRadius: 1,
                        backgroundColor: '#fff3f2',
                        border: '1px solid #fac8c3',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
                        Falha ao gerar o gráfico.
                      </Typography>
                      {typeof chartError[msg.id] === 'string' && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#7f1d1d',
                            display: 'block',
                            marginTop: 1,
                          }}
                        >
                          {chartError[msg.id]}
                        </Typography>
                      )}
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
            <div ref={messagesEndRef} />
          </Box>
        ) : (
          <ContentEmpty
            handleSendMessage={handleSend}
            handleCopyMessageToInput={handleCopyMessageToInput}
            assistantType={assistantType}
          />
        )}

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
                  backgroundColor: '#ffff',
                  borderRadius: '12px',
                  border: 'none !important',
                  boxShadow: 'none !important',
                },
                '& .MuiInputBase-input::placeholder, & textarea::placeholder': {
                  color: '#3e3e3e',
                  opacity: '1',
                },
                '& textarea': {
                  minHeight: '70px',
                  maxHeight: '200px',
                  overflowY: 'scroll',
                  marginBottom: '40px',
                },
              }}
            />
            <Stack direction={'row'} justifyContent={'space-between'}>
              <AssistantSelector
                assistantType={assistantType}
                className={styles.inputSelector}
                onSelectAssistantType={(type) => setAssistantType(type)}
              />
              <IconButton
                sx={{
                  mt: '-46px',
                  mr: '8px',
                  height: '36px',
                  opacity: input.trim() ? 1 : 0.4,
                }}
                size={'small'}
                className={styles.sendButton}
                onClick={() => handleSend()}
                disabled={isGeneratingMessage}
                color="primary"
              >
                {isGeneratingMessage ? (
                  <TypingIndicator />
                ) : (
                  <ArrowUpwardIcon sx={{ color: '#fff' }} fontSize={'small'} />
                )}{' '}
              </IconButton>
            </Stack>
          </Box>
          <Typography variant="caption" mt={1} textAlign={'center'}>
            {assistantLegend}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
