export interface MessageBubbleProps {
  text: string | null;
  timeStamp: string;
  isRead: boolean;
  isSender: boolean;
  type: "TEXT" | "VOICE" | "DOCUMENT";
  mediaUrl: string | null;
  duration: number | null;
  fileName: string | null;
  fileSize: number | null;
  selectedId?: string;
  currentUserId?: string;
  highlight?: boolean;
  searchKeyword?: string;
  highlightText?: (
    text: string,
    keyword: string
  ) => React.ReactNode;
}