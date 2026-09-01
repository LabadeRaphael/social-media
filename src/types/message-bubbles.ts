// export interface MessageBubbleProps {
//   text?: string;
//   timeStamp: string;
//   isRead: boolean;
//   isSender: boolean;
//   type: "TEXT" | "VOICE" | "DOCUMENT";
//   mediaUrl?: string;
//   fileName?: string;
//   fileSize?: number;
//   selectedId?: string
//   currentUserId?: string
//   highlight?: boolean;
//   sender:string;
//   createdAt:Date;
//   searchKeyword?: string;
//   highlightText?: (text: string, keyword: string) => React.ReactNode;
// }

export interface MessageBubbleProps {
  text: string | null;

  timeStamp: string;

  isRead: boolean;

  isSender: boolean;

  type: "TEXT" | "VOICE" | "DOCUMENT";

  mediaUrl: string | null;
  

  duration: number | null;

  fileName: string | null;

  fileSize: number | null;

  fileType: string | null;

  selectedId?: string;

  currentUserId?: string;

  highlight?: boolean;

  sender: {
    id: string;
    userName: string;
    email: string;
  };

  createdAt: string;

  searchKeyword?: string;

  highlightText?: (
    text: string,
    keyword: string
  ) => React.ReactNode;
}