import api from '@/utils/api';
import { DraftReport } from '@/services/reports/types';

export type PayloadNewTask = {
  cron: string;
  title: string;
  emails: string[];
};

export const reportsService = {
  async getNewConfig(message_id: string) {
    const { data } = await api.get<DraftReport>(
      `/assistants/reports/${message_id}/task_scheduler/new_forms`,
    );
    return data;
  },
  async deleteById(report_id: string) {
    return await api.delete(`/assistants/reports/${report_id}/task_scheduler`);
  },
  async createNewTask(payload: PayloadNewTask, report_id: string) {
    const response = await api.post(
      `/assistants/reports/${report_id}/task_scheduler/create`,
      payload,
    );
    return response;
  },
};
