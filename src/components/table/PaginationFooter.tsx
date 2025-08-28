"use client";
import { Box, IconButton, Typography } from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export function PaginationFooter({
  page,
  totalPages,
  disabled,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}) {
  const btnSx = (enabled: boolean) => ({
    width: 36,
    height: 36,
    borderRadius: "999px",
    boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
    transition: "all .15s ease",
    ...(enabled
      ? {
          bgcolor: "primary.main",
          color: "#fff",
          "&:hover": { bgcolor: "primary.dark" },
        }
      : {
          bgcolor: "rgba(229,143,85,.15)", // pêssego claro
          color: "rgba(229,143,85,.60)",
        }),
    "&.Mui-disabled": {
      bgcolor: "rgba(229,143,85,.15)",
      color: "rgba(229,143,85,.45)",
    },
  });

  const isFirstDisabled = disabled || page <= 1;
  const isPrevDisabled = disabled || page <= 1;
  const isNextDisabled = disabled || page >= Math.max(1, totalPages);
  const isLastDisabled = disabled || page >= Math.max(1, totalPages);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1.25}
      p={1.5}
    >
      <IconButton
        aria-label="primeira página"
        onClick={onFirst}
        disabled={isFirstDisabled}
        sx={btnSx(!isFirstDisabled)}
      >
        <KeyboardDoubleArrowLeftIcon fontSize="small" />
      </IconButton>

      <IconButton
        aria-label="anterior"
        onClick={onPrev}
        disabled={isPrevDisabled}
        sx={btnSx(!isPrevDisabled)}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box px={2} display="flex" alignItems="baseline" gap={0.75}>
        <Typography
          variant="body1"
          fontWeight={700}
          sx={{
            display: "inline-block",
            borderBottom: "2px solid",
            borderColor: "text.primary",
            lineHeight: 1,
            pb: 0.25,
          }}
        >
          {Math.max(1, Math.min(page, totalPages || 1))}
        </Typography>
        <Typography variant="body2">/</Typography>
        <Typography variant="body2">{Math.max(1, totalPages || 1)}</Typography>
      </Box>

      <IconButton
        aria-label="próxima"
        onClick={onNext}
        disabled={isNextDisabled}
        sx={btnSx(!isNextDisabled)}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>

      <IconButton
        aria-label="última página"
        onClick={onLast}
        disabled={isLastDisabled}
        sx={btnSx(!isLastDisabled)}
      >
        <KeyboardDoubleArrowRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
