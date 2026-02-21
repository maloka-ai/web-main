'use client';

import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListSubheader,
  Stack,
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import { useState } from 'react';
import { AnalysisSubPages } from '@/utils/enums';
import { AnalysisMenuConfig, AnalysisSubpagesConfig } from './Analises';
import { useIsMobile } from '@/hooks/useIsMobile';
import GlobalFilter from './widgets/GlobalFilter';

interface Props {
  current: AnalysisSubPages;
  menu: string;
  onNavigate: (page: AnalysisSubPages, menu: string) => void;
}

export default function HeaderAnalises({ current, menu, onNavigate }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isMobile = useIsMobile();
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (page: AnalysisSubPages, menu: string) => {
    onNavigate(page, menu);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid #e3e3e3',
        height: '60px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <IconButton onClick={handleMenuOpen} color={'primary'} size={'medium'}>
          <ListIcon fontSize="large" />
        </IconButton>

        {isMobile ? (
          <Stack>
            <Typography
              variant="subtitle2"
              fontWeight={500}
              color="#324b4b"
              lineHeight={1}
            >
              {menu}
            </Typography>
            <Typography variant="h6" color="#324b4b" lineHeight={1}>
              <strong>{AnalysisSubpagesConfig[current].title}</strong>
            </Typography>
          </Stack>
        ) : (
          <Typography variant="h6" fontWeight={500} color="#324b4b">
            {menu}
            {!isMobile && (
              <span style={{ color: '#9c5d40', margin: '0 0.25rem' }}>|</span>
            )}
            <strong>{AnalysisSubpagesConfig[current].title}</strong>
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isMobile && <GlobalFilter />}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: '240px',
              borderRadius: '12px',
              backgroundColor: '#f4f3ed',
              boxShadow: '0 0 2.3px 2.2px rgba(0, 0, 0, 0.07)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleMenuClose}
            color={'primary'}
            size={'small'}
          >
            <ListIcon fontSize="large" />
          </IconButton>
          <Typography
            variant="subtitle1"
            color="#3e3e3e"
            fontSize={'1rem'}
            fontWeight={500}
          >
            Análises
          </Typography>
        </Box>
        {AnalysisMenuConfig.map((section) => (
          <Box key={section.title}>
            <ListSubheader
              disableSticky
              disableGutters
              sx={{
                paddingLeft: '1.25rem',
                lineHeight: '28px',
                color: '#3e3e3e',
                fontWeight: '600',
              }}
            >
              {section.title}
            </ListSubheader>
            {section.items.map((item) => (
              <MenuItem
                key={item.page}
                onClick={() => handleSelect(item.page, section.title)}
                sx={{
                  bgcolor: current === item.page ? 'white' : 'inherit',
                  paddingLeft: '1.25rem',

                  ...(current === item.page && {
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRadius: '100%',
                      width: '8px',
                      height: '8px',
                      bgcolor: '#9c5d40',
                    },
                  }),
                }}
              >
                {item.title}
              </MenuItem>
            ))}
          </Box>
        ))}
      </Menu>
    </Box>
  );
}
