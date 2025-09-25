"use client";

import {
  Box,
  Typography,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import { Search, MoreVertical, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { useAllUsers, useAllConversations } from "@/react-query/query-hooks";
import { setSelectedUser } from "@/redux/chats-slice";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";

interface User {
  sub: string;
  userName: string;
}

interface Conversation {
  id: string;
  userName: string;
  lastMessageTime?: string;
}

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const dispatch = useDispatch();
  const selectedUser = useSelector((state: RootState) => state.chatReducer.selectedUser);
  const currentUser = useSelector((state: RootState) => state.userReducer.currentUser);

  // Debounced search handler
  const debouncedHandler = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  // Fetch conversations and users
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useAllUsers(debouncedSearch);
  const { data: conversations = [], isLoading: isLoadingConversations, error: conversationsError } = useAllConversations(currentUser?.id);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      debouncedHandler(e.target.value);
    },
    [debouncedHandler]
  );

  // Display toast for errors
  useEffect(() => {
    if (conversationsError) {
      toast.error(conversationsError.message || "Failed to load conversations");
    }
    if (usersError && searchTerm) {
      toast.error(usersError.message || "No users found for search");
    }
  }, [conversationsError, usersError, searchTerm]);

  // Memoize display conversations
  const displayConversations = useMemo(
    () => (searchTerm && users.length > 0 ? users.map((user: User) => user.userName) : conversations.map((conv: Conversation) => conv.userName)),
    [conversations, users, searchTerm]
  );

  // Handle user selection
  const handleSelectUser = useCallback(
    (userName: string) => {
      dispatch(setSelectedUser(userName));
    },
    [dispatch]
  );

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "30%" },
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/logo.png"
            alt="Nestfinity logo"
            width={45}
            height={45}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <Typography variant="h6" fontWeight={600}>
            Nestfinity
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" aria-label="Messages">
            <MessageCircle size={20} />
          </IconButton>
          <IconButton size="small" aria-label="More options">
            <MoreVertical size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Search */}
      <Box p={1.5}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isLoadingUsers ? (
                  <CircularProgress size={16} />
                ) : (
                  <Search size={18} color={usersError && searchTerm ? "red" : "inherit"} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <List sx={{ flex: 1, overflowY: "auto", bgcolor: "background.paper" }}>
        {(isLoadingConversations || (isLoadingUsers && searchTerm)) ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress size={24} />
          </Box>
        ) : conversationsError && !searchTerm ? (
          <Box p={2} textAlign="center">
            <Typography color="error" variant="body2">
              {conversationsError.message || "Failed to load conversations"}
            </Typography>
          </Box>
        ) : usersError && searchTerm ? (
          <Box p={2} textAlign="center">
            <Typography color="error" variant="body2">
              {usersError.message || `No users found for "${searchTerm}"`}
            </Typography>
          </Box>
        ) : displayConversations.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary" variant="body2">
              {searchTerm ? `No users found for "${searchTerm}"` : "No conversations available"}
            </Typography>
          </Box>
        ) : (
          displayConversations.map((userName: string) => {
            const conversation = conversations.find((c: Conversation) => c.userName === userName);
            return (
              <ListItem key={conversation?.id || userName} disablePadding>
                <ListItemButton
                  selected={selectedUser === userName}
                  onClick={() => handleSelectUser(userName)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    "&.Mui-selected": {
                      backgroundColor: "action.selected",
                    },
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 56 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "primary.main",
                        fontSize: "1rem",
                      }}
                    >
                      {userName[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={userName}
                    secondary="Click to start chat"
                    primaryTypographyProps={{
                      fontWeight: selectedUser === userName ? 600 : 400,
                      color: selectedUser === userName ? "primary.main" : "text.primary",
                    }}
                    secondaryTypographyProps={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                    sx={{ flex: 1, ml: 1 }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                  >
                    {conversation?.lastMessageTime
                      ? new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>
    </Box>
  );
}