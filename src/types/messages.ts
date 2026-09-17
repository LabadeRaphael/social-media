export interface Message {
  id: string;
  text: string | null;

  type: "TEXT" | "VOICE" | "DOCUMENT";

  conversationId: string;

  mediaUrl: string | null;

  duration: number | null;

  fileName: string | null;

  fileSize: number | null;

  fileType: string | null;

  createdAt: string;

  isRead: boolean;

  sender: {
    id: string;
    userName: string;
    email: string;
  };
}