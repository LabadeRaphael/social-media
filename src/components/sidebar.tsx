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
import { useAllUsers, useAllConversations, useCreateConversation, useCurrentUser, useResetUnreadCount, useMarkMessagesAsRead } from "@/react-query/query-hooks";
import { setSelectedChat } from "@/redux/chats-slice";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";
import { Conversation } from "@/types/conversation";
interface User {
  id: string;
  userName: string;
}
export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const dispatch = useDispatch();
  const selectedChat = useSelector(
    (state: RootState) => state.chatReducer.selectedChat
  );
  console.log(selectedChat);
  console.log("no see see it", selectedChat);
  if (selectedChat) {
    console.log("the selected chat we he see it", selectedChat);
  }

  // const currentUser = useSelector(
  //   (state: RootState) => state.userReducer.currentUser
  // );
  // console.log(currentUser);
  const { data: currentUser = null, isLoading: isLoadingCurrentUser, error: currentUserError } = useCurrentUser()


  // debounce
  const debouncedHandler = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  // queries
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } =
    useAllUsers(debouncedSearch);
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useAllConversations();

  // search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      debouncedHandler(e.target.value);
    },
    [debouncedHandler]
  );

  // errors
  useEffect(() => {
    if (conversationsError) {
      toast.error(conversationsError.message || "Failed to load conversations");
    }
    if (usersError && searchTerm) {
      toast.error(usersError.message || "No users found for search");
    }
  }, [conversationsError, usersError, searchTerm]);

  // format conversations
  // const displayConversations = useMemo(() => {

  //   if (searchTerm && users.length > 0) {
  //     return users.map((user: User) => {
  //       const conv = (conversations as Conversation[]).find(
  //         c =>
  //           c.participants.some(p => p.user.id === currentUser?.id) &&
  //           c.participants.some(p => p.user.id === user.id)
  //       );

  //       const unreadCount = conv?.participants.find(p => p.user.id === currentUser?.id)?.unreadCount || 0;
  //       const lastMessageText = conv?.lastMessage?.text || "Click to start chat";
  //       const lastMessageTime = conv?.lastMessage?.createdAt || null;

  //       return {
  //         type: "user",
  //         id: user.id,
  //         userName: user.userName,
  //         lastMessageText,
  //         lastMessageTime,
  //         unreadCount
  //       };
  //     });
  //   }


  //   return (conversations as Conversation[]).map((conv) => {
  //     // const participant = conv.participants.find(p => p.user.id === currentUser?.id);
  //     // console.log(participant);
  //     const myParticipant = conv.participants.find(p => p.user.id === currentUser?.id);
  //     // const otherParticipant = conv.participants.find(p => p.user.id !== currentUser?.id);

  //     const unreadCount = myParticipant?.unreadCount ?? 0;
  //     console.log(unreadCount);

  //     const otherUser = conv.participants
  //       .map((p) => p.user)
  //       .find((u) => u.id !== currentUser?.id);
  //     console.log("oheruser", otherUser);


  //     return {
  //       type: "conversation",
  //       id: conv.id,
  //       userName: otherUser?.userName ?? "Unknown",
  //       lastMessageText: conv.lastMessage?.text ?? "Click to start chat",
  //       lastMessageTime: conv.lastMessage?.createdAt ?? null,
  //       unreadCount,
  //     };
  //   });
  // }, [conversations, users, searchTerm, currentUser]);
const displayConversations = useMemo(() => {
  let convs: {
    type: "user" | "conversation";
    id: string;
    userName: string;
    lastMessageText: string;
    lastMessageTime: string | null;
    unreadCount: number;
  }[] = [];

  if (searchTerm && users.length > 0) {
    convs = users.map((user: User) => {
      const conv = (conversations as Conversation[]).find(
        c =>
          c.participants.some(p => p.user.id === currentUser?.id) &&
          c.participants.some(p => p.user.id === user.id)
      );

      const unreadCount =
        conv?.participants.find(p => p.user.id === currentUser?.id)?.unreadCount || 0;
      const lastMessageText = conv?.lastMessage?.text || "Click to start chat";
      const lastMessageTime = conv?.lastMessage?.createdAt || null;

      return {
        type: "user",
        id: user.id,
        userName: user.userName,
        lastMessageText,
        lastMessageTime,
        unreadCount,
      };
    });
  } else {
    convs = (conversations as Conversation[]).map(conv => {
      const myParticipant = conv.participants.find(p => p.user.id === currentUser?.id);
      const unreadCount = myParticipant?.unreadCount ?? 0;

      const otherUser = conv.participants
        .map(p => p.user)
        .find(u => u.id !== currentUser?.id);

      return {
        type: "conversation",
        id: conv.id,
        userName: otherUser?.userName ?? "Unknown",
        lastMessageText: conv.lastMessage?.text ?? "Click to start chat",
        lastMessageTime: conv.lastMessage?.createdAt ?? null,
        unreadCount,
      };
    });
  }

  // Sort by lastMessageTime descending (newest first)
  convs.sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return timeB - timeA;
  });

  return convs;
}, [conversations, users, searchTerm, currentUser]);

  // selection
  const { mutateAsync } = useCreateConversation()
  const { mutate: resetUnread } = useResetUnreadCount();
  const { mutate: markRead } = useMarkMessagesAsRead();
  const handleSelectChat = useCallback(
    async (userId: string) => {
      console.log("conversations:", conversations);
      console.log("clicked userId:", userId);
      console.log("All conversations", conversations);

      const existingConv = (conversations as Conversation[]).find(
        (conv) =>
          conv.participants.some(p => p.user.id === currentUser?.id) &&
          conv.participants.some(p => p.user.id === userId)
      )

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
      // dispatch(setSelectedChat(userId));
    },
    [dispatch, conversations, currentUser, mutateAsync, resetUnread]
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
      {/* Header */}
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
                  <Search
                    size={18}
                    color={usersError && searchTerm ? "red" : "inherit"}
                  />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
        />
      </Box>

      <Divider />

      {/* Chats */}
      <List sx={{ flex: 1, overflowY: "auto", bgcolor: "background.paper" }}>
        {isLoadingConversations || (isLoadingUsers && searchTerm) ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={100}
          >
            <CircularProgress size={24} />
          </Box>
        ) : displayConversations.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary" variant="body2">
              {searchTerm
                ? `No users found for "${searchTerm}"`
                : "No conversations available"}
            </Typography>
          </Box>
        ) : (
          displayConversations.map((conv) => (
            <ListItem key={conv.id} disablePadding>
              <ListItemButton
                selected={selectedChat?.id === conv.id}
                onClick={() => {
                  if (conv.type === "user") {
                    handleSelectChat(conv.id); // search: pass userId
                  } else {
                    const existingConv = conversations.find(c => c.id === conv.id);
                    if (existingConv) {
                      dispatch(setSelectedChat(existingConv));
                      markRead(existingConv.id)
                      resetUnread(existingConv.id); // ✅ Reset unread count immediately
                    }
                  }
                }}
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
                    {conv.userName[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={conv.userName}
                  secondary={conv.lastMessageText}
                  primaryTypographyProps={{
                    fontWeight: selectedChat === conv.id ? 600 : 400,
                    color:
                      selectedChat === conv.id
                        ? "primary.main"
                        : "text.primary",
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
                  {conv.lastMessageTime
                    ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "--:--"}


                </Typography>
                {conv.unreadCount > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      borderRadius: "50%",
                      fontSize: "0.7rem",
                      minWidth: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ml: 1,
                    }}
                  >
                    {conv.unreadCount}
                  </Box>
                )}

              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}
