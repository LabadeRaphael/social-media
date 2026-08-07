"use client";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Tooltip,
  CircularProgress,
  Button,
  LinearProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Smile,
  Square,
  Paperclip,
  Mic,
  ChevronLeft,
  Check,
  ChevronUp,
  X

} from "lucide-react";
import { Menu, MenuItem } from "@mui/material";
import { Ban, Trash2, MessageCircleX } from "lucide-react";
import Settings from "@/components/settings"
import MessageBubble from "./message-bubble";
import React, { useEffect, useRef, useState } from "react";
import Collapse from "@mui/material/Collapse";
import {
  useClearChat,
  useCurrentUser,
  useLoadOlder,
  useMessages,
  useSendDocument,
} from "@/react-query/query-hooks";
import { Conversation } from "@/types/conversation";
import { useSocketChat } from "@/react-query/query-hooks";
import { getSocket } from "@/lib/socket";
import { useOnlineUsers } from "@/socket-hook/socket";
import dynamic from "next/dynamic";
import VoiceRecorder, { VoiceRecorderHandle } from "./voice-recoder";
import DocumentPreview from "./document-preview";
import { blockUser, unblockUser } from "@/api/user";
import toast from "react-hot-toast";
import DynamicModal from "./dynamic-modal";
import {
  useSearchConversationMessages,
} from "@/react-query/query-hooks";
import { Message } from "@/types/messages";
// import useLoadOlder from "@/hooks/useLoadOlder";
// Dynamically import emoji picker for performance
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });
interface ChatWindowProps {
  selectedChat: Conversation | null;
  onBack: () => void;
  isMobile: boolean;
  activeView: 'chat' | 'settings';
  setActiveView: (view: 'chat' | 'settings') => void;
}

