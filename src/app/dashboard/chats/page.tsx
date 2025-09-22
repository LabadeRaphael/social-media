"use client";

import { Box, useMediaQuery, Theme, useTheme } from "@mui/material";
import Sidebar from "@/components/sidebar";
import ChatWindow from "@/components/chat-window";
import { useState } from "react";

export default function ChatPage() {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const users = [];

  const handleSelectUser = (user: string) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <Box display="flex" height="100vh" bgcolor="background.default">
      {/* Sidebar - Show on desktop or when no user selected on mobile */}
      {(!isMobile || (isMobile && !selectedUser)) && (
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          users={users}
        />
      )}

      {/* Chat Window - Show on desktop or when user selected on mobile */}
      {(!isMobile || (isMobile && selectedUser)) && (
        <ChatWindow
          selectedUser={selectedUser}
          onBack={handleBack}
          isMobile={isMobile}
        />
      )}
    </Box>
  );
}