export interface Message {
  conversationId: string;
  senderId?: string;
  text: string;
  mediaUrl?: string|null;
  duration?: number|null;
  fileName?: string|null;
  fileSize?: number|null,
  fileType?: string|null
  isRead?: boolean; // ✅ add this line
  type: "TEXT" | "DOCUMENT" | "VOICE"; // extend later
}