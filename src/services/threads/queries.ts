import { useQuery } from '@tanstack/react-query';
import { threadsKeys } from './queryKeys';
import AssistantService from '@/services/AssistantService';

export const useQueryThreads = () => {
  return useQuery({
    queryKey: threadsKeys.all,
    queryFn: AssistantService.listConversations,
    initialData: [],
  });
};
