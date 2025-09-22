"use client";

import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
} from "@mui/material";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
} from "lucide-react";
import { useTheme } from "@mui/material/styles";
import MessageBubble from "./message-bubble";
import { useState, useEffect } from "react";

interface ChatWindowProps {
  selectedUser: string | null;
  onBack: () => void;
  isMobile: boolean;
}

export default function ChatWindow({ 
  selectedUser, 
  onBack, 
  isMobile 
}: ChatWindowProps) {
  const theme = useTheme();
  
  // Initialize messages with default values, update when user is selected
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello 👋", isSent: false },
    { id: 2, text: "Hi! 😄", isSent: true }, // Default message without user name
  ]);

  // Update messages when selectedUser changes
  useEffect(() => {
    if (selectedUser && messages.length === 2) {
      // Only update if we haven't customized the message yet
      setMessages(prev => [
        prev[0],
        { 
          ...prev[1], 
          text: `Hi ${selectedUser}! 😄` 
        }
      ]);
    }
  }, [selectedUser]);

  const handleSendMessage = (text: string) => {
    if (text.trim() && selectedUser) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        isSent: true
      }]);
    }
  };

  // Show loading state if no user selected
  if (!selectedUser) {
    return (
      <Box 
        flex={1} 
        display="flex" 
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={2}
        bgcolor="background.default"
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box flex={1} display="flex" flexDirection="column">
      {/* Chat Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        bgcolor="background.paper"
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Box display="flex" alignItems="center" gap={2}>
          {isMobile && (
            <IconButton onClick={onBack}>
              <ArrowLeft />
            </IconButton>
          )}
          <Avatar>{selectedUser[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">{selectedUser}</Typography>
            <Typography variant="caption" color="text.secondary">
              Online
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton>
            <Search />
          </IconButton>
          <IconButton>
            <MoreVertical />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.text}
            isSent={message.isSent}
          />
        ))}
      </Box>

      {/* Chat Input */}
      <Box
        display="flex"
        alignItems="center"
        p={1}
        borderTop="1px solid"
        borderColor="divider"
        bgcolor="background.paper"
      >
        <IconButton>
          <Smile />
        </IconButton>
        <IconButton>
          <Paperclip />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Type a message"
          variant="outlined"
          size="small"
          sx={{ mx: 1 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLTextAreaElement;
              handleSendMessage(target.value);
              target.value = '';
            }
          }}
        />
        <IconButton color="primary">
          <Mic />
        </IconButton>
      </Box>
    </Box>
  );
}