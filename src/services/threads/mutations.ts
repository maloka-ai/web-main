import { useMutation, useQueryClient } from '@tanstack/react-query';
import assistantService, {
  AssistantThreadResume,
} from '@/services/AssistantService';
import { threadsKeys } from '@/services/threads/queryKeys';

export function useMutationCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      newTitle,
      assistantId,
    }: {
      assistantId: string;
      newTitle: string;
    }) => assistantService.createConversation(assistantId, newTitle),
    onSuccess(newThread, { newTitle }) {
      queryClient.setQueryData<AssistantThreadResume[]>(
        threadsKeys.all,
        (oldData) => {
          if (Array.isArray(oldData)) {
            return [{ ...newThread, title: newTitle }, ...oldData];
          }
          return [{ ...newThread, title: newTitle }];
        },
      );
    },
  });
}
export function useMutationEditThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      newTitle,
      threadId,
    }: {
      threadId: string;
      newTitle: string;
    }) => {
      return assistantService.editConversation(threadId, newTitle);
    },
    onSuccess(_, { newTitle, threadId }) {
      if (newTitle) {
        queryClient.setQueryData<AssistantThreadResume[]>(
          threadsKeys.all,
          (oldData) => {
            if (Array.isArray(oldData)) {
              return oldData.map((item) => {
                if (item.thread_id === threadId) {
                  return { ...item, title: newTitle };
                }
                return item;
              });
            }
            return oldData;
          },
        );
      }
    },
  });
}

export function useMutationDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) =>
      assistantService.deleteConversation(threadId),
    onSuccess(_, threadId) {
      queryClient.setQueryData<AssistantThreadResume[]>(
        threadsKeys.all,
        (oldData) => {
          if (Array.isArray(oldData)) {
            return oldData.filter((thread) => thread.thread_id !== threadId);
          }
          return oldData;
        },
      );
    },
  });
}
