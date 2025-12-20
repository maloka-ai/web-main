import type { MRT_ColumnDef, MRT_RowData } from 'material-react-table';
import { formatCellTable, formatTitleHeaderTable } from '@/utils/format';

function getFallbackKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => '-'.repeat(5 + i));
}

type Config = {
  copyId: boolean;
};

export function buildDynamicColumns<T extends MRT_RowData>(
  keys?: string[],
  countColumns?: number,
  config?: Config,
): MRT_ColumnDef<T>[] {
  const FALLBACK_KEYS = getFallbackKeys(countColumns ?? 5);
  const keysToUse = keys && keys.length > 0 ? keys : FALLBACK_KEYS;
  return keysToUse.map((k, index) => {
    const header = formatTitleHeaderTable(k);
    const currency = /valor|preco|price|amount|total/i.test(k);
    const align: 'left' | 'center' | 'right' = currency ? 'right' : 'left';

    return {
      accessorKey: k,
      header,
      filterVariant: 'text',
      size: index === 0 ? 140 : undefined,
      muiTableHeadCellProps: { align },
      muiTableBodyCellProps: {
        align,
        sx: {
          cursor: config?.copyId && index === 0 ? 'copy' : 'default',
          fontWeight: index === 0 ? 700 : undefined,
          color: index === 0 ? 'text' : 'text',
        },
      },
      Cell: ({ cell }) => formatCellTable(cell.getValue()),
    } as MRT_ColumnDef<T>;
  });
}
