import { Button } from '@mui/material';
import assistantService, {
  AssistanteMessage,
} from '@/services/AssistantService';
import * as XLSX from 'xlsx';
import { useState } from 'react';

///////////////////////////////////////////////
// FUNÇÕES PARA FORMATAÇÃO DE DATAS NO XLSX
//////////////////////////////////////////////
type DateKind = 'FULL' | 'MONTH_YEAR';
type DateOrder = 'MDY' | 'YMD'; // mm-dd-yyyy ou yyyy-mm-dd (e suas variações)

type DetectedDateCol = {
  colIndex: number; // 0-based
  kind: DateKind; // FULL ou MONTH_YEAR
  order: DateOrder; // MDY ou YMD
};

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }

    cur += ch;
  }

  out.push(cur.trim());
  return out;
}

function parseCSVRows(csv: string): string[][] {
  return csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(splitCSVLine);
}

// Excel 1900 system: 1899-12-30 UTC = 0
function excelSerialFromUTC(y: number, m: number, d: number) {
  return Date.UTC(y, m - 1, d) / 86400000 + 25569;
}

function detectPattern(v: string): { kind: DateKind; order: DateOrder } | null {
  const s = (v ?? '').trim();
  if (!s) return null;

  // FULL
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(s))
    return { kind: 'FULL', order: 'MDY' }; // mm-dd-yyyy
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s))
    return { kind: 'FULL', order: 'YMD' }; // yyyy-mm-dd

  // MONTH_YEAR
  if (/^\d{1,2}[-/]\d{4}$/.test(s)) return { kind: 'MONTH_YEAR', order: 'MDY' }; // mm-yyyy
  if (/^\d{4}[-/]\d{1,2}$/.test(s)) return { kind: 'MONTH_YEAR', order: 'YMD' }; // yyyy-mm

  return null;
}

function parseDateByPattern(
  raw: string,
  kind: DateKind,
  order: DateOrder,
): { y: number; m: number; d: number } | null {
  const s = (raw ?? '').trim();
  if (!s) return null;

  const sepMatch = s.match(/[-/]/);
  const sep = sepMatch ? sepMatch[0] : '-';
  const parts = s.split(sep).map((p) => p.trim());

  if (kind === 'FULL') {
    if (parts.length !== 3) return null;

    let y: number, m: number, d: number;

    if (order === 'MDY') {
      m = +parts[0];
      d = +parts[1];
      y = +parts[2];
    } else {
      y = +parts[0];
      m = +parts[1];
      d = +parts[2];
    }

    if (!(y >= 1900 && y <= 9999)) return null;
    if (!(m >= 1 && m <= 12)) return null;
    if (!(d >= 1 && d <= 31)) return null;

    return { y, m, d };
  }

  // MONTH_YEAR
  if (parts.length !== 2) return null;

  let y: number, m: number;

  if (order === 'MDY') {
    m = +parts[0];
    y = +parts[1];
  } else {
    y = +parts[0];
    m = +parts[1];
  }

  if (!(y >= 1900 && y <= 9999)) return null;
  if (!(m >= 1 && m <= 12)) return null;

  return { y, m, d: 1 };
}

/**
 * Detecta colunas de data pelo CSV:
 * - Formato homogêneo por coluna (como você disse)
 * - Decide (FULL|MONTH_YEAR) e (MDY|YMD) olhando as primeiras linhas de dados
 */
