"use client";

import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileDownloadOutlined } from "@mui/icons-material";
import { DynamicTable } from "@/components/table/DynamicTable";

export type DetailsDialogTableProps = {
  title: string;
  description: string;
  numberColumnsDataTable?: number;
  linkDataTable?: string;
  type?: "alerta" | "acao";
};

interface DetailsAlertsAndActionsProps {
  data: DetailsDialogTableProps | null;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export default function DialogDetailsTable({
  data,
  open,
  onClose,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  if (!data) {
    return null;
  }
  const { title, description, linkDataTable, numberColumnsDataTable, type } =
    data;
  const hasDownload = Boolean(onDownload);
  const hasTable = Boolean(linkDataTable);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: "#fdfcf7",
          maxWidth: "80%",
          maxHeight: "95vh",
          overflowY: "auto",
          margin: "4vh auto",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          outline: "none",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          fontWeight={800}
          mb={1}
          sx={{ color: "#4b4b4b" }}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={500}
          mb={2}
          sx={{ color: "#777" }}
        >
          {description}
        </Typography>
        {hasDownload && (
          <Button
            variant="contained"
            startIcon={<FileDownloadOutlined />}
            color={type === "alerta" ? "error" : "primary"}
            sx={{
              textTransform: "none",
              borderRadius: "16px",
              mb: 2,
            }}
            onClick={onDownload}
          >
            Baixar tabela completa
          </Button>
        )}
        {hasTable && (
          <DynamicTable
            data={{
              linkData: data.linkDataTable || "",
              countColumns: numberColumnsDataTable || 5,
            }}
          />
        )}
      </Box>
    </Modal>
  );
}
