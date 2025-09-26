export interface Conversation {
  id: string;
  participants: {
    id: string;
    userName: string;
  }[];
  lastMessage?: {
    id: string;
    text: string;
    createdAt: string;
  }|null;
}