"use client";

import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CockpitAlert } from "@/services/analysisService";
import { FileDownloadOutlined } from "@mui/icons-material";
import { AlertsAndActionsTable } from "@/components/table/AlertsAndActionsTable";

interface DetailsAlertsAndActionsProps {
  alert: CockpitAlert | null;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function DetailsAlertsAndActions({
  alert,
  open,
  onClose,
  onDownload,
}: DetailsAlertsAndActionsProps) {
  if (!alert) {
    return null;
  }

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
          {alert?.titulo}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight={500}
          mb={2}
          sx={{ color: "#777" }}
        >
          {alert?.descricao}
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadOutlined />}
          color={alert?.tipo === "alerta" ? "error" : "primary"}
          sx={{
            textTransform: "none",
            borderRadius: "16px",
            mb: 2,
          }}
          onClick={onDownload}
        >
          Baixar tabela completa
        </Button>
        <AlertsAndActionsTable alert={alert!} />
      </Box>
    </Modal>
  );
}
