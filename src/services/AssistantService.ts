// services/AssistantService.ts
import api from "@/utils/api";
import { authService } from "@/services/authService";

export interface Assistant {
  id: string;
  name: string;
  description: string;
}

export interface AssistantThread {
  thread_id: string;
  assistant_id: AssistantType;
  user_id: string;
  created_at: Date;
  title: string;
}
export type AssistantThreadResume = Omit<AssistantThread, "user_id">;

export interface AssistantThreadDelete {
  message: string;
}

export interface SpreadsheetMetadata {
  message_id: string;
  spreadsheet_id: string;
}

export interface AssistanteMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role?: string;
  content: string;
  chart_code: string | null;
  spreadsheet_metadata: string | SpreadsheetMetadata | null;
  created_at: Date;
}

export enum AssistantType {
  GENERAL = "1",
  SHOPPING = "2",
  DATA = "3",
}

type StreamingCallbacks = {
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (err: string) => void;
  onMetadata?: (meta: object) => void;
  // chart-specific
  onChartCodeLoading?: () => void;
  onChartCode?: (chartCode: string) => void;
  onChartCodeEnd?: () => void;
  onChartCodeError?: (errorMsg?: string) => void;
};

const META_START = "__METADATA_SEND_START__";
const META_END = "__METADATA_SEND_END__";

// chart markers
const CHART_LOADING = "__CHART_CODE_LOADING__";
const CHART_START = "__CHART_CODE_START__";
const CHART_END = "__CHART_CODE_END__";
const CHART_ERROR = "__CHART_CODE_ERROR__";

function createMetadataParser(callbacks: StreamingCallbacks) {
  let buffer = "";

  // emite texto normal para o chat
  const emitText = (text: string) => {
    if (!text) return;
    callbacks.onChunk?.(text);
  };

  // normaliza { spreadsheet_metadata: "<json>" } -> objeto
  const normalizeMeta = (meta: any) => {
    if (meta && typeof meta.spreadsheet_metadata === "string") {
      try {
        meta.spreadsheet_metadata = JSON.parse(meta.spreadsheet_metadata);
      } catch (e) {
        callbacks.onError?.(
          "Falha ao parsear spreadsheet_metadata: " + (e as Error).message,
        );
      }
    }
    return meta;
  };

  // processa buffer; pode extrair 0..N blocos de metadata e chart blocks
  const process = () => {
    while (true) {
      // Prioridade: detectar CHART_LOADING, CHART_START, META_START (qualquer ordem possível no fluxo)
      const idxChartLoading = buffer.indexOf(CHART_LOADING);
      const idxChartStart = buffer.indexOf(CHART_START);
      const idxMetaStart = buffer.indexOf(META_START);
      const idxChartError = buffer.indexOf(CHART_ERROR);

      // Se não encontramos nenhum marcador especial, emitimos texto "seguro" (evitando dividir marcador em dois chunks)
      if (idxChartLoading === -1 && idxChartStart === -1 && idxMetaStart === -1 && idxChartError === -1) {
        const safeLen = Math.max(0, buffer.length - Math.max(CHART_START.length, META_START.length, CHART_LOADING.length, CHART_ERROR.length));
        if (safeLen > 0) {
          emitText(buffer.slice(0, safeLen));
          buffer = buffer.slice(safeLen);
        }
        break;
      }

      // Determina qual marcador vem primeiro no buffer (menor índice >=0)
      const candidates: { idx: number; type: "chartLoading" | "chartStart" | "metaStart" | "chartError" }[] = [];
      if (idxChartLoading !== -1) candidates.push({ idx: idxChartLoading, type: "chartLoading" });
      if (idxChartStart !== -1) candidates.push({ idx: idxChartStart, type: "chartStart" });
      if (idxMetaStart !== -1) candidates.push({ idx: idxMetaStart, type: "metaStart" });
      if (idxChartError !== -1) candidates.push({ idx: idxChartError, type: "chartError" });

      candidates.sort((a, b) => a.idx - b.idx);
      const next = candidates[0];

      // texto antes do marcador -> emitir como texto normal
      if (next.idx > 0) {
        emitText(buffer.slice(0, next.idx));
        buffer = buffer.slice(next.idx);
      }

      if (next.type === "chartLoading") {
        // consome o marcador e dispara callback de loading
        buffer = buffer.slice(CHART_LOADING.length);
        callbacks.onChartCodeLoading?.();
        // continua loop
        continue;
      }

      if (next.type === "chartError") {
        // consome token e dispara callback para indicar erro; pode opcionalmente conter texto após token (não JSON)
        buffer = buffer.slice(CHART_ERROR.length);
        callbacks.onChartCodeError?.();
        continue;
      }

      if (next.type === "chartStart") {
        // procura CHART_END após CHART_START
        const s = buffer.indexOf(CHART_START);
        const e = buffer.indexOf(CHART_END, s + CHART_START.length);
        if (e === -1) {
          // marcador incompleto: esperar próximo chunk
          break;
        }

        const jsonStr = buffer.slice(s + CHART_START.length, e).trim();
        try {
          // esperamos receber JSON do tipo: {"chart_code": "...tsx..."}
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed.chart_code === "string") {
            callbacks.onChartCode?.(parsed.chart_code);
          } else {
            callbacks.onError?.("chart block invalid or missing chart_code field");
          }
        } catch (err) {
          callbacks.onError?.(
            "Falha ao parsear chart JSON: " + (err as Error).message,
          );
        }

        // remove bloco do buffer (não emite como texto)
        buffer = buffer.slice(e + CHART_END.length);
        // dispara onChartCodeEnd (opcionalmente)
        callbacks.onChartCodeEnd?.();
        continue;
      }

      if (next.type === "metaStart") {
        // comportamente original de metadados
        const s = buffer.indexOf(META_START);
        if (s === -1) break;

        const e = buffer.indexOf(META_END, s + META_START.length);
        if (e === -1) {
          // metadata incompleto; esperar próximo chunk
          break;
        }

        const jsonStr = buffer.slice(s + META_START.length, e).trim();
        try {
          const rawMeta = JSON.parse(jsonStr);
          const meta = normalizeMeta(rawMeta);
          callbacks.onMetadata?.(meta);
        } catch (err) {
          callbacks.onError?.(
            "Falha ao parsear metadados: " + (err as Error).message,
          );
        }

        // remove bloco processado e continua
        buffer = buffer.slice(e + META_END.length);
        continue;
      }
    }
  };

  return {
    push: (chunk: string) => {
      buffer += chunk;
      process();
    },
    flush: () => {
      if (buffer) {
        // no flush, só emite o que restou como texto
        if (buffer.trim()) {
          emitText(buffer);
        }
        buffer = "";
      }
    },
  };
}

