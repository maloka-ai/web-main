/*
 * Utility functions for formatting numbers, currencies, percentages, and strings.
 * Includes functions for formatting currency, percentages with signs, title headers from snake_case,
 * labels for bar charts, numbers with locale formatting, and table cell values.
 */

// Formats a number as currency based on the specified locale and currency code.
export const formatCurrency = (
  amount: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL',
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('pt-BR');
};
// Formats a percentage value with a sign (+/-) and two decimal places.
export function formatPercentSigned(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Converts a snake_case string to a Title Header format (e.g., "example_string" -> "Example String").
export function formatTitleHeaderTable(snake: string) {
  return snake
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Formats a label for bar charts, converting numbers using locale formatting and other types to strings.
export function formatLabelBar(value: unknown): string {
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  return String(value);
}

// Formats a number using locale-specific formatting (e.g., thousands separators).
export function formatNumber(n: number) {
  return n.toLocaleString('pt-BR');
}

// Formats a cell value for tables, handling null/undefined, numbers, and other types appropriately.
export function formatCellTable(v: unknown) {
  if (v === null || v === undefined) return '';

  if (typeof v === 'number' && Number.isFinite(v)) {
    return formatNumber(v);
  }

  return String(v);
}
