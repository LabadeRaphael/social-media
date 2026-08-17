"use client";

import {
  Avatar,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import {
  ArrowLeft,
  MoreVertical,
  Search,
} from "lucide-react";

import { Conversation } from "@/types/conversation";

interface ChatHeaderProps {
  selectedChat: Conversation;
  otherUser: any;
  isMobile: boolean;
  onBack: () => void;
  isOtherUserOnline: boolean;
  onSearch: () => void;
  onMenuOpen: (
    event: React.MouseEvent<HTMLElement>
  ) => void;
}

export default function ChatHeader({
  otherUser,
  isMobile,
  onBack,
  isOtherUserOnline,
  onSearch,
  onMenuOpen,
}: ChatHeaderProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={2}
      >
        {isMobile && (
          <IconButton onClick={onBack}>
            <ArrowLeft />
          </IconButton>
        )}

        <Box position="relative">
          <Avatar>
            {otherUser?.user.userName?.[0]?.toUpperCase()}
          </Avatar>

          <Box
            sx={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: isOtherUserOnline
                ? "green"
                : "grey.400",
              border: "2px solid white",
            }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1">
            {otherUser?.user.userName}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {isOtherUserOnline
              ? "Online"
              : "Offline"}
          </Typography>
        </Box>
      </Box>

      <Box>
        <IconButton onClick={onSearch}>
          <Search />
        </IconButton>

        <IconButton onClick={onMenuOpen}>
          <MoreVertical />
        </IconButton>
      </Box>
    </Box>
  );
}