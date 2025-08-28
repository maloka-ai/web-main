"use client";

import * as React from "react";
import { Box, Divider, Skeleton, Typography } from "@mui/material";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  MRT_TablePagination,
  useMaterialReactTable,
} from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";

import api from "@/utils/api";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { CockpitAlert } from "@/services/analysisService";
// app/mui-theme.ts

// ------------------------------------------------------------
// Tipos do domínio
// ------------------------------------------------------------
export type LinhaTabela = {
  codigo: string;
  cliente: string;
  referenciaDias: number;
  frequencia: number;
  valor: number; // em reais
};

export type PageResult = { rows: LinhaTabela[]; total: number };
export type FetchPageFn = (
  page: number,
  pageSize: number,
) => Promise<PageResult>;

// ------------------------------------------------------------
// Util: formatador de moeda BRL
// ------------------------------------------------------------
const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function AlertsAndActionsTable({
  alert,
  pageSize = 10,
}: {
  alert: CockpitAlert;
  pageSize?: number;
}) {
  type RowAny = Record<string, any>;

  const [raw, setRaw] = React.useState<RowAny[]>([]);
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [{ pageIndex, pageSize: ps }, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const [stableKeys, setStableKeys] = React.useState<string[]>([]);
  const FALLBACK_KEYS = ["--------", "-------", "------", "---------", "-----"];

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api
      .get<RowAny[]>(alert.link_detalhamento)
      .then((res) => {
        if (!alive) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        setRaw(arr);
        if (arr[0]) setStableKeys(Object.keys(arr[0])); // ★ atualiza chaves estáveis apenas quando houver dados
        setPagination((p) => ({ ...p, pageIndex: 0, pageSize }));
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message ?? "Erro ao buscar dados do alerta");
        setRaw([]);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [alert?.link_detalhamento, pageSize]);

  const keys = React.useMemo(
    () => (stableKeys.length ? stableKeys : FALLBACK_KEYS),
    [stableKeys],
  );

  const snakeToTitle = (s: string) =>
    s
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const columns = React.useMemo<MRT_ColumnDef<RowAny>[]>(() => {
    return keys.map((k, index) => {
      const header = snakeToTitle(k);
      const currency = /valor|preco|price|amount|total/i.test(k);
      const align: "left" | "center" | "right" = currency ? "right" : "left";

      return {
        accessorKey: k,
        header,
        filterVariant: "text",
        size: index === 0 ? 140 : undefined,
        muiTableHeadCellProps: { align },
        muiTableBodyCellProps: {
          align,
          sx:
            index === 0
              ? { fontWeight: 700, color: "text.primary" }
              : undefined,
        },
      } as MRT_ColumnDef<RowAny>;
    });
  }, [keys, snakeToTitle]);

  const rowCount = raw.length;
  const totalPages = Math.max(1, Math.ceil(rowCount / ps));

  const pageData = React.useMemo(() => {
    const start = pageIndex * ps;
    const end = start + ps;
    return raw;
  }, [raw, pageIndex, ps]);

  // ★ monta dados visíveis: se estiver carregando, injeta linhas-skeleton
  const dataForTable = React.useMemo<RowAny[]>(() => {
    if (isLoading) {
      const cols = keys;
      return Array.from({ length: ps }).map(() => {
        const o: RowAny = { __skeleton: true };
        cols.forEach((c) => (o[c] = null));
        return o;
      });
    }
    return pageData.length ? pageData : [];
  }, [isLoading, pageData, ps, keys]);

  const table = useMaterialReactTable<RowAny>({
    columns,
    data: dataForTable, // ★ usa os dados com skeleton
    // manualPagination: true,
    rowCount,
    enableColumnActions: false,
    enableTopToolbar: false,
    // positionPagination: "none",
    state: {
      isLoading, // mantém o linear/overlay do MRT, se habilitado no tema
      // pagination: { pageIndex, pageSize: ps },
      showAlertBanner: !!error,
      showSkeletons: false,
      showLoadingOverlay: isLoading,
    },
    // onPaginationChange: setPagination,
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "circular",
      variant: "outlined",
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { borderRadius: 0, background: "none" },
    },
    muiTableHeadCellProps: {
      sx: { fontWeight: 700, color: "text.secondary", position: "relative" },
    },
    muiTableBodyRowProps: { hover: true },
    muiTableBodyCellProps: {
      sx: { borderBottom: "1px solid #E6DCCB", py: "10px" },
    },
    initialState: { showColumnFilters: true },
    localization: MRT_Localization_PT_BR,

    // renderBottomToolbar: () => (
    //   <>
    //     <Divider />
    //     <Box sx={{ float: "right" }}>
    //       <PaginationFooter
    //         page={pageIndex + 1}
    //         totalPages={totalPages}
    //         disabled={isLoading || rowCount === 0}
    //         onFirst={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
    //         onPrev={() =>
    //           setPagination((p) => ({
    //             ...p,
    //             pageIndex: Math.max(0, p.pageIndex - 1),
    //           }))
    //         }
    //         onNext={() =>
    //           setPagination((p) => ({
    //             ...p,
    //             pageIndex: Math.min(totalPages - 1, p.pageIndex + 1),
    //           }))
    //         }
    //         onLast={() =>
    //           setPagination((p) => ({ ...p, pageIndex: totalPages - 1 }))
    //         }
    //       />
    //     </Box>
    //   </>
    // ),

    renderEmptyRowsFallback: () => (
      <Box py={6} textAlign="center" color="text.secondary">
        <Typography variant="h6" gutterBottom>
          Nenhum dado encontrado
        </Typography>
        <Typography variant="body2">
          Ajuste os filtros ou tente novamente mais tarde.
        </Typography>
      </Box>
    ),
  });

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  );
}
