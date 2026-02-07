// app/components/AssistantChat.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Paper,
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
  StreamingCallbacks,
} from '@/services/AssistantService';

import CreateConversationModal from './CreateConversationModal';
import AssistantSelector, {
  AssistantTypeLabels,
  AssistantTypeLegends,
} from './AssistenteSelector';
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
import { MsgChat } from '@/components/AssistantChat/components/Message/MsgChat';
import VoiceRecorder from '@/components/AssistantChat/components/VoiceRecorder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useControlModal } from '@/hooks/useControlModal';
import { ListSchedulingDialog } from '@/components/dialog/ListSchedulingDialog';

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

function TypingIndicator() {
  return (
    <div className={styles.containerSingleDot}>
      <span className={styles.singleDot}></span>
    </div>
  );
}

export default function AssistantChat() {
  const [input, setInput] = useState('');
  const [openScheduleDialog, onOpenScheduleDialog, onCloseScheduleDialog] =
    useControlModal();

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
  const [isRecording, setIsRecording] = useState(false);
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
        handleSend({
          msgPersonalized: p.question,
          reset: true,
          conversationIdPersonalized: conversationIdPersonalized,
        });
      },
    );
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

  const handleSend = async (props?: {
    msgPersonalized?: string;
    reset?: boolean;
    conversationIdPersonalized?: string;
    fileAudio?: File;
  }) => {
    const isMessageAudio = !!props?.fileAudio;
    const inputMessage = props?.msgPersonalized
      ? props?.msgPersonalized
      : input.trim();

    if ((!isMessageAudio && !inputMessage) || isGeneratingMessage) return;

    setInput('');
    setIsGeneratingMessage(true);
    scrollToUserMessage('smooth');

    // Cria mensagem do usuário + placeholder do assistente
    const userMsgId = crypto.randomUUID();
    const assistantPlaceholderId = crypto.randomUUID();

    const messageUser: AssistanteMessage = isMessageAudio
      ? {
          content: '',
          role: 'user',
          id: userMsgId,
          spreadsheet_metadata: null,
          chart_code: null,
          created_at: new Date(),
          thread_id: activeConversationId ?? '',
          user_id: '',
          file_audio_url: URL.createObjectURL(props!.fileAudio!),
        }
      : {
          content: inputMessage,
          role: 'user',
          id: userMsgId,
          spreadsheet_metadata: null,
          chart_code: null,
          created_at: new Date(),
          thread_id: activeConversationId ?? '',
          user_id: '',
        };

    const newMessages: AssistanteMessage[] = [
      ...(props?.reset ? [] : messages),
      messageUser,
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
      !props?.reset &&
      (!activeConversationId ||
        conversations.find((c) => c.thread_id === activeConversationId)
          ?.assistant_id !== assistantType);

    let conversationId: string = props?.conversationIdPersonalized
      ? props?.conversationIdPersonalized
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
    const callbacks: StreamingCallbacks = {
      onChunk: (chunk) => {
        hideEllipsis();
        scheduleEllipsis();
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];

          if (last && last.role === 'assistant') {
            const next = prev.slice(); // copia uma vez
            next[lastIndex] = {
              ...last,
              content: (last.content ?? '') + chunk,
            };
            return next;
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
              ...('spreadsheet_metadata' in meta &&
              typeof meta.spreadsheet_metadata === 'object' &&
              meta.spreadsheet_metadata !== null &&
              'message_id' in meta.spreadsheet_metadata
                ? { id: meta.spreadsheet_metadata.message_id }
                : {}),
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
    };

    if (isMessageAudio) {
      await assistantService.sendMessageStreaming({
        threadId: conversationId ?? '',
        callbacks,
        fileAudio: props.fileAudio,
        isAudio: true,
      });
    } else {
      await assistantService.sendMessageStreaming({
        message: inputMessage,
        threadId: conversationId ?? '',
        callbacks,
      });
    }
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
          <Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
              }}
              color={'primary'}
            >
              <MenuOpenIcon />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenScheduleDialog();
              }}
              color={'primary'}
              title={'Agendamentos'}
            >
              <CalendarMonthIcon color={'primary'} />
            </IconButton>
          </Box>

          <Stack direction={'column'} alignItems={'center'} spacing={0}>
            <Typography variant="h6" className={styles.headerTitle}>
              Assistente
            </Typography>
            <Typography
              variant="subtitle2"
              color={'#2970bf'}
              textAlign={'center'}
            >
              {selectAssistantLabel}
            </Typography>
          </Stack>

          <IconButton
            onClick={() => setCreateModalOpen(true)}
            color={'primary'}
            sx={{ ml: '40px' }}
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
            {messages.map((msg, index) => (
              <MsgChat
                msg={msg}
                isLast={index === messages.length - 1}
                chartComponents={chartComponents}
                chartLoading={chartLoading}
                chartError={chartError}
                transferAgentInfo={transferAgentInfo}
                isGeneratingMessage={isGeneratingMessage}
                isShowEllipsisLoading={isShowEllipsisLoading}
                handleTransfer={handleTransfer}
                lastUserMsgRef={lastUserMsgRef}
                lastUserMsgId={lastUserMsgId}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        ) : (
          <ContentEmpty
            handleSendMessage={(msg) => handleSend({ msgPersonalized: msg })}
            handleCopyMessageToInput={handleCopyMessageToInput}
            assistantType={assistantType}
          />
        )}

        {/* Input */}
        <Box className={styles.inputArea}>
          <Box className={styles.inputWrapper}>
            <TextField
              slotProps={{
                input: {
                  readOnly: isRecording,
                },
              }}
              fullWidth
              placeholder={isRecording ? '' : 'Escreva aqui sua solicitação'}
              multiline
              minRows={3}
              maxRows={7}
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
                  marginBottom: isRecording ? '-43px' : '40px',
                  transition: 'margin 0.5s ease',
                },
              }}
            />
            {isRecording ? (
              <VoiceRecorder
                onSend={async (blob, meta) => {
                  // ✅ Baixar o áudio .webm para teste
                  const fileName = `voice-${Date.now()}.webm`;
                  const webmBlob = blob.type?.includes('webm')
                    ? blob
                    : new Blob([blob], { type: 'audio/webm' });

                  const url = URL.createObjectURL(webmBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);

                  // continua seu fluxo normal (upload / criação da msg)
                  handleSend({
                    msgPersonalized: 'Áudio',
                    fileAudio: new File([webmBlob], fileName, {
                      type: webmBlob.type || 'audio/webm',
                    }),
                  });
                }}
                maxDurationMs={60_000}
                onClose={() => setIsRecording(false)}
              />
            ) : (
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
                    <ArrowUpwardIcon
                      sx={{ color: '#fff' }}
                      fontSize={'small'}
                    />
                  )}{' '}
                </IconButton>
                {/*{input.trim() ? (*/}
                {/*  <IconButton*/}
                {/*    sx={{*/}
                {/*      mt: '-46px',*/}
                {/*      mr: '8px',*/}
                {/*      height: '36px',*/}
                {/*      opacity: input.trim() ? 1 : 0.4,*/}
                {/*    }}*/}
                {/*    size={'small'}*/}
                {/*    className={styles.sendButton}*/}
                {/*    onClick={() => handleSend()}*/}
                {/*    disabled={isGeneratingMessage}*/}
                {/*    color="primary"*/}
                {/*  >*/}
                {/*    {isGeneratingMessage ? (*/}
                {/*      <TypingIndicator />*/}
                {/*    ) : (*/}
                {/*      <ArrowUpwardIcon*/}
                {/*        sx={{ color: '#fff' }}*/}
                {/*        fontSize={'small'}*/}
                {/*      />*/}
                {/*    )}{' '}*/}
                {/*  </IconButton>*/}
                {/*) : (*/}
                {/*  <IconButton*/}
                {/*    sx={{*/}
                {/*      mt: '-46px',*/}
                {/*      mr: '8px',*/}
                {/*      height: '36px',*/}
                {/*    }}*/}
                {/*    size={'small'}*/}
                {/*    className={styles.sendButton}*/}
                {/*    onClick={() => setIsRecording(true)}*/}
                {/*    color="primary"*/}
                {/*    title={'Gravar Audio'}*/}
                {/*  >*/}
                {/*    <MicIcon sx={{ color: '#fff' }} fontSize={'small'} />*/}
                {/*  </IconButton>*/}
                {/*)}*/}
              </Stack>
            )}
          </Box>
          <Typography variant="caption" mt={1} textAlign={'center'}>
            {assistantLegend}
          </Typography>
        </Box>
      </Paper>

      <CreateConversationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateConversation}
      />
      <ListSchedulingDialog
        open={openScheduleDialog}
        onClose={onCloseScheduleDialog}
      />

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
              }
              setConversations((prev) =>
                prev.filter(
                  (conv) => conv.thread_id !== selectedConversation.thread_id,
                ),
              );
              setDeleteModalOpen(false);
            }}
          />
        </>
      )}
    </Box>
  );
}
