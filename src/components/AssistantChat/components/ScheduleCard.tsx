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
type Props = {
  title: string;
  status?: 'Processando' | 'Enviado' | 'Erro';
  frequency: string;
  notificationType: string;
  lastNotification?: string;
  nextNotification?: string;
  recipients: string[];
  steps: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ScheduleCard({
  title,
  status = 'Processando',
  frequency,
  notificationType,
  lastNotification,
  nextNotification,
  recipients,
  steps,
  onEdit,
  onDelete,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = React.useState(false);

  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #E6DCCB',
        boxShadow: 'none',
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
              {title}
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
              onClick={() => {
                handleMenuClose();
                onEdit?.();
              }}
            >
              Editar
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDelete?.();
              }}
            >
              Excluir
            </MenuItem>
          </Menu>
        </Box>

        {/* Status */}
        <Box mt={1}>
          <Chip
            label={status}
            size="small"
            color={status === 'Erro' ? 'error' : 'default'}
          />
        </Box>

        {/* Info */}
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          <Typography>
            <b>Frequência:</b> {frequency}
          </Typography>

          <Typography>
            <b>Tipo de notificação:</b> {notificationType}
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
            <b>Destinatários:</b> {recipients.join(', ')}
          </Typography>

          {/* Steps */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onClick={() => setExpanded((v) => !v)}
            >
              <Typography>
                <b>Passos:</b> {steps.slice(0, 60)}...
              </Typography>

              <ExpandMoreIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: '0.2s',
                }}
              />
            </Box>

            <Collapse in={expanded}>
              <Typography mt={1}>{steps}</Typography>
            </Collapse>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
