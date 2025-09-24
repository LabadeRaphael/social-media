"use client";

import { Box, useMediaQuery, Theme, useTheme } from "@mui/material";
import Sidebar from "@/components/sidebar";
import ChatWindow from "@/components/chat-window";
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { useAllConversations, useCurrentUser } from "@/react-query/query-hooks";

export default function ChatPage() {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const users = ["Alice", "Bob", "Charlie", "David"];
  
  
  // if (isLoading) return <p>Loading...</p>;

  // return <h1>Welcome {user.name}</h1>;
  // const getCurrentUserConversations = () => {
  //   const { data: conversations, isLoading } = useAllConversations(currentUser?.id);

  //   if (isLoading) return <p>Loading...</p>;

  //   return (
  //     <ul>
  //       {conversations?.map((c) => (
  //         <li key={c.id}>{c.title}</li>
  //       ))}
  //     </ul>
  //   );

  // }
  //  }
  // useEffect(() => {
  //   getCurrentUserConversations
  // }, [])
  
  const fetchUsers = async () => {
    try {
      const response = await api.get("/new-conversations");

      setSearchedUsers(response.data);
    } catch (err: any) {
      const message = err.response?.status === 401
        ? "Please log in to search users"
        : err.response?.status >= 500
          ? "Server error. Please try again later"
          : "Failed to search users";

      setError(message);
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchUsers()
  }, [])


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