import api from '@/utils/api';

export interface Assistant {
    id: string,
    name: string,
    description: string
}

export interface AssistantThread {
  thread_id: string,
  assistant_id: AssistantType,
  user_id: string,
  created_at: Date,
  title: string,
}
export type AssistantThreadResume = Omit<AssistantThread, 'user_id' >

export interface AssistanteMessage {
  id: string,
  thread_id: string,
  user_id: string,
  role?: string,
  content: string,
  created_at: Date,
}

export enum AssistantType {
  GENERAL = "1",
  SHOPPING = "2",
  DATA = "3",
}

const assistantService = {
  async getAssistants(): Promise<Assistant[]> {
    const response = await api.get<Assistant[]>('/assistants');
    return response.data;
  },
  async createConversation(assistant_id: string, title: string): Promise<AssistantThread> {
    const response = await api.post<AssistantThread>('/assistants/threads', {
      assistant_id,
      title,
    });
    return response.data;
  },
  async listConversations(): Promise<AssistantThreadResume[]> {
    const response = await api.get<AssistantThreadResume[]>('/assistants/threads');
    return response.data;
  },
  async sendMessage(thread_id: string, message: string): Promise<AssistanteMessage> {
    const response = await api.post<AssistanteMessage>(`/assistants/threads/${thread_id}/ask`, {
      message,
    });
    return response.data;
  },
  async listMessages(thread_id: string): Promise<AssistanteMessage> {
    const response = await api.get<AssistanteMessage>(`/assistants/threads/${thread_id}/messages`);
    return response.data;
  },
}

export default assistantService;