import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, messageApi } from "@/utils/api";
import { Conversation, Message } from "@/types";

export const useConversations = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageApi.getConversations(api),
    select: (response) => response.data.conversations as Conversation[],
  });

  const deleteMutation = useMutation({
    mutationFn: (conversationId: string) =>
      messageApi.deleteConversation(api, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations: data || [],
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteConversation: deleteMutation.mutate,
  };
};

export const useConversationMessages = (conversationId: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messageApi.getMessages(api, conversationId),
    select: (response) => response.data.messages as Message[],
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { recipientId: string; content: string }) =>
      messageApi.sendMessage(api, payload),
    onSuccess: () => {
      // Invalidate both current chat and conversation list (to update last message)
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages: data || [],
    isLoading,
    error,
    refetch,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
};
