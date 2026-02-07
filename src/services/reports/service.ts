import api from '@/utils/api';
import { DraftReport, Report } from '@/services/reports/types';

export type PayloadNewTask = {
  cron_expression: string;
  title: string;
  recipient_emails: string[];
};

export const reportsService = {
  async list() {
    const { data } = await api.get<Report[]>(`/assistants/reports`);
    return data;
  },
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
