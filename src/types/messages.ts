export interface Message {
  conversationId: string;
  senderId?: string;
  text: string;
  mediaUrl?: string|null;
  duration?: number|null;
  isRead?: boolean; // ✅ add this line
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE"; // extend later
}