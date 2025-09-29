export interface Message {
  conversationId: string;
  senderId?: string;
  text: string;
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE"; // extend later
}