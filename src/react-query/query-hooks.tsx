"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, getAllUsers, getAllConversations, createNewConversations, getMessages, sendMessage, resetUnreadCount, markMessagesAsRead, sendAudio, sendDocument, clearChat, updateUser, loadOlderMessages, searchConversationMessages } from "@/api/user";
import { useDispatch } from "react-redux";
import { Message } from "@/types/messages";
import { setSelectedChat } from "@/redux/chats-slice";
import { getSocket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { UploadVoicePayload } from "@/types/audio";
import { UpdateUserPayload } from "@/types/update-user"

// ✅ Get single user
const useCurrentUser = () => {
  const query = useQuery({
    queryKey: ["profile"], // unique cache key
    queryFn: () => getCurrentUser(),
  });

  return query
}


// ✅ Get all users
const useAllUsers = (searchKey?: string) => {
  const query = useQuery({
    queryKey: ["users", searchKey],
    queryFn: () => getAllUsers(searchKey),
  });

  return query;
}
const useAllConversations = () => {
  const query = useQuery({
    queryKey: ["current-user-conv"],
    queryFn: () => getAllConversations(),
  });

  return query;
}
const useCreateConversation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { participantIds: string[] }) => {
      console.log("mutationFn data:", data);
      return createNewConversations(data); // ✅ return the promise
    },
    onSuccess: (response) => {

      console.log("onSuccess data:", response);
      // ✅ select only the actual conversation object
      const newConversation = response?.saveConversation;

      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
      dispatch(setSelectedChat(newConversation));
    },
  });
};
const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageDetails: Message) => sendMessage(messageDetails),

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
            messages: [...old.messages, newMessage],
          };
        }
      );
    },
  });
};

const useLoadOlder = () => {
  console.log("🔥 loader MESSAGES");
  const queryClient = useQueryClient();
  const loadOlder = async (
    conversationId: string,
    skip: number,
    setHasOlderMessages: any
  ) => {
    try {
      const response = await loadOlderMessages(
        conversationId,
        skip
      );
      const olderMessages = response.messages;
      console.log("culprit", olderMessages);

      setHasOlderMessages(response.hasMore);
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
              merged.map((m: any) => [m.id, m])
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
      return { messages: olderMessages, hasMore: response.hasMore, };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return { loadOlder };
};
// const useJoinAllConversations = () => {
//   const socket = getSocket();
//   const { data: conversations, isSuccess: convReady } = useAllConversations();
//   const { data: currentUser, isSuccess: userReady } = useCurrentUser();

//   useEffect(() => {
//     if (!socket) return;
//     if (!userReady || !convReady) {
//       console.log("kahhhehhe");

//     }

//     if (conversations?.length && currentUser?.id) {
//       conversations.forEach((conv) => {
//         socket.emit("join_conversation", conv.id);
//       });
//       console.log("✅ Joined all conversations for", currentUser.id);
//     }

//     return () => {
//       socket.off("join_conversation");
//     };
//   }, [socket, conversations, convReady, currentUser, userReady]);
// };


const useSocketChat = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    console.log(socket);

    if (conversationId) {
      // ✅ join conversation room
      socket.emit("join_conversation", conversationId);
      socket.emit("mark_as_read", conversationId);
    }
    const handleReceiveMessage = (message: any) => {

      queryClient.setQueryData(
        ["messages", message.conversationId],
        (old: any) => {
          if (!old) {
            return {
              messages: [message],
              hasMore: false,
            };
          }

          if (old.messages.some((m: any) => m.id === message.id)) {
            return old;
          }

          return {
            ...old,
            messages: [...old.messages, message],
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["current-user-conv"],
      });
    }
    socket.on("receive_message", handleReceiveMessage);
    console.log("🔥 SOCKET MESSAGES");
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [conversationId, queryClient]);
}
const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("No conversationId"); // no chat selected yet
      return getMessages(conversationId);
    },
    enabled: !!conversationId,
  });
}
const useResetUnreadCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => resetUnreadCount(conversationId),
    onSuccess: (_, conversationId) => {
      // refetch messages for this conversation
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      // optionally invalidate conversation list to update unread counts
      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
    }
  });
}

const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      markMessagesAsRead(conversationId),

    onSuccess: (_, { conversationId }) => {
      // Refresh messages for this conversation
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      // Refresh the conversation list (to update unread badges)
      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
    },
  });

}
const useClearChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      clearChat(conversationId), // ✅ pass userId
    onSuccess: (_, { conversationId }) => {
      // Instant UI update
      queryClient.setQueryData(["messages", conversationId], []);

      // Optional: refetch server data
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
    },
  });
};
const useTypingIndicator = (conversationId: string, currentUserId: string) => {
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!conversationId) return;
    socket.emit("join_conversation", conversationId);

    socket.on("user_typing", (data) => {
      console.log("🟢 Received user_typing:", data); // ✅ Add this
      if (data.conversationId === conversationId && data.senderId !== currentUserId) {
        setTypingUser(data.senderId);
      }
    });

    socket.on("user_stop_typing", (data) => {
      if (data.conversationId === conversationId && data.senderId !== currentUserId) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [conversationId, currentUserId]);

  return typingUser;
};

const useSendVoice = () => {
  return useMutation({
    mutationFn: async ({ file, conversationId }: UploadVoicePayload) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      return sendAudio(formData);
    },
  });
};
const useSendDocument = () => {
  return useMutation({
    mutationFn: async ({ file, conversationId }: UploadVoicePayload) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      return sendDocument(formData);
    },
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserPayload) => {
      const formData = new FormData();
      console.log("he aa", data);

      if (data.userName) formData.append("userName", data.userName);
      if (data.password) formData.append("password", data.password);
      if (data.avatar) formData.append("avatar", data.avatar);
      if (data.re_auth_psw) formData.append("re_auth_psw", data.re_auth_psw);
      console.log(formData, "from update user");


      return updateUser(formData);
    },
    retry: false,
    onSuccess: () => {
      // Refetch current user data after update
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return
    const interval = setInterval(() => {
      socket.emit('heartbeat');
      console.log("see heartbeat");

    }, 10000); // every 10 seconds

    const handleOnlineUsers = (userIds: string[]) => {
      console.log("Updated online users:", userIds);
      setOnlineUsers(new Set(userIds));
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
      clearInterval(interval)
      socket.off("online_users", handleOnlineUsers);
    };
  }, []);

  return onlineUsers;
};
const useSearchConversationMessages = (
  conversationId: string | null,
  search: string
) => {
  return useQuery({
    queryKey: ["conversation-search", conversationId, search],
    queryFn: () =>
      searchConversationMessages(conversationId!, search),

    enabled: !!conversationId && search.trim().length > 0,
  });
};

export {
  useAllUsers, useCurrentUser,
  useAllConversations, useCreateConversation,
  useSendMessage, useSocketChat,
  // useJoinAllConversations, 
  useLoadOlder,
  useMessages, useResetUnreadCount,
  useMarkMessagesAsRead, useTypingIndicator,
  useSendVoice, useSendDocument,
  useUpdateUser, useClearChat,
  useOnlineUsers, useSearchConversationMessages
}