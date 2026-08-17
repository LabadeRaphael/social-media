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
  highlight?: boolean;
  sender:string;
  createdAt:Date;
  searchKeyword?: string;
  highlightText?: (text: string, keyword: string) => React.ReactNode;
}