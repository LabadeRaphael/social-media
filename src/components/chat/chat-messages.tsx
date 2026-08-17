"use client";

import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  ChevronUp,
} from "lucide-react";

import MessageBubble from "../message-bubble";

import { Message } from "@/types/messages";

interface ChatMessagesProps {
  messages: Message[];

  isLoading: boolean;
  isError: boolean;

  hasOlderMessages: boolean;

  onLoadOlder: () => void;

  currentUserId?: string;
  selectedChatId?: string;

  highlightText: (
    text: string,
    keyword: string
  ) => React.ReactNode;

  searchKeyword: string;

  matchedMessageIds: Set<string>;
}

export default function ChatMessages({
  messages,
  isLoading,
  isError,
  hasOlderMessages,
  onLoadOlder,
  currentUserId,
  selectedChatId,
  highlightText,
  searchKeyword,
  matchedMessageIds,
}: ChatMessagesProps) {
  return (
    <Box
      flex={1}
      p={2}
      overflow="auto"
      bgcolor="background.default"
    >
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          p={2}
        >
          <CircularProgress size={24} />
        </Box>
      ) : isError ? (
        <Typography color="error">
          Failed to load messages
        </Typography>
      ) : messages.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column"
          color="text.secondary"
        >
          <Typography variant="body2">
            No messages yet
          </Typography>

          <Typography variant="caption">
            Start the conversation 👋
          </Typography>
        </Box>
      ) : (
        <>
          {hasOlderMessages && (
            <Box
              display="flex"
              justifyContent="center"
              mb={2}
            >
              <Button
                variant="outlined"
                startIcon={
                  <ChevronUp size={18} />
                }
                onClick={onLoadOlder}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                }}
              >
                Older Messages
              </Button>
            </Box>
          )}

          {messages.map(
            (message: Message) => (
              <Box
                key={message.id}
                id={`message-${message.id}`}
              >
                <MessageBubble
                  text={message.text}
                  timeStamp={
                    message.createdAt
                  }
                  type={message.type}
                  mediaUrl={message.mediaUrl}
                  fileName={message.fileName}
                  fileSize={message.fileSize}
                  isRead={message.isRead}
                  isSender={
                    message.sender.id ===
                    currentUserId
                  }
                  selectedId={
                    selectedChatId
                  }
                  currentUserId={
                    currentUserId
                  }
                  highlightText={
                    highlightText
                  }
                  searchKeyword={
                    searchKeyword
                  }
                  highlight={matchedMessageIds.has(
                    message.id
                  )}
                />
              </Box>
            )
          )}
        </>
      )}
    </Box>
  );
}