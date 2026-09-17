"use client";

import {
  Avatar,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();

  const userName = otherUser?.user?.userName ?? "";

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : "User";

  const initial = userName.charAt(0).toUpperCase();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={2}
      py={1.5}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Left side */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        minWidth={0}
      >
        {/* Back button */}
        {isMobile && (
          <IconButton
            onClick={onBack}
            size="small"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </IconButton>
        )}

        {/* Avatar + online indicator */}
        <Box
          sx={{
            position: "relative",
            width: 42,
            height: 42,
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "primary.main",
              color:
                theme.palette.mode === "dark"
                  ? "background.default"
                  : "common.white",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {initial}
          </Avatar>

          {/* Online indicator */}
          <Box
            sx={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 11,
              height: 11,
              borderRadius: "50%",
              bgcolor: isOtherUserOnline
                ? theme.palette.primary.main
                : theme.palette.mode === "dark"
                  ? "grey.700"
                  : "grey.400",
              border: "2px solid",
              borderColor: "background.paper",
              boxSizing: "border-box",
              transition: "background-color 0.2s ease",
            }}
          />
        </Box>

        {/* User information */}
        <Box minWidth={0}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
          >
            {displayName}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
          >
            {isOtherUserOnline ? "Online" : "Offline"}
          </Typography>
        </Box>
      </Box>

      {/* Right side */}
      <Box
        display="flex"
        alignItems="center"
      >
        <IconButton
          onClick={onSearch}
          aria-label="Search messages"
        >
          <Search size={20} />
        </IconButton>

        <IconButton
          onClick={onMenuOpen}
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </IconButton>
      </Box>
    </Box>
  );
}

