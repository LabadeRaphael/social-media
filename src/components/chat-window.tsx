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
} from "@mui/material";
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

} from "lucide-react";
import { Menu, MenuItem } from "@mui/material";
import { Ban, Trash2 } from "lucide-react";
import Settings from "@/components/settings"

import MessageBubble from "./message-bubble";
import { useRef, useState } from "react";
import {
  useClearChat,
  useCurrentUser,
  useMessages,
  useSendDocument,
  useSendMessage,
} from "@/react-query/query-hooks";
import { Conversation } from "@/types/conversation";
import { ThemeSwitcher } from "./Theme/themeswitcher";
import { useSocketChat } from "@/react-query/query-hooks";
import { getSocket } from "@/lib/socket";
import TypingIndicator from "./typing-indicator";
import { useOnlineUsers } from "@/socket-hook/socket";
import dynamic from "next/dynamic";
import VoiceRecorder, { VoiceRecorderHandle } from "./voice-recoder";
import DocumentPreview from "./document-preview";
import { blockUser, clearChat, unblockUser } from "@/api/user";
import toast from "react-hot-toast";







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

  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  // const [isBlock, setIsBlock] = useState(false)


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBlockUser = () => {

    try {
      const extractedUserId = selectedChat?.participants.find(p => p.user.id !== currentUser?.id)

      const targetUserId = extractedUserId?.user.id
      console.log("the target userId", targetUserId);

      blockUser(targetUserId)
      // setIsBlock(true)
      toast.success("Blocking Successful")
    } catch (error) {
      console.log(error.message);
      //  setIsBlock(false)
      toast.error(error.message || "Blocking failed retry")
    }
    handleMenuClose();
  };

  const handleUnblockUser = () => {

    try {
      const extractedUserId = selectedChat?.participants.find(p => p.user.id !== currentUser?.id)
      const blockedUserId = extractedUserId?.user.id
      console.log("the target userId", blockedUserId);
      unblockUser(blockedUserId)
      toast.success("Unblocking Successful")
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Unblocking failed retry")
    }
    handleMenuClose();
  };
  const clearChatMutation = useClearChat(); // ✅ hook call at top level


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
  const { data: currentUser } = useCurrentUser();
  const onlineUsers = useOnlineUsers();
  console.log("onlineuser", onlineUsers);

  const { data: messages = [], isLoading, isError } = useMessages(
    selectedChat?.id ?? ""
  );
  console.log(selectedChat);
  console.log(messages)


  // console.log(messages);

  // const { mutateAsync: sendMessage } = useSendMessage();

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
    }, 2000);
  };
  const otherUser = selectedChat?.participants.find(
    (p) => p.user.id !== currentUser?.id
  );

  const isBlock = Boolean(
    currentUser?.blockedUsers?.some(
      (blockedUser) => blockedUser.id === otherUser?.user.id
    )
  );
  console.log("The is block state", isBlock);
  
  console.log("blockuser", isBlock);
  console.log("otheruser", otherUser?.user.id);
  console.log("senderId", currentUser?.id);
  console.log("receiverId", otherUser?.user.id);

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

    // const message = await sendDocumentMutation({
    //   file,
    //   conversationId: selectedChat.id,
    // });
    const fileUrl = URL.createObjectURL(file); // preview
    setSelectedFile({
      url: fileUrl,
      name: file.name,
      size: file.size,
    });

    // Clear input so same file can be selected again if needed
    e.target.value = "";

    // const socket = getSocket();

    // socket.emit("send_message", {
    //   type: "DOCUMENT",
    //   mediaUrl: message.mediaUrl,
    //   receiverId: otherUser?.user.id,
    //   conversationId: selectedChat.id,
    //   fileName: message.fileName,
    //   fileSize: message.fileSize,
    //   fileType: message.fileType,
    // });
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

    } catch (error) {
      console.error("Failed to send file:", error.message);
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
              <Box position="relative" display="inline-block">
                <Avatar>{otherUser?.user.userName[0]}</Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: isOtherUserOnline ? "green" : "grey.400",
                    border: "2px solid white", // adds a border to separate dot from avatar
                  }}
                />
              </Box>

              {/* <Avatar>{otherUser?.user.userName[0]}</Avatar> */}
              <Box>
                <Typography variant="subtitle1">
                  {otherUser?.user.userName ?? "Unknown User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isOtherUserOnline ? "Online" : "Offline"}
                </Typography>
                <TypingIndicator
                  conversationId={selectedChat?.id}
                  currentUserId={currentUser?.id}
                />
              </Box>
            </Box>
            <Box>
              <IconButton>
                <Search />
              </IconButton>
              <ThemeSwitcher />
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
              {showBlockModal && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2000,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      p: 3,
                      borderRadius: 2,
                      width: "90%",
                      maxWidth: 400,
                    }}
                  >
                    <Typography variant="h6" mb={1}>
                      Block User?
                    </Typography>
                    <Typography variant="body2" mb={2}>
                      You will no longer receive messages from this user.
                    </Typography>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <button
                        onClick={() => setShowBlockModal(false)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#ccc",
                          border: "none",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          handleBlockUser();
                          setShowBlockModal(false);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "red",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Block
                      </button>
                    </Box>
                  </Box>
                </Box>
              )}
              {showClearModal && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2000,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      p: 3,
                      borderRadius: 2,
                      width: "90%",
                      maxWidth: 400,
                    }}
                  >
                    <Typography variant="h6" mb={1}>
                      Clear Chat?
                    </Typography>
                    <Typography variant="body2" mb={2}>
                      This will delete all messages in this conversation.
                    </Typography>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <button
                        onClick={() => setShowClearModal(false)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#ccc",
                          border: "none",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          handleClearChat()
                          console.log("Chat cleared");
                          setShowClearModal(false);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "red",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Clear Chat
                      </button>
                    </Box>
                  </Box>
                </Box>
              )}


            </Box>
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
              messages.map((message: any) => (
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
                // isSender={message.senderId === currentUser.id}
                />
              ))
            )}
          </Box>

          {/* Voice Recorder */}
          <VoiceRecorder
            ref={recorderRef}
            conversationId={selectedChat.id}
          />

          {/* {selectedFile && ( */}

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

          {/* )} */}


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

            {/* <IconButton onClick={() => fileInputRef.current?.click()>
              <Paperclip />
            </IconButton> */}
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

              <ThemeSwitcher />
            </Box>
          </Box>

          {/* Settings Content */}
          <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
            <Settings />
          </Box>
        </Box>
      )}

    </>


  );
}
