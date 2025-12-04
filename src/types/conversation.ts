// export interface Conversation {
//   id: string;
//   participants: {
//     id: string;
//     userName: string;
//   }[];
//   lastMessage?: {
//     id: string;
//     text: string;
//     createdAt: string;
//   }|null;
// }

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
    createdAt: string;
  };
}
