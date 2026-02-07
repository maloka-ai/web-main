import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { DialogProps } from '@/components/dialog/DialogDetails';
import { DraftReport } from '@/services/reports/types';
import { useControlModal } from '@/hooks/useControlModal';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { reportsService } from '@/services/reports/service';
import { BootstrapInput } from '@/components/inputs/style';
import { useMutationCreateTask } from '@/services/reports/mutations';
import { toast } from 'react-toastify';

interface Props extends DialogProps {
  draft: DraftReport;
}

type Frequency = 'diaria' | 'semanal' | 'mensal';
type WeekdayCron = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom ... 6=Sáb (cron clássico)

const WEEKDAYS: Array<{ label: string; value: WeekdayCron }> = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
];

function buildCronPreview(params: {
  frequency: Frequency;
  timeHHMM: string; // "HH:mm"
  weekDays: WeekdayCron[];
  monthlyDay: number; // 1..31
}) {
  const [hhStr, mmStr] = params.timeHHMM.split(':');
  const hour = Number(hhStr);
  const min = Number(mmStr);

  const minuteField = Number.isFinite(min) ? `${min}` : '0';
  const hourField = Number.isFinite(hour) ? `${hour}` : '0';

  if (params.frequency === 'diaria') return `${minuteField} ${hourField} * * *`;

  if (params.frequency === 'semanal') {
    const dow = params.weekDays.length ? params.weekDays.join(',') : '*';
    return `${minuteField} ${hourField} * * ${dow}`;
  }

  return `${minuteField} ${hourField} ${params.monthlyDay} * *`;
}

