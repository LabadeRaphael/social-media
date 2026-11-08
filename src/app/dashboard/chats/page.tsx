"use client";

import { Box, useMediaQuery } from "@mui/material";
import Sidebar from "@/components/sidebar";
import ChatWindow from "@/components/chat/chat-window";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "@/redux/chats-slice";
import { useAllConversations } from "@/react-query/query-hooks";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const dispatch = useDispatch();
  const selectedChat = useSelector((state: RootState) => state.chatReducer.selectedChat);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  // const { data: conversations = [], isLoading, error } = useAllConversations();
  const { error } = useAllConversations();
  // const [activeView, setActiveView] = useState<'chat' | 'settings'>('chat');
  const searchParams = useSearchParams();

  const googleDeleteErrors = [
    "google_session_invalid",
    "google_delete_verification_failed",
    "google_access_denied",
    "google_account_deleted",
    "google_auth_failed",
  ];

  const isGoogleDeleteError = googleDeleteErrors.includes(
    searchParams.get("error") ?? ""
  );
  const [activeView, setActiveView] = useState<"chat" | "settings">(
    isGoogleDeleteError ? "settings" : "chat"
  );
  // Display error toast if conversation fetch fails
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load conversations");
    }
  }, [error]);

  // Handle back navigation
  const handleBack = () => {
    dispatch(setSelectedChat(null));
  };

  return (
    <Box display="flex" height="100vh" bgcolor="background.default">
      {/* Sidebar - Show on desktop or when no user selected on mobile */}
      {(!isMobile || (isMobile && !selectedChat && activeView === "chat")) && <Sidebar setActiveView={setActiveView}
      />}

      {/* Chat Window - Show on desktop or when user selected on mobile */}
      {(!isMobile || (isMobile && selectedChat) || activeView === "settings") && (
        <ChatWindow selectedChat={selectedChat} onBack={handleBack} isMobile={isMobile} setActiveView={setActiveView} activeView={activeView} />
      )}
    </Box>
  );
}