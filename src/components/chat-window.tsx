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
  const [isSendingFile, setIsSendingFile] = useState(false);

    const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);

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

  console.log("Other user ID (string):", String(otherUser?.user.id));
  console.log("OnlineUsers:", Array.from(onlineUsers));


  const isOtherUserOnline = otherUser
    ? onlineUsers.has(otherUser.user.id)
    : false;
  console.log("isOtherUserOnline:", isOtherUserOnline);

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
  );
}
