export interface Message {
  conversationId: string;
  senderId?: string;
  text: string;
 isRead?: boolean; // ✅ add this line
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE"; // extend later
}