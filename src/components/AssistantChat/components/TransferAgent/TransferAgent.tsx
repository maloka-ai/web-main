import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  SwapHoriz as SwapHorizIcon,
  ContentCopy as ContentCopyIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import styles from './transferAgent.module.css';
import { TextField } from '@mui/material';

type Payload = {
  analyst: string;
  question: string;
};

type AnalystInfo = {
  id: string;
  name?: string;
  avatar?: any;
};

type TransferAgentProps = {
  payload: Payload;
  /**
   * Função opcional para iniciar a transferência. Deve receber o payload
   * e retornar uma Promise (por exemplo, criar nova conversa no backend).
   */
  onTransfer?: (payload: Payload) => Promise<void> | void;
  /**
   * Opcional: função que transforma o analyst id em dados legíveis
   * (nome, avatar). Se não fornecida, usamos o id cru.
   */
  getAnalystInfo?: (id: string) => AnalystInfo | null;
  /**
   * Se true, permite editar a pergunta no dialog antes de confirmar.
   */
  editableQuestion?: boolean;
};

export default function TransferAgent({
  payload,
  onTransfer,
  getAnalystInfo,
  editableQuestion = false,
}: TransferAgentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analystInfo, setAnalystInfo] = useState<AnalystInfo | null>(null);
  const [question, setQuestion] = useState(payload.question);

  useEffect(() => {
    console.log('getAnalystInfo', getAnalystInfo);
    console.log('payload', payload);
    if (getAnalystInfo) {
      console.log('Fetching analyst info for', payload.analyst);
      const info = getAnalystInfo(payload.analyst);
      setAnalystInfo(info);
      return;
    }
    setAnalystInfo({ id: payload.analyst });
  }, []);


  // Fetch analyst info if provided and dialog opens
  const handleOpen = async () => {
    setOpen(true);
    setError(null);
    setSuccess(false);
    setQuestion(payload.question);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
  };

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(question);
      // feedback simples (tooltip alternativo poderia ser melhor)
      // aqui apenas troca a label por um breve success visual
      // podemos usar um snackbar se preferir
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
  };

  const handleConfirmTransfer = async () => {
    setError(null);
    setLoading(true);
    setSuccess(false);

    const toSend: Payload = {
      analyst: payload.analyst.toString(),
      question,
    };

    try {
      await (onTransfer ? onTransfer(toSend) : Promise.resolve());
      setSuccess(true);
      // manter aberto por 800ms para mostrar sucesso, depois fecha
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao transferir. Tente novamente.');
      setLoading(false);
    }
  };

  const truncatedQuestion = (q: string, n = 120) =>
    q.length > n ? q.slice(0, n) + '…' : q;

  return (
    <Box className={styles.container}>
      <Box className={styles.card}>
        <Box className={styles.left}>
          <Avatar
            alt={analystInfo?.name || payload.analyst}
            className={styles.avatar}
          >
            {analystInfo?.avatar ? (analystInfo.avatar) : (<PersonIcon />)}
          </Avatar>

          <Box className={styles.texts}>
            <Typography variant="body2" className={styles.label}>
              Transferir para
            </Typography>
            <Typography variant="subtitle2" className={styles.analyst}>
              {analystInfo?.name ?? payload.analyst}
            </Typography>

            <Typography variant="body2" className={styles.questionPreview}>
              {truncatedQuestion(payload.question)}
            </Typography>
          </Box>
        </Box>

        <Box className={styles.floatingBtnWrapper}>
          <Tooltip title="Transferir conversa">
            <IconButton
              onClick={handleOpen}
              className={styles.floatingBtn}
              size="small"
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className={styles.dialogTitle}>
          <Box className={styles.dialogTitleInner}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                alt={analystInfo?.name || payload.analyst}
                className={styles.avatar}
              >
                {analystInfo?.avatar ? (analystInfo.avatar) : (<PersonIcon />)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  Transferir para{' '}
                  <strong>
                    {analystInfo?.name ?? payload.analyst}
                  </strong>
                </Typography>
              </Box>
            </Box>

            <IconButton
              aria-label="fechar"
              onClick={handleClose}
              size="small"
              className={styles.closeBtn}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers className={styles.dialogContent}>
          <Box className={styles.infoRow}>
            <Typography variant="caption" color="textSecondary">
              Agente:
            </Typography>
            <Typography variant="body2">
              {analystInfo?.name ?? payload.analyst}
            </Typography>
          </Box>

          <Box className={styles.infoRow}>
            <Typography variant="caption" color="textSecondary">
              Questão:
            </Typography>

            <Box className={styles.questionBox}>
              <Typography
                variant="body2"
                component="div"
                className={styles.questionText}
                contentEditable={false}
                style={{ display: editableQuestion ? 'none' : undefined }}
              >
                {question}
              </Typography>
              {editableQuestion ? (
                <TextField
                multiline
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={styles.textarea}
                />
              ) : (
                <Box className={styles.questionPreviewBox}>
                  <Typography variant="body2" className={styles.questionPreviewShort}>
                    {question}
                  </Typography>
                </Box>
              )}

              <Box className={styles.questionActions}>
                <Tooltip title="Copiar questão">
                  <IconButton onClick={handleCopyQuestion} size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {error && (
            <Typography variant="body2" color="error" className={styles.error}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>

          <Button
            onClick={handleConfirmTransfer}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : success ? <CheckIcon /> : undefined
            }
            className={styles.confirmButton}
          >
            {success ? 'Transferido' : 'Confirmar Transferência'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
