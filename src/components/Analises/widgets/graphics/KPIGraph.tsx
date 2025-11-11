'use client';

import { Typography } from '@mui/material';

interface ResumeKPIProps {
  data: string;
}

export default function ResumeKPI({ data }: ResumeKPIProps) {
  return (
    <Typography
      fontSize="auto"
      fontWeight={500}
      color="#7b7b7b'"
      sx={{
        maxWidth: '100%',
        fontSize: 'clamp(1rem, 1.8vw, 2rem)',
        lineHeight: 1.2,
        textAlign: 'start',
      }}
    >
      {data}
    </Typography>
  );
}
