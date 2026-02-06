import { useMutation } from '@tanstack/react-query';
import { PayloadNewTask, reportsService } from '@/services/reports/service';

export function useMutationCreateTask() {
  return useMutation({
    mutationFn: ({
      report_id,
      ...rest
    }: PayloadNewTask & { report_id: string }) =>
      reportsService.createNewTask(rest, report_id),
  });
}