function parseEmails(input: string): string[] {
  // separa por vírgula, remove espaços e entradas vazias
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidEmail(email: string): boolean {
  // validação simples (suficiente p/ UI); backend deve validar de forma definitiva
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function CreateSchedulingDialog({ open, onClose, draft }: Props) {
  const { mutate, isPending } = useMutationCreateTask();
  const [openBackDialog, handleOpenBackDialog, handleCloseBackDialog] =
    useControlModal();
  const [openDeleteDialog, handleOpenDeleteDialog, handleCloseDeleteDialog] =
    useControlModal();

  const [title, setTitle] = React.useState(draft.suggested_title);
  const [emails, setEmails] = React.useState(draft.email_list.join(','));
  const [typeNotification, setTypeNotification] = React.useState('email');
  const [frequency, setFrequency] = React.useState<Frequency>('mensal');
  const [timeHHMM, setTimeHHMM] = React.useState('09:00');
  const [weekDays, setWeekDays] = React.useState<WeekdayCron[]>([1]);
  const [monthlyDay, setMonthlyDay] = React.useState<number>(1);

  // ✅ Erros (mostrar só depois de submit)
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const [emailsError, setEmailsError] = React.useState<string | null>(null);

  const cronPreview = React.useMemo(() => {
    return buildCronPreview({ frequency, timeHHMM, weekDays, monthlyDay });
  }, [frequency, timeHHMM, weekDays, monthlyDay]);

  function handleBack() {
    reportsService.deleteById(draft.report_id);
    handleCloseBackDialog();
    handleCloseDeleteDialog();
    onClose();
  }

  function handleClose() {
    if (isPending) return;
    handleOpenBackDialog();
  }

  function toggleWeekDay(day: WeekdayCron) {
    setWeekDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function validateForm(): boolean {
    const t = title.trim();
    const emailItems = parseEmails(emails);

    let ok = true;

    // título
    if (!t) {
      setTitleError('Informe um assunto.');
      ok = false;
    } else {
      setTitleError(null);
    }

    // emails: não pode ser vazio e deve estar separado por vírgula
    // (ou seja, precisa ter pelo menos 1 email válido; se tiver ; ou espaço sem vírgula, vai cair em inválido)
    if (emailItems.length === 0) {
      setEmailsError('Informe pelo menos um e-mail.');
      ok = false;
    } else {
      const invalid = emailItems.filter((e) => !isValidEmail(e));
      if (invalid.length) {
        setEmailsError(
          `E-mail(s) inválido(s): ${invalid.slice(0, 3).join(', ')}${
            invalid.length > 3 ? '…' : ''
          }. Separe por vírgula.`,
        );
        ok = false;
      } else if (!emails.includes(',') && emailItems.length > 1) {
        // proteção extra (na prática esse caso é raro por causa do split)
        setEmailsError('Separe os e-mails por vírgula.');
        ok = false;
      } else {
        setEmailsError(null);
      }
    }

    return ok;
  }

  function handleSaveTask() {
    if (isPending) return;

    setSubmitAttempted(true);

    const isValid = validateForm();
    if (!isValid) return;

    const payload = {
      title: title.trim(),
      recipient_emails: parseEmails(emails),
      cron_expression: cronPreview,
    };

    mutate(
      {
        ...payload,
        report_id: draft.report_id,
      },
      {
        onSuccess() {
          handleCloseBackDialog();
          handleCloseDeleteDialog();
          onClose();
        },
        onError(error) {
          console.error(error);
        },
      },
    );
  }

  // ✅ opcional: ao editar após submit, revalidar para limpar erro rapidamente
  React.useEffect(() => {
    if (!submitAttempted) return;
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, emails]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={'lg'}
        sx={{ height: '100%' }}
      >
        <DialogTitle>
          <Typography fontWeight={'bold'}>
            Informações do agendamento de notificação
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon color={'primary'} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container gap={2}>
            <Grid
              size={{
                xs: 12,
                md: 8,
                lg: 6,
              }}
              mt={2}
            >
              <FormControl
                variant="standard"
                fullWidth
                error={submitAttempted && !!titleError}
              >
                <InputLabel shrink htmlFor="title-input">
                  Assunto
                </InputLabel>

                <BootstrapInput
                  value={title}
                  id="title-input"
                  fullWidth
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />

                {submitAttempted && titleError && (
                  <FormHelperText>{titleError}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
                lg: 4,
              }}
              mt={2}
            />

            <Grid
              size={12}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <FormControl
                variant="standard"
                size="small"
                sx={{ minWidth: 220 }}
              >
                <InputLabel shrink id="select-type-label">
                  Tipo de notificação
                </InputLabel>

                <Select
                  labelId="select-type-label"
                  input={<BootstrapInput fullWidth />}
                  value={typeNotification}
                  onChange={(ev) => setTypeNotification(ev.target.value)}
                >
                  <MenuItem value={'email'}>Via e-mail</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                variant="standard"
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel shrink id="select-frequency-label">
                  Frequência
                </InputLabel>

                <Select
                  labelId="select-frequency-label"
                  input={<BootstrapInput />}
                  value={frequency}
                  onChange={(ev) => setFrequency(ev.target.value as Frequency)}
                >
                  <MenuItem value={'diaria'}>Diária</MenuItem>
                  <MenuItem value={'semanal'}>Semanal</MenuItem>
                  <MenuItem value={'mensal'}>Mensal</MenuItem>
                </Select>
              </FormControl>

              {/* Repetição (dinâmica) */}
              {frequency !== 'diaria' && (
                <Box>
                  <InputLabel shrink htmlFor="select-repetition">
                    Repetição {frequency === 'mensal' && '(Todo dia do mês)'}
                  </InputLabel>

                  {frequency === 'semanal' && (
                    <FormControl>
                      <FormGroup row sx={{ gap: 0.5 }} id={'select-repetition'}>
                        {WEEKDAYS.map((d) => (
                          <FormControlLabel
                            key={d.value}
                            control={
                              <Checkbox
                                size={'small'}
                                checked={weekDays.includes(d.value)}
                                onChange={() => toggleWeekDay(d.value)}
                              />
                            }
                            label={d.label}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                  )}

                  {frequency === 'mensal' && (
                    <FormControl
                      variant="standard"
                      size="small"
                      sx={{ minWidth: 160 }}
                    >
                      <BootstrapInput
                        value={monthlyDay}
                        id={'select-repetition'}
                        fullWidth
                        type="number"
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          const clamped = Math.max(1, Math.min(31, n));
                          setMonthlyDay(clamped);
                        }}
                        inputProps={{ min: 1, max: 31 }}
                      />
                    </FormControl>
                  )}
                </Box>
              )}

              {/* Hora */}
              <FormControl
                variant="standard"
                size="small"
                sx={{ minWidth: 160 }}
              >
                <InputLabel shrink id="hour-input">
                  Hora
                </InputLabel>
                <BootstrapInput
                  value={timeHHMM}
                  id="hour-input"
                  fullWidth
                  type="time"
                  onChange={(e) => setTimeHHMM(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControl
                variant="standard"
                fullWidth
                error={submitAttempted && !!emailsError}
              >
                <InputLabel shrink htmlFor="email-input">
                  E-mails para envio (separe por vírgula)
                </InputLabel>

                <BootstrapInput
                  fullWidth
                  size={'small'}
                  value={emails}
                  id="email-input"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmails(e.target.value)
                  }
                />

                {submitAttempted && emailsError && (
                  <FormHelperText>{emailsError}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={12} mb={2}>
              <Typography fontWeight={600}>Passos</Typography>
              <Typography>{draft.templates.reasoning}</Typography>
              <Box component={'ol'} mt={1}>
                {draft.generic_steps.map((reason) => (
                  <li style={{ marginLeft: '1rem' }} key={reason}>
                    {reason}
                  </li>
                ))}
              </Box>
            </Grid>
          </Grid>

          <DialogActions
            sx={{
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <Button
              size={'small'}
              color={'primary'}
              variant={'outlined'}
              disabled={isPending}
              onClick={handleOpenBackDialog}
            >
              Voltar
            </Button>

            <Button
              size={'small'}
              color={'error'}
              variant={'contained'}
              disabled={isPending}
              onClick={handleOpenDeleteDialog}
            >
              Excluir
            </Button>

            <Button
              size={'small'}
              color={'primary'}
              variant={'contained'}
              onClick={handleSaveTask}
              loading={isPending}
            >
              Salvar agendamento
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        onAction={handleBack}
        description={
          <>
            Você tem alterações pendentes
            <br />
            Deseja realmente fechar sem salvar?
          </>
        }
        title={'Alterações pendentes'}
        onClose={handleCloseBackDialog}
        open={openBackDialog}
        textConfirm={'Fechar'}
      />

      <ConfirmDialog
        onAction={handleBack}
        description={
          <span>
            Você deseja realmente excluir de forma definitiva este agendamento:{' '}
            <Typography component={'span'} fontWeight={600}>
              {draft.suggested_title}
            </Typography>
          </span>
        }
        title={'Excluir agendamento'}
        onClose={handleCloseDeleteDialog}
        open={openDeleteDialog}
        colorConfirm={'error'}
        textConfirm={'Excluir'}
      />
    </>
  );
}
