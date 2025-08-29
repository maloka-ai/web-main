'use client';

import { Typography } from '@mui/material';

interface ResumeKPIProps {
  data: string;
}

export default function ResumeKPI({ data }: ResumeKPIProps) {
  return (
    <Typography fontSize="auto" fontWeight={700} color="#78a27f"
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
