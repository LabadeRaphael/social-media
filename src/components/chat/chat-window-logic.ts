"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  useClearChat,
  useLoadOlder,
  useMessages,
  useSendDocument,
  useSearchConversationMessages,
} from "@/react-query/chat-hook";
import {  useCurrentUser } from "@/react-query/query-hooks";
import { getSocket } from "@/lib/socket";
import { useSocketChat } from "@/react-query/socket-hook";
import { useOnlineUsers } from "@/react-query/socket-hook";
import { Conversation } from "@/types/conversation";
import { Message } from "@/types/messages";

import { blockUser, unblockUser } from "@/api/user";

import { VoiceRecorderHandle } from "../voice-recorder";

interface UseChatWindowProps {
  selectedChat: Conversation | null;
}

export function useChatWindow({
  selectedChat,
}: UseChatWindowProps) {
  const recorderRef = useRef<VoiceRecorderHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isSendingFile, setIsSendingFile] = useState(false);

//   const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const [isBlock, setIsBlock] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: currentUser } = useCurrentUser();

  const { loadOlder } = useLoadOlder();

  const clearChatMutation = useClearChat();

  const { mutateAsync: sendDocumentMutation } = useSendDocument();

  useSocketChat(selectedChat?.id);

  const onlineUsers = useOnlineUsers();

  const {
    data,
    isLoading,
    isError,
  } = useMessages(selectedChat?.id ?? "");

  const messages = data?.messages ?? [];
  const hasOlderMessages = data?.hasMore ?? false;
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isError: searchError,
  } = useSearchConversationMessages(
    selectedChat?.id ?? null,
    debouncedSearch
  );

  const otherUser = useMemo(() => {
    return selectedChat?.participants.find(
      (participant) => participant.user.id !== currentUser?.id
    );
  }, [selectedChat, currentUser?.id]);

  const matchedMessageIds = useMemo(() => {
    return new Set(
      searchResults.map((message: Message) => message.id)
    );
  }, [searchResults]);

  const isOtherUserOnline = otherUser
    ? onlineUsers.has(otherUser.user.id)
    : false;

  /*
   * --------------------------------
   * Search debounce
   * --------------------------------
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * --------------------------------
   * Block status
   * --------------------------------
   */

  useEffect(() => {
    if (!currentUser || !otherUser) {
      setIsBlock(false);
      return;
    }

    setIsBlock(
      currentUser.blockedUsers?.some(
        (user) => user.id === otherUser.user.id
      ) ?? false
    );
  }, [currentUser, otherUser]);

  /*
   * --------------------------------
   * Older messages state
   * --------------------------------
   */

