import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PayloadNewTask, reportsService } from '@/services/reports/service';
import { reportsKeys } from '@/services/reports/queryKeys';
import { Report } from '@/services/reports/types';

export function useMutationCreateTask() {
  return useMutation({
    mutationFn: ({
      report_id,
      ...rest
    }: PayloadNewTask & { report_id: string }) =>
      reportsService.createNewTask(rest, report_id),
  });
}

export function useMutationDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => reportsService.deleteById(reportId),
    onSuccess(_, reportId) {
      queryClient.setQueryData<Report[]>(reportsKeys.list, (oldData) => {
        if (Array.isArray(oldData)) {
          return oldData.filter((report) => report.id !== reportId);
        }
        return oldData;
      });
    },
  });
}
