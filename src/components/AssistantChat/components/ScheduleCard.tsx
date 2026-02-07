import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Report } from '@/services/reports/types';
import { formatCronPTBR } from '@/utils/cron';

type Props = {
  report: Report;
  onDelete: (reportId: string) => void;
};

function dateFormat(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function ScheduleCard({ report, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = React.useState(false);

  const nextNotification = report.next_report_time
    ? dateFormat(new Date(report.next_report_time))
    : null;

  const lastNotification = report.last_report_time
    ? dateFormat(new Date(report.last_report_time))
    : null;
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const label =
    report.status === 'inactive'
      ? 'Error ao criar agendamento'
      : 'Agendamento criado';
  const colorChip = report.status === 'inactive' ? 'error' : 'success';

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #E6DCCB',
        boxShadow: 'none',
        mb: 2,
        overflow: 'visible',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonthIcon
              sx={{
                color: 'highlight.main',
              }}
            />
            <Typography fontWeight={600} variant={'h6'}>
              {report.title}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen}>
            <MoreHorizIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem
              disabled
              onClick={() => {
                handleMenuClose();
                // onEdit?.();
              }}
            >
              Editar
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDelete(report.id);
              }}
            >
              Excluir
            </MenuItem>
          </Menu>
        </Box>

        {/* Status */}
        <Box mt={1}>
          <Chip label={label} size="small" color={colorChip} />
        </Box>

        {/* Info */}
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          {report.cron_expression && (
            <Typography>
              <b>Frequência:</b> {formatCronPTBR(report.cron_expression)}
            </Typography>
          )}

          <Typography>
            <b>Tipo de notificação:</b> Via e-mail
          </Typography>

          {lastNotification && (
            <Typography>
              <b>Última notificação:</b> {lastNotification}
            </Typography>
          )}

          {nextNotification && (
            <Typography>
              <b>Próxima notificação:</b> {nextNotification}
            </Typography>
          )}

          <Typography>
            <b>Destinatários:</b> {report.recipient_emails.join(', ')}
          </Typography>

          {/* Steps */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setExpanded((v) => !v)}
            >
              <Typography
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <b>Passos:</b> {report.template_reasoning}
              </Typography>

              <ExpandMoreIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: '0.2s',
                }}
              />
            </Box>

            <Collapse in={expanded}>
              <Typography mt={1}> {report.template_reasoning}</Typography>
              {report.steps.map((step, i) => (
                <Typography key={i}>
                  {i + 1}: {step}
                </Typography>
              ))}
            </Collapse>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
