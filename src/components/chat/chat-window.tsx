"use client";

import {
  Box,
  Typography,
  IconButton
} from "@mui/material";

import Settings from "@/components/settings";

import VoiceRecorder from "../voice-recorder";
import DocumentPreview from "../document-preview";

import ChatHeader from "../chat/chat-header";
import ChatSearch from "../chat/chat-search";
import ChatMenu from "../chat/chat-menu";
import ChatMessages from "../chat/chat-messages";
import ChatInput from "../chat/chat-input";

import {
  useChatWindow,
} from "./chat-window-logic";

import { Conversation } from "@/types/conversation";

import { useTheme } from "@mui/material/styles";

import {
  ChevronLeft,
} from "lucide-react";

interface ChatWindowProps {
  selectedChat: Conversation | null;

  onBack: () => void;

  isMobile: boolean;

  activeView:
    | "chat"
    | "settings";

  setActiveView: (
    view: "chat" | "settings"
  ) => void;
}

export default function ChatWindow({
  selectedChat,
  onBack,
  isMobile,
  activeView,
  setActiveView,
}: ChatWindowProps) {
  const theme = useTheme();

  const {
    currentUser,
    otherUser,

    messages,

    isLoading,
    isError,

    isOtherUserOnline,

    hasOlderMessages,
    loadOlder,

    recorderRef,
    fileInputRef,

    isRecording,
    startRecording,
    stopRecording,

    newMessage,
    setNewMessage,

    showEmojiPicker,
    setShowEmojiPicker,

    selectedFile,
    setSelectedFile,

    isSendingFile,

    handleDocumentUpload,
    handleSendFile,

    handleTyping,
    handleSendMessage,

    anchorEl,
    handleMenuOpen,
    handleMenuClose,

    isBlock,
    handleBlockUser,
    handleUnblockUser,

    showBlockModal,
    setShowBlockModal,

    showClearModal,
    setShowClearModal,

    handleClearChat,

    showSearch,
    setShowSearch,

    search,
    setSearch,

    debouncedSearch,

    searchResults,
    isSearching,

    matchedMessageIds,
  } = useChatWindow({
    selectedChat,
  });

  /*
   * --------------------------------
   * Highlight search text
   * --------------------------------
   */

  const highlightText = (
    text: string,
    keyword: string
  ) => {
    if (!keyword.trim()) {
      return text;
    }

    const escapedKeyword =
      keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const regex = new RegExp(
      `(${escapedKeyword})`,
      "gi"
    );

    return text
      .split(regex)
      .map((part, index) => {
        const isMatch =
          part.toLowerCase() ===
          keyword.toLowerCase();

        return isMatch ? (
          <Box
            key={index}
            component="span"
            sx={{
              bgcolor:
                theme.palette.primary.main,
              color:
                theme.palette.warning
                  .contrastText,
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
        );
      });
  };

  /*
   * --------------------------------
   * No selected chat
   * --------------------------------
   */

  if (
    !selectedChat &&
    activeView !== "settings"
  ) {
    return (
      <Box
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {activeView === "chat" &&
        selectedChat && (
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
          >
            {/* =========================
                HEADER
            ========================== */}

            <Box
              bgcolor="background.paper"
              borderBottom="1px solid"
              borderColor="divider"
            >
              {!showSearch ? (
                <ChatHeader
                  selectedChat={selectedChat}
                  otherUser={otherUser}
                  isMobile={isMobile}
                  onBack={onBack}
                  isOtherUserOnline={
                    isOtherUserOnline
                  }
                  onSearch={() =>
                    setShowSearch(true)
                  }
                  onMenuOpen={
                    handleMenuOpen
                  }
                />
              ) : (
                <ChatSearch
                  search={search}
                  setSearch={setSearch}
                  onClose={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                  isSearching={
                    isSearching
                  }
                  searchResults={
                    searchResults
                  }
                />
              )}
            </Box>

            {/* =========================
                MENU
            ========================== */}

            <ChatMenu
              anchorEl={anchorEl}
              isBlock={isBlock}
              showBlockModal={
                showBlockModal
              }
              showClearModal={
                showClearModal
              }
              onClose={
                handleMenuClose
              }
              onBlock={
                handleBlockUser
              }
              onUnblock={
                handleUnblockUser
              }
              onClearChat={
                handleClearChat
              }
              setShowBlockModal={
                setShowBlockModal
              }
              setShowClearModal={
                setShowClearModal
              }
            />

            {/* =========================
                MESSAGES
            ========================== */}

            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isError={isError}
              hasOlderMessages={
                hasOlderMessages
              }
              onLoadOlder={() => {
                loadOlder(
                  selectedChat.id,
                  messages.length
                );
              }}
              currentUserId={
                currentUser?.id
              }
              selectedChatId={
                selectedChat.id
              }
              highlightText={
                highlightText
              }
              searchKeyword={
                debouncedSearch
              }
              matchedMessageIds={
                matchedMessageIds
              }
            />

            {/* =========================
                VOICE RECORDER
            ========================== */}

            <VoiceRecorder
              ref={recorderRef}
              conversationId={
                selectedChat.id
              }
            />

            {/* =========================
                DOCUMENT PREVIEW
            ========================== */}

            {selectedFile && (
              <DocumentPreview
                fileUrl={
                  selectedFile.url
                }
                fileName={
                  selectedFile.name
                }
                fileSize={
                  selectedFile.size
                }
                onSend={() =>
                  handleSendFile(
                    selectedFile
                  )
                }
                onCancel={() =>
                  setSelectedFile(null)
                }
                isSending={
                  isSendingFile
                }
              />
            )}

            {/* =========================
                INPUT
            ========================== */}

            <ChatInput
              newMessage={
                newMessage
              }
              setNewMessage={
                setNewMessage
              }
              showEmojiPicker={
                showEmojiPicker
              }
              setShowEmojiPicker={
                setShowEmojiPicker
              }
              isRecording={
                isRecording
              }
              onTyping={
                handleTyping
              }
              onSendMessage={
                handleSendMessage
              }
              onStartRecording={
                startRecording
              }
              onStopRecording={
                stopRecording
              }
              fileInputRef={
                fileInputRef
              }
              onFileUpload={
                handleDocumentUpload
              }
              onEmojiSelect={(
                emoji
              ) =>
                setNewMessage(
                  `${newMessage}${emoji}`
                )
              }
            />
          </Box>
        )}

      {/* =========================
          SETTINGS
      ========================== */}

      {activeView === "settings" && (
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            p={2}
            bgcolor="background.paper"
            borderBottom="1px solid"
            borderColor="divider"
          >
            <IconButton
              onClick={() =>
                setActiveView("chat")
              }
            >
              <ChevronLeft />
            </IconButton>

            <Typography variant="h6">
              Settings
            </Typography>
          </Box>

          <Box
            flex={1}
            overflow="auto"
            bgcolor="background.default"
          >
            <Settings
              setActiveView={
                setActiveView
              }
            />
          </Box>
        </Box>
      )}
    </>
  );
}