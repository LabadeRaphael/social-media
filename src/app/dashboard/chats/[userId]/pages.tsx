// import { Box } from "@mui/material";
// import Sidebar from "@/components/sidebar";
// import ChatWindow from "@/components/chat-window";

// export default async function UserChatPage(
// { params }: { params:Promise< { userId: string }>;
// }) {
//  const userId= (await params).userId
//   return (
//     <Box display="flex" height="100vh">
//       {/* <Sidebar /> */}
//       <h1>{userId}</h1>
//       <ChatWindow userId={userId} />
//     </Box>
//   );
// }

// "use client";

// import { Box, useParams, useMediaQuery, Theme } from "@mui/material";
// import ChatWindow from "@/components/chat-window";
// import { useState, useEffect } from "react";

// export default function SpecificChatPage() {
//   const params = useParams();
//   const userId = params.userId as string;
//   const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
//   const [selectedUser, setSelectedChat] = useState<string | null>(null);
  
//   useEffect(() => {
//     if (userId) {
//       setSelectedChat(userId);
//     }
//   }, [userId]);

//   const handleBack = () => {
//     setSelectedChat(null);
//   };

//   if (!userId) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <p>Loading chat...</p>
//       </Box>
//     );
//   }

//   return (
//     <ChatWindow
//       selectedUser={selectedUser}
//       onBack={handleBack}
//       isMobile={isMobile}
//     />
//   );
// }
"use client";

import { Box, useParams, useMediaQuery } from "@mui/material";
import ChatWindow from "@/components/chat-window";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "@/redux/chats-slice";
import { useAllConversations, useConversationByUserId, useJoinAllConversations } from "@/react-query/query-hooks";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";

export default function SpecificChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const selectedChat = useSelector((state: RootState) => state.chatReducer.selectedChat);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { data: conversation, isLoading, error } = useAllConversations();
  useJoinAllConversations()

// useEffect(() => {
//   if (userId && conversation) {
//     const existingConv = conversation.find((c: any) =>
//       c.participants.some((p: any) => p.user.id === userId)
//     );

//     if (existingConv) {
//       dispatch(setSelectedChat(existingConv));
//     }
//   }

//   return () => {
//     dispatch(setSelectedChat(null));
//   };
// }, [userId, conversation, dispatch]);

  // Display error toast if conversation fetch fails
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load conversation");
    }
  }, [error]);

  // Handle back navigation
  const handleBack = () => {
    dispatch(setSelectedChat(null));
  };

  if (!userId || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <p>Loading chat...</p>
      </Box>
    );
  }

  if (error || !conversation) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <p>No conversation found</p>
      </Box>
    );
  }

  return (
    <ChatWindow
      // selectedUser={selectedUser}
      selectedChat={selectedChat}
      onBack={handleBack}
      isMobile={isMobile}
    />
  );
}