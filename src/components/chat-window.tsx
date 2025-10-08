// "use client";

// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Avatar,
// } from "@mui/material";
// import {
//   ArrowLeft,
//   Search,
//   MoreVertical,
//   Smile,
//   Paperclip,
//   Mic,
// } from "lucide-react";
// import { useTheme } from "@mui/material/styles";
// import MessageBubble from "./message-bubble";
// import { useState, useEffect } from "react";

// interface ChatWindowProps {
//   selectedChat: string | null;
//   onBack: () => void;
//   isMobile: boolean;
// }

// export default function ChatWindow({ 
//   selectedChat, 
//   onBack, 
//   isMobile 
// }: ChatWindowProps) {
//   const theme = useTheme();

//   // Initialize messages with default values, update when user is selected
//   const [messages, setMessages] = useState([
//     { id: 1, text: "Hello 👋", isSender: false },
//     { id: 2, text: "Hi! 😄", isSender: true }, // Default message without user name
//   ]);

//   // Update messages when selectedChat changes
//   useEffect(() => {
//     if (selectedChat && messages.length === 2) {
//       // Only update if we haven't customized the message yet
//       setMessages(prev => [
//         prev[0],
//         { 
//           ...prev[1], 
//           text: `Hi ${selectedChat}! 😄` 
//         }
//       ]);
//     }
//   }, [selectedChat]);

//   const handleSendMessage = (text: string) => {
//     if (text.trim() && selectedChat) {
//       setMessages(prev => [...prev, {
//         id: Date.now(),
//         text,
//         isSender: true
//       }]);
//     }
//   };

//   // Show loading state if no user selected
//   if (!selectedChat) {
//     return (
//       <Box 
//         flex={1} 
//         display="flex" 
//         flexDirection="column"
//         justifyContent="center"
//         alignItems="center"
//         p={2}
//         bgcolor="background.default"
//       >
//         <Typography variant="h6" color="text.secondary">
//           Select a chat to start messaging
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box flex={1} display="flex" flexDirection="column">
//       {/* Chat Header */}
//       <Box
//         display="flex"
//         alignItems="center"
//         justifyContent="space-between"
//         p={2}
//         bgcolor="background.paper"
//         borderBottom="1px solid"
//         borderColor="divider"
//       >
//         <Box display="flex" alignItems="center" gap={2}>
//           {isMobile && (
//             <IconButton onClick={onBack}>
//               <ArrowLeft />
//             </IconButton>
//           )}
//           <Avatar>{selectedChat[0]}</Avatar>
//           <Box>
//             <Typography variant="subtitle1">{selectedChat}</Typography>
//             <Typography variant="caption" color="text.secondary">
//               Online
//             </Typography>
//           </Box>
//         </Box>
//         <Box>
//           <IconButton>
//             <Search />
//           </IconButton>
//           <IconButton>
//             <MoreVertical />
//           </IconButton>
//         </Box>
//       </Box>

//       {/* Messages */}
//       <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
//         {messages.map((message) => (
//           <MessageBubble
//             key={message.id}
//             text={message.text}
//             isSender={message.isSender}
//           />
//         ))}
//       </Box>

//       {/* Chat Input */}
//       <Box
//         display="flex"
//         alignItems="center"
//         p={1}
//         borderTop="1px solid"
//         borderColor="divider"
//         bgcolor="background.paper"
//       >
//         <IconButton>
//           <Smile />
//         </IconButton>
//         <IconButton>
//           <Paperclip />
//         </IconButton>
//         <TextField
//           fullWidth
//           placeholder="Type a message"
//           variant="outlined"
//           size="small"
//           sx={{ mx: 1 }}
//           onKeyPress={(e) => {
//             if (e.key === 'Enter') {
//               const target = e.target as HTMLTextAreaElement;
//               handleSendMessage(target.value);
//               target.value = '';
//             }
//           }}
//         />
//         <IconButton color="primary">
//           <Mic />
//         </IconButton>
//       </Box>
//     </Box>
//   );
// }

"use client";

import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
} from "lucide-react";
import { useTheme } from "@mui/material/styles";
import MessageBubble from "./message-bubble";
import { useState } from "react";
import { useCurrentUser, useMessages, useSendMessage } from "@/react-query/query-hooks"; // ✅ import your hook
import { Conversation } from "@/types/conversation";
import { current } from "@reduxjs/toolkit";
import { ThemeSwitcher } from "./Theme/themeswitcher";
import moment from "moment"
interface ChatWindowProps {
  selectedChat: Conversation | null; // conversationId
  onBack: () => void;
  isMobile: boolean;
}

export default function ChatWindow({
  selectedChat,
  onBack,
  isMobile,
}: ChatWindowProps) {
  const theme = useTheme();
  const { data: currentUser } = useCurrentUser();


  // ✅ fetch messages when a chat is selected
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useMessages(selectedChat?.id ?? "");
console.log(currentUser);
console.log(messages);

  const [newMessage, setNewMessage] = useState("");
  const { mutateAsync } = useSendMessage()
  //  const newMsg = await mutateAsync({
  //         participan: [currentUser?.id, userId],
  //       });
  const handleSendMessage = async (text: string) => {
    if (text.trim() && selectedChat) {
      await mutateAsync({
      conversationId: selectedChat.id,   // ✅ from your current chat
      text,                              // ✅ the input message
      type: "TEXT",                      // ✅ for now fixed to TEXT
    });

      setNewMessage("");
    }
  };

  // If no chat is selected
  if (!selectedChat) {
  //    const {data: currentUser=[], isLoading: isLoadingCurrentUser,error:currentUserError}=useCurrentUser()
    
  //   const otherUser = selectedChat?.participants.find(
  //   (p) => p.id !== currentUser?.id
  // );
    return (
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={2}
        bgcolor="background.default"
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }
  const otherUser = selectedChat.participants.find(
    (p) => p.id !== currentUser?.id
  );
  return (
    <Box flex={1} display="flex" flexDirection="column">
      {/* Chat Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        bgcolor="background.paper"
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Box display="flex" alignItems="center" gap={2}>
          {isMobile && (
            <IconButton onClick={onBack}>
              <ArrowLeft />
            </IconButton>
          )}
          <Avatar>{otherUser?.userName[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">
               {otherUser?.userName ?? "Unknown User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Online
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton>
            <Search />
          </IconButton>
            <ThemeSwitcher/>
          <IconButton>
            <MoreVertical />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : isError ? (
          <Typography color="error">Failed to load messages</Typography>
        ) : messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column"
            color="text.secondary"
          >
            <Typography variant="body2">No messages yet</Typography>
            <Typography variant="caption">Start the conversation 👋</Typography>
          </Box>
        ) : (
          messages.map((message: any) => (            
            <MessageBubble
              key={message.id}
              text={message.text}
              timeStamp={message.createdAt}
              isSender={message.sender.id === currentUser.id}
            />
          ))
        )}

      </Box>

      {/* Chat Input */}
      <Box
        display="flex"
        alignItems="center"
        p={1}
        borderTop="1px solid"
        borderColor="divider"
        bgcolor="background.paper"
      >
        <IconButton>
          <Smile />
        </IconButton>
        <IconButton>
          <Paperclip />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Type a message"
          variant="outlined"
          size="small"
          sx={{ mx: 1 }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(newMessage);
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSendMessage(newMessage)}
        >
          <Mic />
        </IconButton>
      </Box>
    </Box>
  );
}

