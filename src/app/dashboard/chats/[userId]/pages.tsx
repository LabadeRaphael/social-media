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

"use client";

import { Box, useParams, useMediaQuery, Theme } from "@mui/material";
import ChatWindow from "@/components/chat-window";
import { useState, useEffect } from "react";

export default function SpecificChatPage() {
  const params = useParams();
  const userId = params.userId as string;
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      setSelectedUser(userId);
    }
  }, [userId]);

  const handleBack = () => {
    setSelectedUser(null);
  };

  if (!userId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <p>Loading chat...</p>
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