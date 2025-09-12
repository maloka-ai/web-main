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
  onMetadata?: (meta: object) => void; // <-- novo
};

const META_START = "__METADATA_SEND_START__";
const META_END = "__METADATA_SEND_END__";

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

  // processa buffer; pode extrair 0..N blocos de metadata
  const process = () => {
    while (true) {
      const s = buffer.indexOf(META_START);
      if (s === -1) {
        // não há START: emitir parte segura (evitar cortar marcador em formação)
        const safeLen = Math.max(0, buffer.length - (META_START.length - 1));
        if (safeLen > 0) {
          emitText(buffer.slice(0, safeLen));
          buffer = buffer.slice(safeLen);
        }
        break;
      }

      // texto antes do metadata
      if (s > 0) {
        emitText(buffer.slice(0, s));
      }

      const e = buffer.indexOf(META_END, s + META_START.length);
      if (e === -1) {
        // metadata incompleto; esperar próximo chunk
        buffer = buffer.slice(s);
        break;
      }

      // JSON entre START e END
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
    }
  };

  return {
    push: (chunk: string) => {
      buffer += chunk;
      process();
    },
    flush: () => {
      if (buffer) {
        emitText(buffer);
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
    return response.data.map((message) => ({
      ...message,
      spreadsheet_metadata:
        typeof message.spreadsheet_metadata === "string"
          ? JSON.parse(message.spreadsheet_metadata)
          : message.spreadsheet_metadata,
    }));
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
