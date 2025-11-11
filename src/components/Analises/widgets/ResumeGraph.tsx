'use client';

import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import RenderGraphic from './RenderGraphic';
import { GraphData, useGetStrokeColor } from '@/utils/graphics';
import DetailGraph from './DetailGraph';
import { useTheme } from '@mui/material/styles';

export interface DataPoint {
  name: string;
  value: number;
}

interface ResumeGraphProps {
  graph: GraphData;
}

export default function ResumeGraph({ graph }: ResumeGraphProps) {
  const [open, setOpen] = useState(false);

  const {
    type,
    title,
    subtitle,
    value,
    data,
    gain,
    secondData,
    xLabelMap,
    hideXAxis,
    xAxisAngle,
    tooltipFormatter,
  } = graph;

  const theme = useTheme();
  const getStrokeColor = useGetStrokeColor();
  const colorSuccess = theme.palette.success.main;
  const colorError = theme.palette.error.main;
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '10.8px',
        border: 'solid 1px #edebe3',
        padding: '1rem 1.25rem',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography
          variant="subtitle1"
          fontWeight={'600'}
          color="#3e3e3e"
          mb={0.5}
        >
          {title}
        </Typography>

        <IconButton
          onClick={() => setOpen(!open)}
          sx={{ color: '#f19468', width: 32, height: 32, padding: 0 }}
        >
          <OpenInFullOutlinedIcon />
        </IconButton>

        <DetailGraph
          open={open}
          onClose={() => setOpen(false)}
          graph={{
            type,
            title,
            subtitle,
            value,
            data,
            gain,
            secondData,
            xLabelMap,
            hideXAxis,
            xAxisAngle,
            tooltipFormatter,
          }}
        />
      </Box>

      <Typography
        fontSize="auto"
        fontWeight={500}
        color={getStrokeColor(data, secondData)}
        sx={{
          maxWidth: '100%', // ou um valor como '240px'
          fontSize: 'clamp(1rem, 1.8vw, 2rem)',
          lineHeight: 1.2,
          textAlign: 'start',
        }}
      >
        {value}
      </Typography>

      <Box sx={{ height: 200, width: '100%' }}>
        <RenderGraphic
          graph={{
            type,
            data,
            secondData,
            xLabelMap,
            hideXAxis,
            xAxisAngle,
            tooltipFormatter,
          }}
        />
      </Box>

      {subtitle && (
        <Typography variant="body2" fontWeight={400} color="#777" mt={1}>
          {subtitle}
          {gain && (
            <span
              style={{
                color: gain >= 0 ? colorSuccess : colorError,
                fontWeight: 600,
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              {gain >= 0 ? '+' : ''}
              {gain}%
            </span>
          )}
        </Typography>
      )}
    </Box>
  );
}
