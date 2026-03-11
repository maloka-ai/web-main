export interface DraftReport {
  assistant_id: string;
  created_at: string;
  cron_expression: string | null;
  data_template_id: string;
  description: string;
  has_chart: boolean;
  id: string;
  last_report_status: string;
  last_report_time: string;
  message_id: string;
  next_report_time: string;
  nodata_template_id: string;
  recipient_emails: string[];
  sql_query: string;
  status: string;
  steps: string[];
  template_reasoning: string;
  title: string;
  updated_at: string;
  user_id: string;
}

export interface Report {
  id: string;
  recipient_emails: string[];
  next_report_time: string;
  user_id: number;
  hasChart: boolean;
  created_at: string;
  assistant_id: number;
  data_template_id: string;
  updated_at: string;
  title: string;
  nodata_template_id: string;
  steps: string[];
  template_reasoning: string;
  description: string;
  status: string;
  sql_query: string;
  last_report_status: string | null;
  message_id: string;
  cron_expression: string | null;
  last_report_time: string;
}
