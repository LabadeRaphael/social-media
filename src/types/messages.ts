export interface Message {
  conversationId: string;
  senderId?: string;
  text: string;
   unreadCount?: number; // ✅ add this line
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE"; // extend later
}