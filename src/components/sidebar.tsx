
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
  Stack,
  LinearProgress,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  Search,
  MoreVertical,
  MessageCircle,
  Mic,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  useAllUsers,
  useAllConversations,
  useCreateConversation,
  useCurrentUser,
} from "@/react-query/query-hooks";
import {
  useResetUnreadCount,
  useMarkMessagesAsRead,
} from "@/react-query/chat-hook";
// import { useTypingIndicator } from "@/react-query/socket-hook";
import { setSelectedChat } from "@/redux/chats-slice";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";
import { Conversation } from "@/types/conversation";
import { useOnlineUsers } from "@/react-query/socket-hook";
import { ThemeSwitcher } from "./Theme/themeswitcher";
import { getFileType } from "./file-type-formater";
import TypingIndicator from "./typing-indicator";
import { useTheme } from "@mui/material/styles";

interface User {
  id: string;
  userName: string;
}

interface SidebarProps {
  setActiveView: (view: "chat" | "settings") => void;
}

export default function Sidebar({ setActiveView }: SidebarProps) {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const dispatch = useDispatch();

  const selectedChat = useSelector(
    (state: RootState) => state.chatReducer.selectedChat
  );

  const {
    data: currentUser = null,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
  } = useCurrentUser();

  console.log("current", currentUser);

  // debounce
  const debouncedHandler = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  // queries
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useAllUsers(debouncedSearch);

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useAllConversations();
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const isMoreMenuOpen = Boolean(moreMenuAnchorEl);

  const handleMoreMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };

  const handleOpenSettings = () => {
    handleMoreMenuClose();
    setActiveView("settings");
  };
  // search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      debouncedHandler(e.target.value);
    },
    [debouncedHandler]
  );

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  const onlineUsers = useOnlineUsers();

  // errors
  useEffect(() => {
    if (conversationsError) {
      toast.error(
        conversationsError.message || "Failed to load conversations"
      );
    }

    if (usersError && searchTerm) {
      toast.error(usersError.message || "No users found for search");
    }
  }, [conversationsError, usersError, searchTerm]);

  const displayConversations = useMemo(() => {
    let convs: {
      type: "user" | "conversation";
      id: string;
      userName: string;
      lastMessagePreview: any;
      lastMessageTime: string | null;
      unreadCount: number;
      isOnline: boolean;
    }[] = [];

    if (searchTerm && users.length > 0) {
      convs = users.map((user: User) => {
        const conv = (conversations as Conversation[]).find(
          (c) =>
            c.participants.some(
              (p) => p.user.id === currentUser?.id
            ) &&
            c.participants.some((p) => p.user.id === user.id)
        );

        const unreadCount =
          conv?.participants.find(
            (p) => p.user.id === currentUser?.id
          )?.unreadCount || 0;

        const lastMessageText =
          conv?.lastMessage?.text || "Click to start chat";

        const lastMessageTime =
          conv?.lastMessage?.createdAt || null;

        return {
          type: "user",
          id: user.id,
          userName: user.userName,
          lastMessagePreview: lastMessageText,
          lastMessageTime,
          unreadCount,
        };
      });
    } else {
      const formatDuration = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";

        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);

        return `${m}:${s.toString().padStart(2, "0")}`;
      };

      convs = (conversations as Conversation[]).map((conv) => {
        const myParticipant = conv.participants.find(
          (p) => p.user.id === currentUser?.id
        );

        const unreadCount = myParticipant?.unreadCount ?? 0;

        const otherUser = conv.participants
          .map((p) => p.user)
          .find((u) => u.id !== currentUser?.id);

        console.log("The conv", conv);

        // const typingUser = useTypingIndicator(conv.id, currentUser?.id);

        console.log(otherUser);

        const isOnline = otherUser
          ? onlineUsers.has(otherUser?.id)
          : false;

        console.log("The other user", otherUser);
        console.log("isOnline", isOnline);

        const fileType = getFileType(conv?.lastMessage?.fileName);

        return {
          type: "conversation",
          id: conv.id,
          userName: otherUser?.userName ?? "Unknown",
          lastMessage: conv.lastMessage,
          lastMessagePreview:
            conv.lastMessage?.type === "VOICE" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  minWidth: 0,
                }}
              >
                <Mic size={15} strokeWidth={2.2} />

                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Voice message {formatDuration(conv.lastMessage?.duration)}
                </Typography>
              </Box>
            ) : conv.lastMessage?.type === "DOCUMENT" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  minWidth: 0,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileType} {conv.lastMessage?.fileSize !== undefined && formatFileSize(conv.lastMessage.fileSize)}
                </Typography>
              </Box>
            ) : (
              conv.lastMessage?.text || "Click to start chat"
            ),
          lastMessageTime: conv.lastMessage?.createdAt ?? null,
          unreadCount,
          isOnline,
        };
      });
    }

    // Sort by lastMessageTime descending (newest first)
    convs.sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;

      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;

      return timeB - timeA;
    });

    return convs;
  }, [conversations, users, searchTerm, currentUser, onlineUsers]);

  const { mutateAsync } = useCreateConversation();
  const { mutate: resetUnread } = useResetUnreadCount();
  const { mutate: markRead } = useMarkMessagesAsRead();

  const handleSelectChat = useCallback(
    async (userId: string) => {
      console.log("conversations:", conversations);
      console.log("clicked userId:", userId);
      console.log("All conversations", conversations);

      const existingConv = (conversations as Conversation[]).find(
        (conv) =>
          conv.participants.some(
            (p) => p.user.id === currentUser?.id
          ) &&
          conv.participants.some((p) => p.user.id === userId)
      );

      console.log("existingConv", existingConv);

      if (existingConv) {
        setSearchTerm("");
        setDebouncedSearch("");
        dispatch(setSelectedChat(existingConv));
        resetUnread(existingConv.id);
        return;
      }

      try {
        console.log("CurrentUser.sub:", currentUser?.id);
        console.log("Selected userId:", userId);

        const newConv = await mutateAsync({
          participantIds: [currentUser?.id, userId],
        });

        console.log(newConv);

        setSearchTerm("");
        setDebouncedSearch("");

        // 3️⃣ optimistically update Redux
        dispatch(setSelectedChat(newConv.saveConversation));

        toast.success("New conversation started");
      } catch (err: any) {
        toast.error(err.message || "Failed to start conversation");
      }
    },
    [
      dispatch,
      conversations,
      currentUser,
      mutateAsync,
      resetUnread,
    ]
  );

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "30%" },
        minWidth: { md: 300 },
        maxWidth: { md: 430 },
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.paper",
        overflow: "hidden",

        // Firefox
        scrollbarWidth: "thin",

        // Chrome / Edge / Safari
        "& *::-webkit-scrollbar": {
          width: 5,
        },

        "& *::-webkit-scrollbar-thumb": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.15)",
          borderRadius: 10,
        },

        "& *::-webkit-scrollbar-track": {
          background: "transparent",
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 42,
              height: 42,
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.png"
              alt="Nestfinity logo"
              width={42}
              height={42}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              NestFinity
            </Typography>

            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "text.secondary",
                mt: 0.25,
                letterSpacing: "0.01em",
              }}
            >
              Messages
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          sx={{ flexShrink: 0 }}
        >
          <ThemeSwitcher />

          <IconButton
            size="small"
            // aria-label="Chats"
            // onClick={() => setActiveView("chats")}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,194,68,0.10)"
                    : "rgba(255,194,68,0.12)",
              },
            }}
          >
            <MessageCircle size={19} strokeWidth={1.9} />
          </IconButton>

          {/* <IconButton
            size="small"
            aria-label="More options"
            onClick={() => setActiveView("settings")}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,194,68,0.10)"
                    : "rgba(255,194,68,0.12)",
              },
            }}
          >
            <MoreVertical size={19} strokeWidth={1.9} />
          </IconButton> */}
          {/* More options */}
          <IconButton
            size="small"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={isMoreMenuOpen}
            onClick={handleMoreMenuOpen}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              color: isMoreMenuOpen
                ? "primary.main"
                : "text.secondary",
              bgcolor: isMoreMenuOpen
                ? "action.selected"
                : "transparent",
              "&:hover": {
                color: "primary.main",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,194,68,0.10)"
                    : "rgba(255,194,68,0.12)",
              },
            }}
          >
            <MoreVertical size={19} strokeWidth={1.9} />
          </IconButton>
          <Menu
            anchorEl={moreMenuAnchorEl}
            open={isMoreMenuOpen}
            onClose={handleMoreMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 8px 28px rgba(0,0,0,0.35)"
                      : "0 8px 28px rgba(50,30,10,0.10)",
                },
              },
            }}
          >
            <MenuItem onClick={handleOpenSettings}>
              <Settings size={18} style={{ marginRight: 12 }} />
              Settings
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* ================= SEARCH ================= */}
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
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
                  <CircularProgress
                    size={16}
                    thickness={4}
                    sx={{ color: "primary.main" }}
                  />
                ) : (
                  <Search
                    size={18}
                    strokeWidth={2}
                    color={
                      usersError && searchTerm
                        ? theme.palette.error.main
                        : theme.palette.text.secondary
                    }
                  />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              height: 42,
              borderRadius: 2.5,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.035)"
                  : "rgba(0,0,0,0.025)",
              transition: "all 0.2s ease",
            },

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
            },

            "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,194,68,0.35)"
                  : "rgba(255,194,68,0.55)",
            },

            "& .MuiInputBase-root.Mui-focused": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,194,68,0.045)"
                  : "rgba(255,194,68,0.035)",
            },

            "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "primary.main",
              borderWidth: 1,
            },

            "& input": {
              fontSize: "0.84rem",
            },

            "& input::placeholder": {
              color: "text.secondary",
              opacity: 0.85,
            },
          }}
        />
      </Box>

      <Divider />

      {/* ================= CHATS ================= */}
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          bgcolor: "background.paper",
          py: 0.75,
          px: 0.5,
        }}
      >
        {isLoadingConversations ||
          (isLoadingUsers && searchTerm) ? (
          <Box sx={{ px: 1.25, pt: 0.5 }}>
            <LinearProgress
              sx={{
                height: 3,
                borderRadius: 10,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,194,68,0.12)"
                    : "rgba(255,194,68,0.18)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "primary.main",
                  borderRadius: 10,
                },
              }}
            />
          </Box>
        ) : displayConversations.length === 0 ? (
          <Box
            sx={{
              px: 3,
              py: 8,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                mx: "auto",
                mb: 1.5,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,194,68,0.08)"
                    : "rgba(255,194,68,0.10)",
                color: "primary.main",
              }}
            >
              <MessageCircle size={23} strokeWidth={1.8} />
            </Box>

            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {searchTerm
                ? "No users found"
                : "No conversations yet"}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.76rem",
                lineHeight: 1.5,
                color: "text.secondary",
              }}
            >
              {searchTerm
                ? `Nothing matched "${searchTerm}"`
                : "Start a conversation to see it here."}
            </Typography>
          </Box>
        ) : (
          displayConversations.map((conv) => {
            const { isOnline } = conv;
            const isSelected = selectedChat?.id === conv.id;

            return (
              <ListItem
                key={conv.id}
                disablePadding
                sx={{
                  mb: 0.35,
                }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    if (conv.type === "user") {
                      handleSelectChat(conv.id);
                    } else {
                      const existingConv = conversations.find(
                        (c) => c.id === conv.id
                      );

                      if (existingConv) {
                        dispatch(setSelectedChat(existingConv));
                        setActiveView("chat");
                        markRead(existingConv.id);
                        resetUnread(existingConv.id);
                      }
                    }
                  }}
                  sx={{
                    position: "relative",
                    minHeight: 70,
                    px: 1.25,
                    py: 1,
                    borderRadius: 2,
                    alignItems: "center",
                    transition:
                      "background-color 0.18s ease, transform 0.18s ease",

                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.045)"
                          : "rgba(0,0,0,0.035)",
                    },

                    "&.Mui-selected": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,194,68,0.095)"
                          : "rgba(255,194,68,0.10)",
                    },

                    "&.Mui-selected:hover": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,194,68,0.13)"
                          : "rgba(255,194,68,0.14)",
                    },

                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      width: 3,
                      height: "60%",
                      borderRadius: "0 4px 4px 0",
                      bgcolor: "primary.main",
                      opacity: isSelected ? 1 : 0,
                      transition: "opacity 0.18s ease",
                    },
                  }}
                >
                  {/* ================= AVATAR ================= */}
                  <ListItemAvatar
                    sx={{
                      minWidth: 52,
                      mr: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 42,
                        height: 42,
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
                          boxShadow: isSelected
                            ? `0 0 0 2px ${theme.palette.mode === "dark"
                              ? "rgba(255,194,68,0.18)"
                              : "rgba(255,194,68,0.22)"
                            }`
                            : "none",
                          transition: "box-shadow 0.18s ease",
                        }}
                      >
                        {conv.userName[0]?.toUpperCase()}
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
                          bgcolor: isOnline
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
                  </ListItemAvatar>

                  {/* ================= CONTENT ================= */}
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            minWidth: 0,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.88rem",
                            fontWeight: isSelected ? 650 : 550,
                            color: isSelected
                              ? "primary.main"
                              : "text.primary",
                            lineHeight: 1.3,
                          }}
                        >
                          {conv.userName
                            ? conv.userName.at(0)?.toUpperCase() +
                            conv.userName.slice(1).toLowerCase()
                            : ""}
                        </Typography>

                        <Typography
                          component="span"
                          sx={{
                            flexShrink: 0,
                            fontSize: "0.68rem",
                            lineHeight: 1,
                            color:
                              conv.unreadCount > 0
                                ? "primary.main"
                                : "text.secondary",
                            fontWeight:
                              conv.unreadCount > 0 ? 600 : 400,
                          }}
                        >
                          {conv.lastMessageTime
                            ? new Date(
                              conv.lastMessageTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "--:--"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          mt: 0.45,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            color: "text.secondary",
                            fontSize: "0.75rem",
                            lineHeight: 1.35,

                            "& > *": {
                              maxWidth: "100%",
                            },
                          }}
                        >
                          <TypingIndicator
                            conversationId={conv.id}
                            currentUserId={currentUser?.id}
                            fallback={conv.lastMessagePreview}
                          />
                        </Box>

                        {/* Unread badge */}
                        {conv.unreadCount > 0 && (
                          <Box
                            sx={{
                              flexShrink: 0,
                              minWidth: 21,
                              height: 21,
                              px: 0.65,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "primary.main",
                              color:
                                theme.palette.mode === "dark"
                                  ? "background.default"
                                  : "common.white",
                              fontSize: "0.66rem",
                              fontWeight: 700,
                              lineHeight: 1,
                              boxShadow:
                                "0 2px 6px rgba(0,0,0,0.12)",
                            }}
                          >
                            {conv.unreadCount > 99
                              ? "99+"
                              : conv.unreadCount}
                          </Box>
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      component: "div",
                    }}
                    secondaryTypographyProps={{
                      component: "div",
                    }}
                    sx={{
                      minWidth: 0,
                      flex: 1,
                      ml: 0.75,
                      mr: 0.25,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>

      {/* ================= PROFILE FOOTER ================= */}
      {currentUser && (
        <Box
          onClick={() => setActiveView("settings")}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 1.35,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.018)"
                : "rgba(0,0,0,0.012)",
            cursor: "pointer",
            transition: "background-color 0.18s ease",

            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,194,68,0.055)"
                  : "rgba(255,194,68,0.065)",
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
          >
            <Box
              sx={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Avatar
                src={currentUser?.avatarUrl}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "primary.main",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {currentUser?.userName?.[0]?.toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  position: "absolute",
                  right: -1,
                  bottom: -1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.userName
                  ? currentUser.userName.at(0)?.toUpperCase() +
                  currentUser.userName.slice(1).toLowerCase()
                  : "Unknown User"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: "0.69rem",
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.email}
              </Typography>
            </Box>

            <MoreVertical
              size={17}
              strokeWidth={1.8}
              color={theme.palette.text.secondary}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
}

