"use client";

import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Smile,
  Square,
  Paperclip,
  Mic,
} from "lucide-react";
import MessageBubble from "./message-bubble";
import { useRef, useState } from "react";
import {
  useCurrentUser,
  useMessages,
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

// Dynamically import emoji picker for performance
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface ChatWindowProps {
  selectedChat: Conversation | null;
  onBack: () => void;
  isMobile: boolean;
}

export default function ChatWindow({
  selectedChat,
  onBack,
  isMobile,
}: ChatWindowProps) {
  const recorderRef = useRef<VoiceRecorderHandle>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSocketChat(selectedChat?.id);
  const { data: currentUser } = useCurrentUser();
  const onlineUsers = useOnlineUsers();

  const { data: messages = [], isLoading, isError } = useMessages(
    selectedChat?.id ?? ""
  );
  const { mutateAsync: sendMessage } = useSendMessage();

  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;
    const socket = getSocket();

    socket.emit("typing", {
      conversationId: selectedChat.id,
      senderId: currentUser.id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedChat.id,
        senderId: currentUser.id,
      });
    }, 2000);
  };

  const handleSendMessage = async (text: string) => {
    if (text.trim() && selectedChat) {
      const socket = getSocket();
      socket.emit("send_message", {
        text,
        conversationId: selectedChat.id,
        type: "TEXT",
      });
      setNewMessage("");
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

  if (!selectedChat) {
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

  const otherUser = selectedChat.participants.find(
    (p) => p.user.id !== currentUser?.id
  );
  const isOtherUserOnline = otherUser
    ? onlineUsers.has(otherUser.user.id)
    : false;

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
          <Avatar>{otherUser?.user.userName[0]}</Avatar>
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
          <IconButton>
            <MoreVertical />
          </IconButton>
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
              isRead={message.isRead}
              isSender={message.sender.id === currentUser.id}
            />
          ))
        )}
      </Box>

      {/* Voice Recorder */}
      <VoiceRecorder
        ref={recorderRef}
        conversationId={selectedChat.id}
      />

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

        <IconButton>
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
  );
}
