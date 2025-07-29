// components/MarkdownMUI.tsx
import Markdown from 'markdown-to-jsx';
import { Typography, Box } from '@mui/material';

interface MarkdownMUIProps {
  children: string;
}

export default function MarkdownMUI({ children }: MarkdownMUIProps) {
  return (
    <Box sx={{ color: '#4b4b4b', fontSize: '1rem', lineHeight: 1.7 }}>
      <Markdown
        options={{
          overrides: {
            h1: {
              component: Typography,
              props: { variant: 'h5', gutterBottom: true, fontWeight: 700 },
            },
            h2: {
              component: Typography,
              props: { variant: 'h6', gutterBottom: true, fontWeight: 600 },
            },
            p: {
              component: Typography,
              props: { variant: 'body1', gutterBottom: true },
            },
            li: {
              component: (props: any) => (
                <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
                  {props.children}
                </Typography>
              ),
            },
            strong: {
              component: Typography,
              props: {
                component: 'strong',
                sx: { fontWeight: 600, display: 'inline' },
              },
            },
          },
        }}
      >
        {children}
      </Markdown>
    </Box>
  );
}
