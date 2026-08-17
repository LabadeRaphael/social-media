"use client";

import {
  Box,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";

import {
  Mic,
  Paperclip,
  Smile,
  Square,
} from "lucide-react";

import dynamic from "next/dynamic";

const Picker = dynamic(
  () => import("emoji-picker-react"),
  {
    ssr: false,
  }
);

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (
    value: string
  ) => void;

  showEmojiPicker: boolean;
  setShowEmojiPicker: (
    value: boolean
  ) => void;

  isRecording: boolean;

  onTyping: () => void;
  onSendMessage: (
    text: string
  ) => void;

  onStartRecording: () => void;
  onStopRecording: () => void;

  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onEmojiSelect: (
    emoji: string
  ) => void;
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  isRecording,
  onTyping,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  fileInputRef,
  onFileUpload,
  onEmojiSelect,
}: ChatInputProps) {
  const handleSend = () => {
    onSendMessage(newMessage);
  };

  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      p={1}
      borderTop="1px solid"
      borderColor="divider"
      bgcolor="background.paper"
    >
      <IconButton
        onClick={() =>
          setShowEmojiPicker(
            !showEmojiPicker
          )
        }
      >
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
            onEmojiClick={(
              emojiData
            ) =>
              onEmojiSelect(
                emojiData.emoji
              )
            }
          />
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={onFileUpload}
      />

      <IconButton
        onClick={() =>
          fileInputRef.current?.click()
        }
      >
        <Paperclip />
      </IconButton>

      <TextField
        fullWidth
        placeholder="Type a message"
        variant="outlined"
        size="small"
        sx={{ mx: 1 }}
        value={newMessage}
        onChange={(event) => {
          setNewMessage(
            event.target.value
          );

          onTyping();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();
            handleSend();
          }
        }}
      />

      <Tooltip
        title={
          isRecording
            ? "Stop Recording"
            : "Start Recording"
        }
      >
        <IconButton
          color={
            isRecording
              ? "error"
              : "primary"
          }
          onClick={
            isRecording
              ? onStopRecording
              : onStartRecording
          }
        >
          {isRecording ? (
            <Square />
          ) : (
            <Mic />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}