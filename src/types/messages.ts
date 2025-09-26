export interface Message {
  conversationId: string;
  text: string;
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE"; // extend later
}