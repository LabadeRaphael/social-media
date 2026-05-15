export interface MessageBubbleProps {
  text?: string;
  timeStamp: string;
  isRead: boolean;
  isSender: boolean;
  type: "TEXT" | "VOICE" | "DOCUMENT";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  selectedId?: string
  currentUserId?: string
}