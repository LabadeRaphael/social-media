"use client";

import { Box, useParams, useMediaQuery } from "@mui/material";
import ChatWindow from "@/components/chat-window";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "@/redux/chats-slice";
import { useAllConversations, useConversationByUserId, useJoinAllConversations } from "@/react-query/query-hooks";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";

export default function SpecificChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const selectedChat = useSelector((state: RootState) => state.chatReducer.selectedChat);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { data: conversation, isLoading, error } = useAllConversations();
  useJoinAllConversations()

// useEffect(() => {
//   if (userId && conversation) {
//     const existingConv = conversation.find((c: any) =>
//       c.participants.some((p: any) => p.user.id === userId)
//     );

//     if (existingConv) {
//       dispatch(setSelectedChat(existingConv));
//     }
//   }

//   return () => {
//     dispatch(setSelectedChat(null));
//   };
// }, [userId, conversation, dispatch]);

  // Display error toast if conversation fetch fails
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load conversation");
    }
  }, [error]);

  // Handle back navigation
  const handleBack = () => {
    dispatch(setSelectedChat(null));
  };

  if (!userId || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <p>Loading chat...</p>
      </Box>
    );
  }

  if (error || !conversation) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <p>No conversation found</p>
      </Box>
    );
  }

  return (
    <ChatWindow
      selectedChat={selectedChat}
      onBack={handleBack}
      isMobile={isMobile}
    />
  );
}