type ParsedCron = {
  minute: number;
  hour: number;
  dayOfMonth: string; // "*" ou "1..31"
  month: string;
  dayOfWeek: string; // "*" ou "0..6" ou "1,3,5"
};

const DOW_LABEL: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

function parseCron5(cron: string): ParsedCron | null {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [min, hour, dom, month, dow] = parts;
  const minute = Number(min);
  const h = Number(hour);

  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return null;
  if (!Number.isFinite(h) || h < 0 || h > 23) return null;

  return {
    minute,
    hour: h,
    dayOfMonth: dom,
    month,
    dayOfWeek: dow,
  };
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(hour: number, minute: number) {
  return `${pad2(hour)}:${pad2(minute)}`;
}

function parseDowList(dow: string): number[] {
  // aceita: "1,3,5" ou "*" (retorna [])
  if (dow === '*' || !dow) return [];
  return dow
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6);
}

function formatDowPTBR(days: number[]) {
  // ordena e converte para labels
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const labels = sorted.map((d) => DOW_LABEL[d] ?? `Dia(${d})`);
  return labels.join(', ');
}

/**
 * Retorna uma frase:
 * - Diário às HH:mm
 * - Semanal (Segunda, Quarta e Sexta) às HH:mm
 * - Mensal (Todo dia 15) às HH:mm
 */
export function formatCronPTBR(cron: string): string {
  const parsed = parseCron5(cron);
  if (!parsed) return 'Frequência: não reconhecida';

  const time = formatTime(parsed.hour, parsed.minute);

  // Diário: dom="*" e dow="*"
  const isDaily = parsed.dayOfMonth === '*' && parsed.dayOfWeek === '*';
  if (isDaily) return `Diária às ${time}`;

  // Semanal: dom="*" e dow != "*"
  const isWeekly = parsed.dayOfMonth === '*' && parsed.dayOfWeek !== '*';
  if (isWeekly) {
    const days = parseDowList(parsed.dayOfWeek);
    const label = days.length ? formatDowPTBR(days) : 'Todos os dias';
    // Ajuste de PT: "Segunda, Quarta e Sexta" (sem Oxford comma)
    // Aqui fica simples: "Segunda, Quarta, Sexta"
    return `Semanal (${label}) às ${time}`;
  }

  // Mensal: dom != "*" e dow="*"
  const isMonthly = parsed.dayOfMonth !== '*' && parsed.dayOfWeek === '*';
  if (isMonthly) {
    return `Mensal (Todo dia ${parsed.dayOfMonth}) às ${time}`;
  }

  // Casos mais complexos (ex: dom e dow definidos)
  return `Agendamento (${cron})`;
}
