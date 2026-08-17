"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  sendMessage,
  getMessages,
  loadOlderMessages,
  resetUnreadCount,
  markMessagesAsRead,
  clearChat,
  sendAudio,
  sendDocument,
  searchConversationMessages,
} from "@/api/user";

import { Message } from "@/types/messages";
import { UploadVoicePayload } from "@/types/audio";
const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageDetails: Message) =>
      sendMessage(messageDetails),

    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ["messages", newMessage.conversationId],
        (old: any) => {
          if (!old) {
            return {
              messages: [newMessage],
              hasMore: false,
            };
          }

          return {
            ...old,
            messages: [
              ...old.messages,
              newMessage,
            ],
          };
        }
      );
    },
  });
};
const useLoadOlder = () => {
  const queryClient = useQueryClient();

  const loadOlder = async (
    conversationId: string,
    skip: number
  ) => {
    try {
      const response =
        await loadOlderMessages(
          conversationId,
          skip
        );

      const olderMessages =
        response.messages;

      console.log(
        "📦 Older messages:",
        olderMessages
      );

      queryClient.setQueryData(
        ["messages", conversationId],
        (old: any) => {
          if (!old) return old;

          const merged = [
            ...olderMessages,
            ...old.messages,
          ];

          const unique = Array.from(
            new Map(
              merged.map((message: any) => [
                message.id,
                message,
              ])
            ).values()
          );

          unique.sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );

          return {
            messages: unique,
            hasMore: response.hasMore,
          };
        }
      );

      return {
        messages: olderMessages,
        hasMore: response.hasMore,
      };
    } catch (error) {
      console.error(
        "Failed to load older messages:",
        error
      );

      throw error;
    }
  };

  return { loadOlder };
};

const useMessages = (
  conversationId: string | null
) => {
  return useQuery({
    queryKey: [
      "messages",
      conversationId,
    ],

    queryFn: async () => {
      if (!conversationId) {
        throw new Error(
          "No conversationId"
        );
      }

      return getMessages(conversationId);
    },

    enabled: !!conversationId,
  });
};

const useResetUnreadCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      resetUnreadCount(conversationId),

    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: [
          "messages",
          conversationId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "current-user-conv",
        ],
      });
    },
  });
};

const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
    }: {
      conversationId: string;
    }) =>
      markMessagesAsRead(
        conversationId
      ),

    onSuccess: (
      _,
      { conversationId }
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "messages",
          conversationId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "current-user-conv",
        ],
      });
    },
  });
};

const useClearChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
    }: {
      conversationId: string;
    }) =>
      clearChat(conversationId),

    onSuccess: (
      _,
      { conversationId }
    ) => {
      queryClient.setQueryData(
        ["messages", conversationId],
        {
          messages: [],
          hasMore: false,
        }
      );

      queryClient.invalidateQueries({
        queryKey: [
          "messages",
          conversationId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "current-user-conv",
        ],
      });
    },
  });
};

const useSendVoice = () => {
  return useMutation({
    mutationFn: async ({
      file,
      conversationId,
    }: UploadVoicePayload) => {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "conversationId",
        conversationId
      );

      return sendAudio(formData);
    },
  });
};

const useSendDocument = () => {
  return useMutation({
    mutationFn: async ({
      file,
      conversationId,
    }: UploadVoicePayload) => {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "conversationId",
        conversationId
      );

      return sendDocument(formData);
    },
  });
};

const useSearchConversationMessages = (
  conversationId: string | null,
  search: string
) => {
  return useQuery({
    queryKey: [
      "conversation-search",
      conversationId,
      search,
    ],

    queryFn: () =>
      searchConversationMessages(
        conversationId!,
        search
      ),

    enabled:
      !!conversationId &&
      search.trim().length > 0,
  });
};

export {
  useSendMessage,
  useLoadOlder,
  useMessages,
  useResetUnreadCount,
  useMarkMessagesAsRead,
  useClearChat,
  useSendVoice,
  useSendDocument,
  useSearchConversationMessages,
};