//   useEffect(() => {
//     if (data) {
//       setHasOlderMessages(data.hasMore);
//     }
//   }, [data]);

  /*
   * --------------------------------
   * Message blocked socket listener
   * --------------------------------
   */

  useEffect(() => {
    const socket = getSocket();

    const handleMessageBlocked = (reason: string) => {
      if (reason === "BLOCKED_BY_RECEIVER") {
        toast.error("You can’t message this user");
      }

      if (reason === "BLOCKED_BY_SENDER") {
        toast.error(
          "You’ve blocked this user. Unblock them to send messages."
        );
      }
    };

    socket.on("message_blocked", handleMessageBlocked);

    return () => {
      socket.off("message_blocked", handleMessageBlocked);
    };
  }, []);

  /*
   * --------------------------------
   * Typing cleanup
   * --------------------------------
   */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /*
   * --------------------------------
   * Search -> automatically load
   * older messages
   * --------------------------------
   */

  const loadMessagesForSearch = useCallback(async () => {
    if (
      !selectedChat?.id ||
      !debouncedSearch.trim() ||
      searchResults.length === 0
    ) {
      return;
    }

    const searchResultIds = new Set(
      searchResults.map((message: Message) => message.id)
    );

    let currentMessages = messages;
    let hasMore = data?.hasMore ?? false;

    while (hasMore) {
      const found = currentMessages.some((message: Message) =>
        searchResultIds.has(message.id)
      );

      if (found) {
        return;
      }

      const result = await loadOlder(
        selectedChat.id,
        currentMessages.length,
        // setHasOlderMessages
      );

      if (!result) {
        return;
      }

      currentMessages = [
        ...result.messages,
        ...currentMessages,
      ];

      currentMessages = Array.from(
        new Map(
          currentMessages.map((message: Message) => [
            message.id,
            message,
          ])
        ).values()
      );

      hasMore = result.hasMore;
    }
  }, [
    selectedChat?.id,
    debouncedSearch,
    searchResults,
    messages,
    data?.hasMore,
    loadOlder,
  ]);

  useEffect(() => {
    if (
      !debouncedSearch.trim() ||
      searchResults.length === 0
    ) {
      return;
    }

    loadMessagesForSearch();
  }, [
    debouncedSearch,
    searchResults,
    loadMessagesForSearch,
  ]);

  /*
   * --------------------------------
   * Menu
   * --------------------------------
   */

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /*
   * --------------------------------
   * Block
   * --------------------------------
   */

  const handleBlockUser = async () => {
    if (!otherUser?.user.id) return;

    try {
      await blockUser(otherUser.user.id);

      toast.success("Blocking Successful");
      setIsBlock(true);
    } catch (error: any) {
      toast.error(
        error?.message || "Blocking failed retry"
      );
    } finally {
      handleMenuClose();
    }
  };

  const handleUnblockUser = async () => {
    if (!otherUser?.user.id) return;

    try {
      await unblockUser(otherUser.user.id);

      toast.success("Unblocking Successful");
      setIsBlock(false);
    } catch (error: any) {
      toast.error(
        error?.message || "Unblocking failed retry"
      );
    } finally {
      handleMenuClose();
    }
  };

  /*
   * --------------------------------
   * Clear chat
   * --------------------------------
   */

  const handleClearChat = () => {
    if (!selectedChat?.id) return;

    clearChatMutation.mutate(
      {
        conversationId: selectedChat.id,
      },
      {
        onSuccess: () => {
          toast.success("Chat cleared successfully");
          handleMenuClose();
        },

        onError: (error: any) => {
          toast.error(
            error?.message ||
              "Chat clear failed, retry"
          );
        },
      }
    );
  };

  /*
   * --------------------------------
   * Typing
   * --------------------------------
   */

  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;

    const socket = getSocket();

    socket.emit("typing", {
      conversationId: selectedChat.id,
      senderId: currentUser.id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedChat.id,
        senderId: currentUser.id,
      });
    }, 1000);
  };

  /*
   * --------------------------------
   * Send message
   * --------------------------------
   */

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedChat) return;

    const socket = getSocket();

    socket.emit("send_message", {
      conversationId: selectedChat.id,
      type: "TEXT",
      text,
      // receiverId: otherUser?.user.id,
    });

    setNewMessage("");
  };

  /*
   * --------------------------------
   * Document
   * --------------------------------
   */

  const handleDocumentUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !selectedChat) return;

    const fileUrl = URL.createObjectURL(file);

    setSelectedFile({
      url: fileUrl,
      name: file.name,
      size: file.size,
    });

    event.target.value = "";
  };

  const handleSendFile = async (fileData: {
    url: string;
    name: string;
    size: number;
  }) => {
    if (!selectedChat) return;

    try {
      setIsSendingFile(true);

      const fileBlob = await fetch(fileData.url).then(
        (response) => response.blob()
      );

      const file = new File(
        [fileBlob],
        fileData.name
      );

      const message = await sendDocumentMutation({
        file,
        conversationId: selectedChat.id,
      });

      const socket = getSocket();

      socket.emit("send_message", {
        type: "DOCUMENT",
        mediaUrl: message.mediaUrl,
        receiverId: otherUser?.user.id,
        conversationId: selectedChat.id,
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileType: message.fileType,
      });

      URL.revokeObjectURL(fileData.url);

      setSelectedFile(null);

      toast.success("File sent successfully");
    } catch (error: any) {
      console.error(
        "Failed to send file:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to send file"
      );
    } finally {
      setIsSendingFile(false);
    }
  };

  /*
   * --------------------------------
   * Recording
   * --------------------------------
   */

  const startRecording = () => {
    recorderRef.current?.startRecording();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stopRecording();
    setIsRecording(false);
  };

  /*
   * --------------------------------
   * Return everything
   * --------------------------------
   */

  return {
    currentUser,
    otherUser,
    messages,

    isLoading,
    isError,

    isOtherUserOnline,
    onlineUsers,

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
    searchError,

    matchedMessageIds,
  };
}