export default function ChatWindow({
  selectedChat,
  onBack,
  isMobile,
  activeView,
  setActiveView
}: ChatWindowProps) {
  const recorderRef = useRef<VoiceRecorderHandle>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { loadOlder } = useLoadOlder();
  const [isBlock, setIsBlock] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    // Escape regex special characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`(${escapedKeyword})`, "gi");

    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <Box
          key={index}
          component="span"
          sx={{
            bgcolor: mode === "light" ? theme.palette.primary.main : theme.palette.secondary.contrastText,
            color: "warning.contrastText",
            px: 0.4,
            py: 0.1,
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };
  const otherUser = selectedChat?.participants.find(
    (p) => p.user.id !== currentUser?.id
  );
  useEffect(() => {
    if (currentUser && otherUser) {
      setIsBlock(
        currentUser.blockedUsers?.some(u => u.id === otherUser.user.id) ?? false
      );
    }
  }, [currentUser, otherUser]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);
  // const {
  //   data: searchMessages = [],
  //   isLoading: isSearchLoading,
  //   isError: isSearchError,
  // } = useSearchConversationMessages(
  //   selectedChat?.id ?? null,
  //   debouncedSearch
  // );
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isError: searchError,
  } = useSearchConversationMessages(
    selectedChat?.id ?? null,
    debouncedSearch
  );
  const matchedMessageIds = new Set(
    searchResults.map((m: Message) => m.id)
  );
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBlockUser = async () => {
    try {
      const extractedUserId = selectedChat?.participants.find(p => p.user.id !== currentUser?.id)
      const targetUserId = extractedUserId?.user.id
      console.log("the target userId", targetUserId);
      await blockUser(targetUserId)
      toast.success("Blocking Successful")
      setIsBlock(true)
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message || "Blocking failed retry")
      setIsBlock(false)
    }
    handleMenuClose();
  };

  const handleUnblockUser = async () => {
    try {
      const extractedUserId = selectedChat?.participants.find(p => p.user.id !== currentUser?.id)
      const blockedUserId = extractedUserId?.user.id
      console.log("the target userId", blockedUserId);
      await unblockUser(blockedUserId)
      toast.success("Unblocking Successful")
      setIsBlock(false)
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message || "Unblocking failed retry")
      setIsBlock(true)
    }
    handleMenuClose();
  };
  const clearChatMutation = useClearChat();


  const handleClearChat = () => {
    if (!selectedChat?.id) return;
    clearChatMutation.mutate(
      { conversationId: selectedChat.id },
      {
        onSuccess: () => {
          toast.success("Chat cleared successfully");
          handleMenuClose();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Chat clear failed, retry");
        },
      }
    );
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useSocketChat(selectedChat?.id);
  const onlineUsers = useOnlineUsers();
  console.log("onlineuser", onlineUsers);

  const { data, isLoading, isError } = useMessages(
    selectedChat?.id ?? ""
  );
  const messages = data?.messages ?? [];
  
      useEffect(() => {
  if (data) {
    setHasOlderMessages(data.hasMore);
  }
}, [data, selectedChat?.id]);
  console.log("selectedChat", selectedChat);
  console.log("message", messages)
  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;
    const socket = getSocket();

    socket.emit("typing", {
      conversationId: selectedChat.id,
      senderId: currentUser.id,
    });
    console.log("the block", currentUser);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedChat.id,
        senderId: currentUser.id,
      });
    }, 1000);
  };

  const handleSendMessage = async (text: string) => {
    if (text.trim() && selectedChat) {
      const socket = getSocket();
      socket.emit("send_message", {
        text,
        conversationId: selectedChat.id,
        type: "TEXT",
        receiverId: otherUser?.user.id
      });
      socket.on('message_blocked', (reason) => {
        if (reason === 'BLOCKED_BY_RECEIVER') {
          toast.error("You can’t message this user");
        } else if (reason === 'BLOCKED_BY_SENDER') {
          toast.error("You’ve blocked this user. Unblock them to send messages.");
        }
      });
      setNewMessage("");
    }
  };
  // Document
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: sendDocumentMutation } = useSendDocument();
  const handleDocumentUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    const fileUrl = URL.createObjectURL(file); // preview
    setSelectedFile({
      url: fileUrl,
      name: file.name,
      size: file.size,
    });
    // Clear input so same file can be selected again if needed
    e.target.value = "";

  };
  const handleSendFile = async (fileData: { url: string; name: string; size: number }) => {
    if (!selectedChat) return;

    const fileBlob = await fetch(fileData.url).then((res) => res.blob());
    const file = new File([fileBlob], fileData.name);
    try {
      setIsSendingFile(true)
      const message = await sendDocumentMutation({
        file,
        conversationId: selectedChat.id,
      });
      const socket = getSocket();
      const otherUser = selectedChat.participants.find(
        (p) => p.user.id !== currentUser?.id
      );
      socket.emit("send_message", {
        type: "DOCUMENT",
        mediaUrl: message.mediaUrl,
        receiverId: otherUser?.user.id,
        conversationId: selectedChat.id,
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileType: message.fileType,
      });
      setSelectedFile(null); // remove preview
      toast.success("File send successfully")
    } catch (error: any) {
      console.error("Failed to send file:", error.message);
      toast.error(error.message || "Failed to send file")
    } finally {
      setIsSendingFile(false); // stop loading
    }

  };

  const startRecording = () => {
    recorderRef.current?.startRecording();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stopRecording();
    setIsRecording(false);
  };

  if (!selectedChat && activeView != "settings") {
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
  console.log("Other user ID (string):", String(otherUser?.user.id));
  console.log("OnlineUsers:", Array.from(onlineUsers));
  const isOtherUserOnline = otherUser
    ? onlineUsers.has(otherUser.user.id)
    : false;
  console.log("isOtherUserOnline:", isOtherUserOnline);
  return (
    <>
      {activeView === 'chat' &&

        <Box flex={1} display="flex" flexDirection="column">
          {/* Chat Header */}
          <Box
            bgcolor="background.paper"
            borderBottom="1px solid"
            borderColor="divider"
          >

            <Collapse in={!showSearch}>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={2}
              >

                <Box display="flex" alignItems="center" gap={2}>

                  {isMobile && (
                    <IconButton onClick={onBack}>
                      <ArrowLeft />
                    </IconButton>
                  )}

                  <Box position="relative">

                    <Avatar>
                      {otherUser?.user.userName[0].toUpperCase()}
                    </Avatar>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor:
                          isOtherUserOnline
                            ? "green"
                            : "grey.400",
                        border:
                          "2px solid white",
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

                  <IconButton
                    onClick={() =>
                      setShowSearch(true)
                    }
                  >
                    <Search />
                  </IconButton>

                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertical />
                  </IconButton>

                  <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                    {isBlock ? (
                      <MenuItem
                        onClick={() => {
                          handleUnblockUser()
                          handleMenuClose();
                        }}
                      >
                        <Check size={18} style={{ marginRight: 8 }} />
                        Unblock User
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          setShowBlockModal(true);
                          handleMenuClose();
                        }}
                      >
                        <Ban size={18} style={{ marginRight: 8 }} />
                        Block User
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        setShowClearModal(true);
                        handleMenuClose();
                      }}
                    >
                      <Trash2 size={18} style={{ marginRight: 8 }} />
                      Clear Chat
                    </MenuItem>
                  </Menu>

                  <DynamicModal
                    open={showBlockModal}
                    title="Block User ?"
                    description="You and this user will no longer be able to send messages to each other."
                    confirmText="Block"
                    confirmColor="error"
                    onClose={() => setShowBlockModal(false)}
                    onConfirm={() => {
                      handleBlockUser();
                      setShowBlockModal(false);
                    }}
                  />
                  <DynamicModal
                    open={showClearModal}
                    title="Clear Chat ?"
                    description="This action will permanently delete all messages in this conversation."
                    confirmText=" Clear Chat"
                    confirmColor="error"
                    onClose={() => setShowClearModal(false)}
                    onConfirm={() => {
                      handleClearChat()
                      setShowClearModal(false);
                    }}
                  />
                </Box>

              </Box>

            </Collapse>

            <Collapse in={showSearch}>

              <Box
                display="flex"
                alignItems="center"
                gap={1}
                p={2}
              >

                <IconButton
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                >
                  <ArrowLeft />
                </IconButton>

                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="Search messages..."

                  value={search}

                  onChange={(e) =>
                    setSearch(e.target.value)
                  }

                  InputProps={{

                    endAdornment:
                      search && (

                        <IconButton
                          size="small"
                          onClick={() =>
                            setSearch("")
                          }
                        >

                          <X size={18} />

                        </IconButton>

                      ),
                  }}
                />

              </Box>

            </Collapse>

            {showSearch && search.trim() !== "" && (
              <Box
                sx={{
                  maxHeight: 220,
                  overflowY: "auto",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {isSearching && (
                  <Box p={2}>
                    <LinearProgress
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "rgba(255,194,68,0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>
                )}
                {/* {isSearchError && } */}

                {!isSearching &&
                  searchResults?.length === 0 && (
                    <Box
                      p={3}
                      textAlign="center"
                    >

                      <Typography
                        color="text.secondary"
                      >

                        No matching messages

                      </Typography>

                    </Box>
                  )}

                {/* {searchResults?.map((message: Message) => (
                  <Box
                    key={message?.id}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                    onClick={() => {
                      setSelectedSearchMessageId(message.id);

                      document
                        .getElementById(`message-${message.id}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                    <Typography variant="body2">
                      {highlightText(
                        message.text,
                        debouncedSearch
                      )}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        message.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                ))} */}
              </Box>
            )}

          </Box>
          <Box
            display="flex"
            justifyContent="center"
            mb={2}
          >
          </Box>
          {/* Messages */}
          <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : isError ? (
              <Typography color="error">Failed to load messages</Typography>
            ) : messages.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                flexDirection="column"
                color="text.secondary"
              >
                <Typography variant="body2">No messages yet</Typography>
                <Typography variant="caption">Start the conversation 👋</Typography>
              </Box>
            ) : (
              <>
                {/* LOAD OLDER BUTTON */}
                {hasOlderMessages && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    mb={2}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ChevronUp size={18} />}
                      onClick={() => {
                        if (!selectedChat?.id) return;

                        loadOlder(
                          selectedChat.id,
                          messages.length,
                          setHasOlderMessages
                        );
                      }}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                      }}
                    >
                      Older Messages
                    </Button>
                  </Box>
                )}
                {messages.map((message: any) => (
                  <Box
                    key={message.id}
                    id={`message-${message.id}`}
                  //           sx={{
                  //             transition: "all .35s ease",

                  //             transform:
                  //               selectedSearchMessageId === message.id
                  //                 ? "scale(1.02)"
                  //                 : "scale(1)",

                  //             boxShadow:
                  //               selectedSearchMessageId === message.id
                  //                 ? (theme) =>
                  //                   `0 0 0 2px ${theme.palette.primary.main}40,
                  //  0 8px 18px ${theme.palette.primary.main}25`
                  //                 : "none",

                  //             border:
                  //               selectedSearchMessageId === message.id
                  //                 ? "1px solid"
                  //                 : "1px solid transparent",

                  //             borderColor:
                  //               selectedSearchMessageId === message.id
                  //                 ? "primary.main"
                  //                 : "transparent",

                  //             borderRadius: 2,
                  //           }}
                  >
                    <MessageBubble
                      key={message.id}
                      text={message.text}
                      timeStamp={message.createdAt}
                      type={message.type}
                      mediaUrl={message.mediaUrl}
                      fileName={message.fileName}
                      fileSize={message.fileSize}
                      isRead={message.isRead}
                      isSender={message.sender.id === currentUser.id}
                      selectedId={selectedChat?.id}
                      currentUserId={currentUser?.id}
                      highlightText={highlightText}
                      searchKeyword={debouncedSearch}
                      highlight={
                        matchedMessageIds.has(message.id)
                      }
                    />
                  </Box>
                ))}
              </>
            )}
          </Box>
          {/* Voice Recorder */}
          <VoiceRecorder
            ref={recorderRef}
            conversationId={selectedChat?.id}
          />
          {selectedFile && (
            <DocumentPreview
              fileUrl={selectedFile.url}
              fileName={selectedFile.name}
              fileSize={selectedFile.size}
              onSend={() => handleSendFile(selectedFile)}
              onCancel={() => setSelectedFile(null)}
              isSending={isSendingFile}
            />
          )}
          {/* Chat Input */}
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            p={1}
            borderTop="1px solid"
            borderColor="divider"
            bgcolor="background.paper"
          >
            <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
              <Smile />
            </IconButton>

            {showEmojiPicker && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "55px",
                  left: "10px",
                  zIndex: 1200,
                }}
              >
                <Picker
                  onEmojiClick={(emojiData: any) =>
                    setNewMessage((prev) => prev + emojiData.emoji)
                  }
                />
              </Box>
            )}
            {/* Document Upload */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleDocumentUpload}
            />

            <IconButton onClick={() => fileInputRef.current?.click()}>
              <Paperclip />
            </IconButton>

            <TextField
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              size="small"
              sx={{ mx: 1 }}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage(newMessage);
              }}
            />

            <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
              <IconButton
                color={isRecording ? "error" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <Square /> : <Mic />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
      {activeView === 'settings' && (
        <Box flex={1} display="flex" flexDirection="column">
          {/* Settings Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bgcolor="background.paper"
            borderBottom="1px solid"
            borderColor="divider"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={() => setActiveView("chat")}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6">Settings</Typography>
            </Box>
          </Box>
          {/* Settings Content */}
          <Box flex={1} overflow="auto" bgcolor="background.default">
            <Settings setActiveView={setActiveView} />
          </Box>
        </Box>
      )}
    </>
  );
}
