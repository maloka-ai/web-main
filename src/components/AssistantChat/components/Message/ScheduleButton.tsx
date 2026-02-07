import { Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import React from 'react';
import { reportsService } from '@/services/reports/service';
import { CreateSchedulingDialog } from '@/components/dialog/CreateSchedulingDialog';
import { useQueryReports } from '@/services/reports/queries';
import CheckIcon from '@mui/icons-material/Check';
type Props = {
  message_id: string;
};
export function ScheduleButton({ message_id }: Props) {
  const { data } = useQueryReports();
  const isAlredyReported = !!data?.some((elem) => elem.id === message_id);
  const [isLoading, setIsLoading] = React.useState(false);
  const [draft, setDraft] = React.useState<any>(null);

  async function handleSchedule() {
    setIsLoading(true);
    try {
      const data = await reportsService.getNewConfig(message_id);
      setDraft(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  const openDialog = !!draft;

  function handleClose() {
    setIsLoading(false);
    setDraft(null);
  }

  if (isAlredyReported) {
    return (
      <Button
        variant="outlined"
        color="primary"
        onClick={handleSchedule}
        loading={isLoading}
        sx={{
          marginTop: '8px',
          color: '#df8157',
          borderColor: '#df8157',
          borderRadius: '7.5px',
          pointerEvents: 'none',
        }}
        size={'small'}
        startIcon={<CheckIcon />}
      >
        Relatório já agendado
      </Button>
    );
  }
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleSchedule}
        loading={isLoading}
        sx={{
          marginTop: '8px',
          color: '#df8157',
          borderColor: '#df8157',
          borderRadius: '7.5px',
        }}
        size={'small'}
        startIcon={<CalendarMonthIcon />}
      >
        Agendar relatório periódico
      </Button>
      {draft && (
        <CreateSchedulingDialog
          open={openDialog}
          draft={draft}
          onClose={handleClose}
        />
      )}
    </>
  );
}
