export interface Conversation {
  id: string;
  participants: {
    id: string;
    userId: string;
    unreadCount:number
    user: {
      id: string;
      userName: string;
      email: string;
      createdAt: string;
    };
  }[];
  lastMessage?: {
    type:string;
    text: string;
    duration?: number;
    fileSize?: number;
    fileName?: number;
    createdAt: string;
  };
}
