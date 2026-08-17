// import { useEffect, useState } from "react";
// import { getSocket } from "@/lib/socket";

// export const useOnlineUsers = () => {
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
//  console.log("Online users updated:", Array.from(onlineUsers));
//   useEffect(() => {
//     const socket = getSocket();

//     const handleUserOnline = (data: { userId: string }) => {
//     console.log("data", data);
    
//       setOnlineUsers(prev => new Set(prev).add(data.userId));
//     };

//     const handleUserOffline = (data: { userId: string }) => {
//       setOnlineUsers(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(data.userId);
//         return newSet;
//       });
//     };
//      const handleInitialList = (userIds: string[]) => {
//       setOnlineUsers(new Set(userIds));
//     };
//     socket.on("user_online", handleUserOnline);
//     socket.on("user_offline", handleUserOffline);
//     socket.on("online_users", handleInitialList);

//     return () => {
//       socket.off("user_online", handleUserOnline);
//       socket.off("user_offline", handleUserOffline);
//       socket.off("online_users", handleInitialList);
//     };
//   }, []);

//   return onlineUsers;
// };


// import { useEffect, useState } from "react";
// import { getSocket } from "@/lib/socket";

// export const useOnlineUsers = () => {
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return
//     const interval = setInterval(() => {
//     socket.emit('heartbeat');
//     console.log("see heartbeat");
    
//   }, 10000); // every 10 seconds

//     const handleOnlineUsers = (userIds: string[]) => {
//       console.log("Updated online users:", userIds);
//       setOnlineUsers(new Set(userIds));
//     };

//     socket.on("online_users", handleOnlineUsers);

//     return () => {
//       clearInterval(interval)
//       socket.off("online_users", handleOnlineUsers);
//     };
//   }, []);

//   return onlineUsers;
// };
"use client";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useEffect,
  useState,
} from "react";

import { getSocket } from "@/lib/socket";
const useSocketChat = (
  conversationId?: string
) => {
  const queryClient =
    useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    if (conversationId) {

      socket.emit(
        "mark_as_read",
        conversationId
      );
    }

    const handleReceiveMessage = (
      message: any
    ) => {
      queryClient.setQueryData(
        [
          "messages",
          message.conversationId,
        ],
        (old: any) => {
          if (!old) {
            return {
              messages: [message],
              hasMore: false,
            };
          }

          if (
            old.messages.some(
              (m: any) =>
                m.id === message.id
            )
          ) {
            return old;
          }

          return {
            ...old,
            messages: [
              ...old.messages,
              message,
            ],
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: [
          "current-user-conv",
        ],
      });
    };

    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    console.log(
      "🔥 SOCKET MESSAGES"
    );

    return () => {
      socket.off(
        "receive_message",
        handleReceiveMessage
      );
    };
  }, [
    conversationId,
    queryClient,
  ]);
};

const useTypingIndicator = (
  conversationId: string,
  currentUserId: string
) => {
  const [
    typingUser,
    setTypingUser,
  ] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    if (!conversationId) return;

    const handleUserTyping = (data: {
      conversationId: string;
      senderId: string;
    }) => {
      console.log(
        "🟢 Received user_typing:",
        data
      );

      if (
        data.conversationId ===
          conversationId &&
        data.senderId !==
          currentUserId
      ) {
        setTypingUser(
          data.senderId
        );
      }
    };

    const handleUserStopTyping = (
      data: {
        conversationId: string;
        senderId: string;
      }
    ) => {
      if (
        data.conversationId ===
          conversationId &&
        data.senderId !==
          currentUserId
      ) {
        setTypingUser(null);
      }
    };

    socket.on(
      "user_typing",
      handleUserTyping
    );

    socket.on(
      "user_stop_typing",
      handleUserStopTyping
    );

    return () => {
      socket.off(
        "user_typing",
        handleUserTyping
      );

      socket.off(
        "user_stop_typing",
        handleUserStopTyping
      );
    };
  }, [
    conversationId,
    currentUserId,
  ]);

  return typingUser;
};
const useOnlineUsers = () => {
  const [
    onlineUsers,
    setOnlineUsers,
  ] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const interval =
      setInterval(() => {
        socket.emit("heartbeat");
      }, 10000);

    const handleOnlineUsers = (
      userIds: string[]
    ) => {
      console.log(
        "Updated online users:",
        userIds
      );

      setOnlineUsers(
        new Set(userIds)
      );
    };

    socket.on(
      "online_users",
      handleOnlineUsers
    );

    return () => {
      clearInterval(interval);

      socket.off(
        "online_users",
        handleOnlineUsers
      );
    };
  }, []);

  return onlineUsers;
};

export {
  useSocketChat,
  useTypingIndicator,
  useOnlineUsers,
};