const assistantService = {
  async getAssistants(): Promise<Assistant[]> {
    const response = await api.get<Assistant[]>("/assistants");
    return response.data;
  },
  async createConversation(
    assistant_id: string,
    title: string,
  ): Promise<AssistantThread> {
    const response = await api.post<AssistantThread>("/assistants/threads", {
      assistant_id,
      title,
    });
    return response.data;
  },
  async listConversations(): Promise<AssistantThreadResume[]> {
    const response = await api.get<AssistantThreadResume[]>(
      "/assistants/threads",
    );
    return response.data;
  },
  async editConversation(
    thread_id: string,
    title: string,
  ): Promise<AssistantThread> {
    const response = await api.put<AssistantThread>(
      `/assistants/threads/${thread_id}/title?title=${encodeURIComponent(title)}`
    );
    return response.data;
  },
  async deleteConversation(thread_id: string): Promise<AssistantThreadDelete> {
    const reaponse = await api.delete<AssistantThreadDelete>(
      `/assistants/threads/${thread_id}`
    );
    return reaponse.data;
  },
  async sendMessage(
    thread_id: string,
    message: string,
  ): Promise<AssistanteMessage> {
    const response = await api.post<AssistanteMessage>(
      `/assistants/threads/${thread_id}/ask`,
      {
        message,
      },
    );
    return response.data;
  },
  async listMessages(thread_id: string): Promise<AssistanteMessage[]> {
    const response = await api.get<AssistanteMessage[]>(
      `/assistants/threads/${thread_id}/messages`,
    );
    // Ensure if message has spreadsheet metadata, it is parsed correctly
    return response.data.map((message) => {

      const content = message.content;

      // extract graph code if present
      const chartCodeMatch = content.match(
        /__CHART_CODE_START__(.*?)__CHART_CODE_END__/,
      );
      const errorCodeMatch = content.match(
        /__CHART_CODE_ERROR__(.*)/,
      );
      if (chartCodeMatch) {
        message.content = content.replace(
          /__CHART_CODE_START__.*?__CHART_CODE_END__/,
          "",
        ).replace(
          "__CHART_CODE_LOADING__", "",
        ).trim();
      }

      if (errorCodeMatch) {
        message.content = content.replace(
          /__CHART_CODE_ERROR__.*/,
          "",
        ).replace(
          "__CHART_CODE_LOADING__", "",
        ).trim();
      }

      return {
      ...message,
      chart_code: chartCodeMatch ? JSON.parse(chartCodeMatch[1].trim())["chart_code"] : null,
      spreadsheet_metadata:
        typeof message.spreadsheet_metadata === "string"
          ? JSON.parse(message.spreadsheet_metadata)
          : message.spreadsheet_metadata,
    }});
  },
  async downloadSpreadsheet(message_id: string): Promise<string> {
    const response = await api.get<string>(
      `/assistants/threads/${message_id}/spreadsheet_bytes`,
    );
    return response.data;
  },

  async sendMessageStreaming(
    message: string,
    threadId: string,
    callbacks: StreamingCallbacks,
    signal?: AbortSignal,
  ) {
    const token = authService.getAccessToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/threads/${threadId}/ask_streaming`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ message }),
          signal,
        },
      );

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const parser = createMetadataParser(callbacks);

      if ("TextDecoderStream" in window) {
        const reader = res.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            parser.push(value ?? "");
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            parser.push(decoder.decode(value, { stream: true }));
          }
        } finally {
          reader.releaseLock();
        }
      }

      parser.flush();
      callbacks.onDone?.();
    } catch (err: any) {
      callbacks.onError?.(err?.message ?? String(err));
    }
  },
};

export default assistantService;
