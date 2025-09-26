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
//   const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
//   useEffect(() => {
//     if (userId) {
//       setSelectedUser(userId);
//     }
//   }, [userId]);

//   const handleBack = () => {
//     setSelectedUser(null);
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
import { setSelectedUser } from "@/redux/slices/chatSlice";
import { useAllConversations, useConversationByUserId } from "@/react-query/query-hooks";
import toast from "react-hot-toast";
import type { RootState } from "@/redux/store";

export default function SpecificChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const selectedUser = useSelector((state: RootState) => state.chatReducer.selectedUser);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { data: conversation, isLoading, error } = useAllConversations();

  // Handle userId change and set selectedUser in Redux
  useEffect(() => {
    if (userId) {
      dispatch(setSelectedUser(userId));
    }
    return () => {
      // Clear selected user on unmount
      dispatch(setSelectedUser(null));
    };
  }, [userId, dispatch]);

  // Display error toast if conversation fetch fails
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load conversation");
    }
  }, [error]);

  // Handle back navigation
  const handleBack = () => {
    dispatch(setSelectedUser(null));
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
      selectedUser={selectedUser}
      onBack={handleBack}
      isMobile={isMobile}
    />
  );
}