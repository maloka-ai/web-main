import React, { memo, useEffect, useRef } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import MarkdownMUI from '@/components/MarkdownMUI/MarkdownMUI';
import {
  AssistanteMessage,
  AssistantType,
  SpreadsheetMetadata,
} from '@/services/AssistantService';
import TransferAgent, {
  Payload,
} from '@/components/AssistantChat/components/TransferAgent/TransferAgent';
import SqlCodeBox from '@/components/AssistantChat/components/SqlCodeBox/SqlCodeBox';
import * as Recharts from 'recharts';
import { downloadChartAsImage } from '@/utils/graphics';

import styles from '../assistantChat.module.css';
import {
  Assistants,
  AssistantTypeLabels,
} from '@/components/AssistantChat/AssistenteSelector';
import { DownloadXlsxButton } from '@/components/AssistantChat/components/DownloadXlsxButton';

function showInsufficientDataWarning(msg: AssistanteMessage) {
  if (!msg.spreadsheet_metadata) return false;
  if (typeof msg.spreadsheet_metadata === 'object') {
    return !!msg.spreadsheet_metadata.insufficient_data_;
  }
  return false;
}

function showDownloadSpreadsheetButton(msg: AssistanteMessage) {
  if (!msg.spreadsheet_metadata) return false;
  if (typeof msg.spreadsheet_metadata === 'object') {
    return (
      !!msg.spreadsheet_metadata.message_id &&
      !msg.spreadsheet_metadata.insufficient_data_
    );
  }
  return false;
}

function showCodeSQLContainer(msg: AssistanteMessage) {
  if (!msg.spreadsheet_metadata) return false;
  if (typeof msg.spreadsheet_metadata === 'object') {
    return !!msg.spreadsheet_metadata.code_sql;
  }
  return false;
}

/**
 * DynamicChart component
 *
 * Renderiza o TSX recebido dentro de um iframe. O iframe carrega:
 *  - React + ReactDOM (via unpkg)
 *  - Recharts (via unpkg)
 *  - Babel standalone para transpilar JSX em runtime (type="text/babel")
 *
 * O code string deve exportar um componente default (ex: export default function MyChart() { return (<div>...</div>); })
 *
 * Observação de segurança: código arbitrário será executado dentro de um iframe. Este iframe
 * carrega libs via CDN. Se desejar restringir CDN ou usar outro método (por exemplo código pré-transpilado),
 * posso ajustar.
 */
