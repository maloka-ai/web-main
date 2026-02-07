import React from 'react';
import { Card, CardContent, Box, Skeleton, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export function ScheduleCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #E6DCCB',
        boxShadow: 'none',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="60%" height={28} />
          </Box>

          {/* menu icon placeholder */}
          <IconButton disabled>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Status chip */}
        <Box mt={1}>
          <Skeleton
            variant="rounded"
            width={110}
            height={24}
            sx={{ borderRadius: 999 }}
          />
        </Box>

        {/* Body lines */}
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={90} height={22} />
            <Skeleton variant="text" width="55%" height={22} />
          </Box>

          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={140} height={22} />
            <Skeleton variant="text" width="40%" height={22} />
          </Box>

          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={140} height={22} />
            <Skeleton variant="text" width="35%" height={22} />
            <Skeleton
              variant="rounded"
              width={70}
              height={22}
              sx={{ borderRadius: 999, ml: 1 }}
            />
          </Box>

          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={150} height={22} />
            <Skeleton variant="text" width="45%" height={22} />
          </Box>

          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={120} height={22} />
            <Skeleton variant="text" width="75%" height={22} />
          </Box>

          {/* Passos (linha + expand icon fake) */}
          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="text" width={80} height={22} />
            <Skeleton variant="text" width="65%" height={22} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>

          {/* uma “prévia” de conteúdo expandido */}
          <Box mt={0.5}>
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