export function detectDateColumnsFromCSV(
  csv: string,
  {
    headerRow = 0,
    maxScanRows = 60,
    minConfidence = 0.6,
  }: { headerRow?: number; maxScanRows?: number; minConfidence?: number } = {},
): DetectedDateCol[] {
  const rows = parseCSVRows(csv);
  if (rows.length <= headerRow) return [];

  const header = rows[headerRow];
  if (!header) return [];

  const colCount = header.length;
  const start = headerRow + 1;
  const end = Math.min(rows.length - 1, start + maxScanRows - 1);

  const detected: DetectedDateCol[] = [];

  for (let c = 0; c < colCount; c++) {
    const counts = new Map<string, number>(); // key = `${kind}|${order}`
    let hits = 0;

    for (let r = start; r <= end; r++) {
      const v = rows[r]?.[c];
      if (!v) continue;
      const p = detectPattern(v);
      if (!p) continue;

      hits++;
      const key = `${p.kind}|${p.order}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    if (hits === 0) continue;

    // pega o padrão mais frequente
    let bestKey = '';
    let bestCount = 0;
    for (const [k, ct] of counts.entries()) {
      if (ct > bestCount) {
        bestKey = k;
        bestCount = ct;
      }
    }

    const confidence = bestCount / hits;
    if (confidence < minConfidence) continue;

    const [kind, order] = bestKey.split('|') as [DateKind, DateOrder];
    detected.push({ colIndex: c, kind, order });
  }

  return detected;
}

/**
 * Aplica a correção na worksheet:
 * - NÃO mexe no headerRow
 * - Usa o valor do CSV como "fonte da verdade"
 * - Converte para serial Excel em UTC (sem timezone)
 * - Aplica formato via z
 */
export function applyDateFixFromCSV(
  ws: XLSX.WorkSheet,
  csv: string,
  {
    headerRow = 0,
    monthYearFormat = 'mm/yyyy',
    fullDateFormat = 'mm/dd/yyyy',
  }: {
    headerRow?: number;
    monthYearFormat?: string;
    fullDateFormat?: string;
  } = {},
) {
  const detectedCols = detectDateColumnsFromCSV(csv, { headerRow });
  if (detectedCols.length === 0) return;

  const rows = parseCSVRows(csv);

  const ref = ws['!ref'];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);

  const dataStartRow = headerRow + 1;

  for (const col of detectedCols) {
    for (let csvRow = dataStartRow; csvRow < rows.length; csvRow++) {
      const rawValue = rows[csvRow]?.[col.colIndex];
      if (!rawValue) continue;

      const parsed = parseDateByPattern(rawValue, col.kind, col.order);
      if (!parsed) continue;

      // CSV e worksheet precisam estar alinhados por linha
      const r = csvRow;

      if (r < range.s.r || r > range.e.r) continue;
      if (r === headerRow) continue; // proteção extra

      const addr = XLSX.utils.encode_cell({ r, c: col.colIndex });
      const cell = ws[addr];
      if (!cell) continue;

      cell.t = 'n';
      cell.v = excelSerialFromUTC(parsed.y, parsed.m, parsed.d);
      cell.z = col.kind === 'MONTH_YEAR' ? monthYearFormat : fullDateFormat;
      delete (cell as any).w;
    }
  }
}
// Função de autofit
function autofitColumns(
  ws: XLSX.WorkSheet,
  maxRows = 50,
  minWch = 12,
  maxWch = 60,
) {
  const ref = ws['!ref'];
  if (!ref) return;

  const range = XLSX.utils.decode_range(ref);

  const rowStart = range.s.r;
  const rowEnd = Math.min(range.e.r, rowStart + maxRows - 1);

  const cols: { wch: number }[] = [];

  for (let c = range.s.c; c <= range.e.c; c++) {
    let best = minWch;

    for (let r = rowStart; r <= rowEnd; r++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;

      // Prioriza texto formatado (w). Se não tiver, usa v.
      let text = '';
      if (typeof (cell as any).w === 'string') text = (cell as any).w;
      else if (cell.v != null) text = String(cell.v);

      // Heurística simples (sem ficar enorme com textos longos)
      // quebra linha conta só a maior linha
      const longestLine = text
        .split('\n')
        .reduce((m, s) => Math.max(m, s.length), 0);

      // dá uma folga +2 chars
      best = Math.max(best, longestLine + 2);
      if (best >= maxWch) {
        best = maxWch;
        break;
      }
    }

    cols[c] = { wch: Math.min(Math.max(best, minWch), maxWch) };
  }

  ws['!cols'] = cols;
}

function downloadCSVasXLSX(csvString: string, filename = 'dados.xlsx') {
  const worksheet = XLSX.read(csvString, {
    type: 'string',
    cellDates: true,
  }).Sheets.Sheet1;

  // Corrige datas detectadas no CSV e remove efeito timezone
  applyDateFixFromCSV(worksheet, csvString, {
    headerRow: 0,
    monthYearFormat: 'mm/yyyy',
    fullDateFormat: 'mm/dd/yyyy',
  });

  // Aplica uma largura minima para as colunas
  autofitColumns(worksheet, 50, 8, 20);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha');
  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function handleDownloadMetada(msg: AssistanteMessage) {
  if (msg.spreadsheet_metadata) {
    try {
      const msgId =
        typeof msg.spreadsheet_metadata === 'object' &&
        'message_id' in msg.spreadsheet_metadata
          ? msg.spreadsheet_metadata.message_id
          : msg.id;
      const csvData = await assistantService.downloadSpreadsheet(msgId);
      downloadCSVasXLSX(csvData, `spreadsheet_${msg.id}.xlsx`);
    } catch (error) {
      console.error('Error downloading spreadsheet:', error);
    }
  }
}

type Props = {
  msg: AssistanteMessage;
};

export function DownloadXlsxButton({ msg }: Props) {
  const [isLoading, setLoading] = useState(false);

  async function handleClickDownloadMetada(msg: AssistanteMessage) {
    setLoading(true);
    try {
      await handleDownloadMetada(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      loading={isLoading}
      variant="outlined"
      color="primary"
      sx={{
        marginTop: '8px',
        color: '#df8157',
        borderColor: '#df8157',
      }}
      onClick={() => {
        handleClickDownloadMetada(msg);
      }}
    >
      Baixar Planilha
    </Button>
  );
}
