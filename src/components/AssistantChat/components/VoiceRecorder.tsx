'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PauseIcon from '@mui/icons-material/Pause';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'react-toastify';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import VoiceWaveform from './VoiceWaveform';
import styles from '@/components/AssistantChat/assistantChat.module.css';

type SendMeta = { durationMs: number; mimeType: string };

export type VoiceRecorderProps = {
  onSend: (blob: Blob, meta: SendMeta) => Promise<void> | void;
  maxDurationMs?: number;
  disabled?: boolean;
  onClose: () => void;
};

type Status = 'recording' | 'paused' | 'inactive';

function notifyError(message: string) {
  toast.error(message, { position: 'bottom-right', autoClose: 4500 });
}

function mapMicError(err: any): string {
  const name = err?.name || 'UNKNOWN';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Permissão de microfone negada. Libere o microfone nas configurações do navegador (cadeado).';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Nenhum microfone foi encontrado no dispositivo.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Não foi possível acessar o microfone. Ele pode estar em uso por outro app (Meet/Zoom/Discord).';
  }
  if (name === 'SecurityError') {
    return 'O navegador bloqueou o acesso ao microfone. Verifique HTTPS e permissões.';
  }
  return 'Não foi possível acessar o microfone.';
}

function formatTimeMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function VoiceRecorder({
  onSend,
  maxDurationMs = 120_000,
  disabled = false,
  onClose,
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<Status>('recording');
  const [timerLabel, setTimerLabel] = useState('00:00');
  const [durationMs, setDurationMs] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // preview atual (para ouvir enquanto pausado ou após finalizar)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // gravações por take (WhatsApp-like): pausa fecha take e permite ouvir; retomar cria outra take
  const takesRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string>('audio/webm');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<InstanceType<typeof RecordPlugin> | null>(null);

  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const wsOptions = {
    height: 28,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    waveColor: '#756D71',
    progressColor: '#4F4A85',
    cursorWidth: 0,
    normalize: true,
  };

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const destroyAll = useCallback(() => {
    cleanupTimer();

    try {
      recordRef.current?.stopMic?.();
    } catch {}
    try {
      recordRef.current?.stopRecording?.();
    } catch {}

    try {
      wsRef.current?.destroy();
    } catch {}

    wsRef.current = null;
    recordRef.current = null;

    revokePreviewUrl();
    setPreviewUrl(null);

    takesRef.current = [];
  }, [cleanupTimer, revokePreviewUrl]);

  const startInternalTimer = useCallback(
    (startFromMs: number) => {
      cleanupTimer();
      startedAtRef.current = Date.now() - startFromMs;
      timerRef.current = window.setInterval(() => {
        const ms = Date.now() - startedAtRef.current;
        setDurationMs(ms);
        setTimerLabel(formatTimeMs(ms));

        if (maxDurationMs > 0 && ms >= maxDurationMs) {
          pauseToListen(); // auto-pausa e permite ouvir
        }
      }, 200);
    },
    [cleanupTimer, maxDurationMs],
  );

  const buildCombinedPreview = useCallback(() => {
    // concatena takes já finalizadas (e toca elas)
    const combined = new Blob(takesRef.current, { type: mimeRef.current });
    revokePreviewUrl();
    const url = URL.createObjectURL(combined);
    setPreviewUrl(url);
  }, [revokePreviewUrl]);

  const init = useCallback(async () => {
    if (!containerRef.current) return;
    if (disabled) return;

    containerRef.current.innerHTML = '';

    const ws = WaveSurfer.create({
      container: containerRef.current,
      ...wsOptions,
    });

    const record = ws.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        mediaRecorderTimeslice: 1100,
        mimeType: 'audio/webm',
      }),
    );

    wsRef.current = ws;
    recordRef.current = record;

    // eventos
    record.on('record-start', () => {
      setStatus('recording');
      // não zera takes aqui — zera só no mount (init) / discard
      startInternalTimer(durationMs);
    });

    record.on('record-progress', (ms: number) => {
      setDurationMs(ms);
      setTimerLabel(formatTimeMs(ms));
    });

    record.on('record-end', (blob: Blob) => {
      // cada "stopRecording" vira uma take
      if (blob && blob.size > 0) {
        takesRef.current.push(blob);
        mimeRef.current = blob.type || mimeRef.current;
      }
      buildCombinedPreview();
      setStatus('paused');
    });

    try {
      // começar gravando automaticamente
      await record.startRecording();
      setStatus('recording');
      startInternalTimer(0);
    } catch (err) {
      notifyError(mapMicError(err));
      onClose();
    }
  }, [
    buildCombinedPreview,
    disabled,
    durationMs,
    onClose,
    startInternalTimer,
    wsOptions,
  ]);

  // ✅ Pausar e já poder ouvir: fecha a take atual e cria preview concatenado
  const pauseToListen = useCallback(async () => {
    const record = recordRef.current;
    if (!record) return;
    if (status !== 'recording') return;

    cleanupTimer();
    try {
      await record.stopRecording(); // dispara record-end(blob)
      try {
        await record.stopMic?.();
      } catch {}
      setStatus('paused');
    } catch {
      notifyError('Não foi possível pausar a gravação.');
    }
  }, [cleanupTimer, status]);

  // ✅ Retomar: inicia nova take e continua acumulando
  const resumeRecording = useCallback(async () => {
    const record = recordRef.current;
    if (!record) return;
    if (disabled) return;
    if (status !== 'paused') return;

    // para o player do preview (se estiver tocando)
    try {
      wsRef.current?.pause?.();
    } catch {}

    // limpa o preview visual (opcional; pode manter)
    // setPreviewUrl(previewUrl) -> mantém para ouvir takes anteriores
    try {
      await record.startRecording();
      setStatus('recording');
      startInternalTimer(durationMs);
    } catch (err) {
      notifyError(mapMicError(err));
    }
  }, [disabled, durationMs, startInternalTimer, status]);

  const finalizeToPreview = useCallback(async () => {
    // Finalizar é igual “pause” porém muda status para inactive
    const record = recordRef.current;
    if (!record) return;

    cleanupTimer();

    if (status === 'recording') {
      try {
        await record.stopRecording(); // record-end adiciona take + preview concatenado
        try {
          await record.stopMic?.();
        } catch {}
      } catch {
        notifyError('Não foi possível finalizar a gravação.');
        return;
      }
    }

    setStatus('inactive');
  }, [cleanupTimer, status]);

  const handleDiscard = useCallback(() => {
    destroyAll();
    onClose();
  }, [destroyAll, onClose]);

  const handleSend = useCallback(async () => {
    if (disabled) return;
    if (isSending) return;

    // garante que temos algo gravado
    if (!takesRef.current.length) {
      notifyError('Nenhum áudio para enviar.');
      return;
    }

    // se ainda estava gravando, fecha take atual antes de enviar
    if (status === 'recording') {
      await finalizeToPreview();
    }

    const blob = new Blob(takesRef.current, { type: mimeRef.current });
    if (!blob.size) {
      notifyError('Nenhum áudio para enviar.');
      return;
    }

    setIsSending(true);
    try {
      console.log('Enciando audio');
      await onSend(blob, { durationMs, mimeType: mimeRef.current });
      destroyAll();
      onClose();
    } catch (e: any) {
      notifyError(e?.message || 'Falha ao enviar o áudio.');
    } finally {
      setIsSending(false);
    }
  }, [
    disabled,
    durationMs,
    finalizeToPreview,
    isSending,
    onClose,
    onSend,
    destroyAll,
    status,
  ]);

  useEffect(() => {
    // reset inicial
    takesRef.current = [];
    mimeRef.current = 'audio/webm';
    setPreviewUrl(null);
    setDurationMs(0);
    setTimerLabel('00:00');
    setStatus('recording');

    init();

    return () => {
      destroyAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasAnyAudio = takesRef.current.length > 0;
  const showPreviewPlayer = status === 'paused' || status === 'inactive';

  return (
    <Stack spacing={1} mt="-46px" alignItems="center" width="100%" px={1}>
      <Stack direction="row" spacing={1} alignItems="center" width="100%">
        {/* Lixeira */}
        <IconButton
          color="inherit"
          title="Descartar"
          onClick={handleDiscard}
          disabled={isSending}
        >
          <DeleteOutlineIcon />
        </IconButton>

        {/* BOTÃO PRINCIPAL */}
        {status === 'recording' ? (
          <IconButton
            title="Pausar (ouvir)"
            onClick={pauseToListen}
            disabled={disabled || isSending}
          >
            <PauseIcon />
          </IconButton>
        ) : (
          <IconButton
            title="Retomar gravação"
            onClick={resumeRecording}
            disabled={disabled || isSending}
          >
            <MicIcon />
          </IconButton>
        )}

        {/* PLAYER enquanto pausado/inactive */}
        {showPreviewPlayer && previewUrl ? (
          <VoiceWaveform url={previewUrl} />
        ) : (
          <>
            {/* wave ao vivo */}
            <Box ref={containerRef} style={{ width: '100%', height: 28 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, minWidth: 58 }}>
              {timerLabel}
            </Typography>
          </>
        )}

        {/* DIREITA: finalizar ou enviar */}
        {status === 'recording' ? (
          <IconButton
            sx={{
              mr: '8px',
              height: '36px',
              opacity: '1',
            }}
            className={styles.sendButton}
            size={'small'}
            color="primary"
            title="Finalizar"
            onClick={finalizeToPreview}
            disabled={disabled || isSending}
          >
            {isSending ? (
              <CircularProgress size={22} />
            ) : (
              <CheckIcon sx={{ color: '#fff' }} />
            )}
          </IconButton>
        ) : (
          <IconButton
            sx={{
              mr: '8px',
              height: '36px',
              opacity: '1',
            }}
            size={'small'}
            className={styles.sendButton}
            title="Enviar"
            onClick={handleSend}
            disabled={disabled || isSending || !hasAnyAudio}
            color="primary"
          >
            {isSending ? (
              <CircularProgress size={22} />
            ) : (
              <SendIcon sx={{ color: '#fff' }} />
            )}
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
}
