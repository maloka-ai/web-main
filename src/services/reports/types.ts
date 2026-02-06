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