function DynamicChart({
  code,
  height = 320,
}: {
  code: string;
  height?: number | string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    async function renderChart() {
      try {
        const Babel = await import('@babel/standalone');

        let transformed = code;
        let componentName = '';
        const replaceComponentName = 'ChartComponent';

        // === 1. Captura os componentes importados do Recharts ===
        const rechartsImportRegex =
          /import\s*{\s*([^}]+)\s*}\s*from\s*['"]recharts['"];?/;
        const rechartsMatch = transformed.match(rechartsImportRegex);
        if (rechartsMatch) {
          const components = rechartsMatch[1]
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
          for (const comp of components) {
            const compRegex = new RegExp(`\\b${comp}\\b`, 'g');
            transformed = transformed.replace(compRegex, `Recharts.${comp}`);
          }
          transformed = transformed.replace(rechartsImportRegex, '');
        }

        // === 2. Remove importações React ===
        transformed = transformed.replace(
          /import\s+React.*from\s+['"]react['"];?/g,
          '',
        );

        // === 3. Captura o nome do componente exportado ===
        const exportFnMatch = transformed.match(
          /export\s+default\s+function\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+)/,
        );
        if (exportFnMatch) {
          componentName = exportFnMatch[1];
          transformed = transformed.replace(
            /export\s+default\s+function\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+)/,
            'function ' + replaceComponentName,
          );
        } else if (/export\s+default\s+(\w+);?/.test(transformed)) {
          const match = transformed.match(
            /export\s+default\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+);?/,
          );
          if (match) {
            transformed = transformed.replace(
              /export\s+default\s+([a-zA-Z0-9çàâãóõôéêẽíîĩúûũ]+);?/,
              '',
            );
          }
        }

        // === 4. Envolve tudo num IIFE (sem return no topo) ===
        const wrappedCode = `
          (function() {
            ${transformed}
            return ${replaceComponentName};
          })()
        `;

        // === 5. Transpila JSX -> JS ===
        const { code: jsCode } = Babel.transform(wrappedCode, {
          presets: ['react'],
        });

        // === 6. Executa ===
        const createComponent = new Function(
          'React',
          'Recharts',
          `return ${jsCode}`,
        );
        const Component = createComponent(React, Recharts);

        if (!Component)
          throw new Error('O código não exportou um componente válido.');

        // === 7. Renderiza ===
        const mod = await import('react-dom/client');
        const ReactDOM = mod.default || mod;
        const root = ReactDOM.createRoot(containerRef.current!);
        root.render(React.createElement(Component));
      } catch (err) {
        console.error('Erro ao interpretar gráfico:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color:#b91c1c;padding:8px;">Erro ao renderizar gráfico: ${
            (err as Error).message
          }</div>`;
        }
      }
    }

    renderChart();
  }, [code]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fff',
        }}
      />
      <Button
        variant="outlined"
        color="primary"
        sx={{
          marginTop: '8px',
          color: '#df8157',
          borderColor: '#df8157',
        }}
        onClick={() => {
          if (containerRef.current) {
            downloadChartAsImage(containerRef.current);
          }
        }}
      >
        Baixar gráfico
      </Button>
    </div>
  );
}

const getAnalystInfo = (id: string) => {
  return {
    id,
    name: AssistantTypeLabels[id as AssistantType],
    avatar: Assistants.find((a) => a.type == (id as AssistantType))?.icon || '',
  };
};

type Props = {
  msg: AssistanteMessage;
  isLast: boolean;
  chartComponents: Record<string, string>;
  chartLoading: Record<string, boolean>;
  chartError: Record<string, string | true>;
  transferAgentInfo: Record<string, { analyst: string; question: string }>;
  isGeneratingMessage: boolean;
  isShowEllipsisLoading: boolean;
  handleTransfer: (p: { analyst: string; question: string }) => Promise<void>;
  lastUserMsgRef: React.RefObject<HTMLDivElement | null>;
  lastUserMsgId: string | null;
};

export const MsgChat = ({
  msg,
  isLast,
  chartComponents,
  chartError,
  chartLoading,
  transferAgentInfo,
  isGeneratingMessage,
  isShowEllipsisLoading,
  handleTransfer,
  lastUserMsgRef,
  lastUserMsgId,
}: Props) => {
  const isLastAssistant = msg.role === 'assistant' && isLast;
  const hasChartForMsg = Boolean(chartComponents[msg.id]);
  const isChartLoadingForMsg = Boolean(chartLoading[msg.id]);
  const isTransferAgentMsg = Boolean(transferAgentInfo[msg.id]);
  const isContentEmpty = !msg.content || !msg.content.trim();

  const isGeneratingThisMessage =
    isLastAssistant &&
    isContentEmpty &&
    !hasChartForMsg &&
    !isChartLoadingForMsg;

  // Ref para a última mensagem do usuário (âncora)
  const maybeUserRefProps =
    msg.role === 'user' && msg.id === lastUserMsgId
      ? { ref: lastUserMsgRef }
      : {};

  if (isGeneratingThisMessage) {
    return (
      <Box key={msg.id} className={styles.botMsg}>
        Analisando
        <span className={styles.typingDots} aria-label="digitando" />
      </Box>
    );
  }

  return (
    <Box
      key={msg.id}
      {...maybeUserRefProps}
      className={msg.role === 'user' ? styles.userMsg : styles.botMsg}
    >
      <MarkdownMUI>{msg.content}</MarkdownMUI>
      {isGeneratingMessage && isShowEllipsisLoading && isLastAssistant ? (
        <span className={styles.typingDots} aria-label="digitando" />
      ) : null}
      {/* Se a mensagem tem spreadsheet_metadata, botão de download */}
      {showInsufficientDataWarning(msg) && (
        <Box
          sx={{
            marginTop: 2,
            padding: 2,
            borderRadius: 1,
            backgroundColor: '#fff4e5',
            border: '1px solid #ffd8b5',
          }}
        >
          <Typography variant="body2" sx={{ color: '#663c00' }}>
            Não há dados suficientes para gerar a planilha solicitada.
          </Typography>
        </Box>
      )}
      {showDownloadSpreadsheetButton(msg) && <DownloadXlsxButton msg={msg} />}

      {showCodeSQLContainer(msg) && (
        <SqlCodeBox
          code={
            (msg.spreadsheet_metadata as SpreadsheetMetadata).code_sql || ''
          }
        />
      )}

      {(!!msg.transfer_to_agent || isTransferAgentMsg) && (
        <TransferAgent
          payload={
            (msg.transfer_to_agent as Payload) || transferAgentInfo[msg.id]
          }
          onTransfer={handleTransfer}
          getAnalystInfo={getAnalystInfo}
          editableQuestion={true}
        />
      )}

      {/* CHART: Skeleton se estiver carregando */}
      {chartLoading[msg.id] && (
        <Box sx={{ marginTop: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={320} />
        </Box>
      )}

      {chartError[msg.id] && (
        <Box
          sx={{
            marginTop: 2,
            padding: 2,
            borderRadius: 1,
            backgroundColor: '#fff3f2',
            border: '1px solid #fac8c3',
          }}
        >
          <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
            Falha ao gerar o gráfico.
          </Typography>
          {typeof chartError[msg.id] === 'string' && (
            <Typography
              variant="caption"
              sx={{
                color: '#7f1d1d',
                display: 'block',
                marginTop: 1,
              }}
            >
              {chartError[msg.id]}
            </Typography>
          )}
        </Box>
      )}

      {/* CHART: se temos o component code, renderiza via DynamicChart */}
      {chartComponents[msg.id] && (
        <Box sx={{ marginTop: 2 }}>
          <DynamicChart code={chartComponents[msg.id]} height={'100%'} />
        </Box>
      )}
    </Box>
  );
};
