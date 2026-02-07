export interface DraftReport {
  dynamic_sql: string;
  email_list: Array<string>;
  generic_steps: Array<string>;
  has_chart: boolean;
  original_context: {
    created_at: string;
    original_message: string;
    original_sql: string;
    original_steps: Array<string>;
  };
  report_id: string;
  suggested_title: string;
  templates: {
    data_template: string;
    nodata_template: string;
    reasoning: string;
  };
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
