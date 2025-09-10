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
    callbacks: {
      onChunk?: (chunk: string) => void;
      onDone?: () => void;
      onError?: (err: string) => void;
    },
    signal?: AbortSignal,
  ) {
    const token = authService.getAccessToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistantsthreads/${threadId}/ask_streaming`,
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
        // opcional: tratar 401/403 aqui
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      // Preferir TextDecoderStream quando existir
      if ("TextDecoderStream" in window) {
        const reader = res.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            console.log("value", value);
            const chunk: string = value ?? "";
            if (chunk.includes("[error]") || chunk.includes("[bridge-error]")) {
              callbacks.onError?.(chunk.trim());
            } else {
              callbacks.onChunk?.(chunk);
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Fallback para browsers sem TextDecoderStream
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk.includes("[error]") || chunk.includes("[bridge-error]")) {
              callbacks.onError?.(chunk.trim());
            } else {
              callbacks.onChunk?.(chunk);
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      callbacks.onDone?.();
    } catch (err: any) {
      callbacks.onError?.(err?.message ?? String(err));
    }
  },
};
export default assistantService;
