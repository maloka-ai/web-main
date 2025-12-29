import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, ContentCopy } from '@mui/icons-material';
import styles from './sqlCodeBox.module.css';
import { parseMarkdown } from '@/components/MarkdownMUI/MarkdownHelper';

export default function SqlCodeBox({ code }: { code: string }) {
  const [expanded, setExpanded] = useState(false);
  const [htmlCode, setHtmlCode] = useState<string>('');

  useEffect(() => {
    async function convertMarkdown() {
      const parsed = await parseMarkdown(code);
      setHtmlCode(parsed);
    }
    convertMarkdown();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
  };

  return (
    <Box className={styles.containerSqlBox}>
      <Box className={styles.header}>
        <Typography variant="subtitle2" className={styles.title}>
          Código SQL utilizado:
        </Typography>

        <Box className={styles.actions}>
          <Tooltip title={expanded ? 'Recolher' : 'Expandir'}>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Copiar código">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {expanded && (
        <Box className={styles.sqlCode}>
          <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
        </Box>
      )}
    </Box>
  );
}
