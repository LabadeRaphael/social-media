"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, getAllUsers, getAllConversations, createNewConversations, getMessages, sendMessage, resetUnreadCount, markMessagesAsRead } from "@/api/user";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "@/redux/users-slice";
import { Message } from "@/types/messages";
import { setSelectedChat } from "@/redux/chats-slice";
import { getSocket } from "@/lib/socket";
import { useEffect, useState } from "react";
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
        mutationFn: (messageDetails: Message) => {
            console.log("mutationFn data:", messageDetails);
            return sendMessage(messageDetails);
        },
        onSuccess: (newMessage, variables) => {

            console.log("onSuccess data:", newMessage);

            queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
        },
    });
};
const useSocketChat = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    if (conversationId) {
      // ✅ join conversation room
      socket.emit("join_conversation", conversationId);
      socket.emit("mark_as_read", conversationId);
    }

    // ✅ listen for incoming messages
    socket.on("receive_message", (message) => {
      console.log("📩 New message received:", message);

      // update cache so React Query shows new message instantly
    //   queryClient.setQueryData(["messages", message.conversationId], (old: any) => {
    //     return old ? [...old, message] : [message];
    //   });

      // also refresh conversation list (to update lastMessage/unread)
      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });
      socket.on("messages_read", ({ conversationId, userId }) => {
      console.log("✅ Messages read by:", userId);
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });

    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
    };
  }, [conversationId, queryClient]);
};

const useMessages = (conversationId: string | null) => {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId) throw new Error("No conversationId"); // no chat selected yet
            return getMessages(conversationId);
        },
        enabled: !!conversationId, // only run when a chat is selected
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



export { useAllUsers, useCurrentUser, useAllConversations, useCreateConversation, useSendMessage, useSocketChat,useMessages, useResetUnreadCount, useMarkMessagesAsRead,useTypingIndicator }