"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import { Check, CheckCheck } from "lucide-react"; // ✅ nice tick icons

interface MessageBubbleProps {
  text: string;
  timeStamp: string;
  unreadcount: number;
  isSender: boolean;
}
export default function MessageBubble({ text, isSender, timeStamp, unreadcount }: MessageBubbleProps) {
  console.log("Mr unread", unreadcount)
  // if(unreadcount){
  // }
  // const theme = useTheme();

  const formatTime = (timeStamp: string) => {
    const now = moment();
    const msgTime = moment(timeStamp);

    if (now.isSame(msgTime, "day")) {
      return `Today ${msgTime.format("hh:mm A")}`;
    } else if (now.clone().subtract(1, "day").isSame(msgTime, "day")) {
      return `Yesterday ${msgTime.format("hh:mm A")}`;
    } else {
      return msgTime.format("MMM D, hh:mm A");
    }

  }
   // ✅ Determine tick type only for sender
  const getTickIcon = () => {
    if (!isSender) return null;

    // When you send a message, unreadCount represents how many messages the RECEIVER hasn’t read yet.
    // So: 0 = read by receiver, >0 = not yet read.

    if (unreadcount > 0) {
      // Not yet read → gray ✓✓
      return <CheckCheck size={16} color="#888" />;
    }

    // ✅ Read by receiver → blue ✓✓
    return <CheckCheck size={16} color="#0084ff" />;
  };
  return (
    <Box
      mb={2}
      display="flex"
      flexDirection="column"
      alignItems={isSender ? "flex-end" : "flex-start"}
    >
      <Typography
        sx={{
          bgcolor: isSender ? "secondary.main" : "primary.main",
          color: isSender ? "secondary.contrastText" : "primary.contrastText",
          display: "inline-block",
          p: 1.2,
          borderRadius: 2,
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        {text}
        {getTickIcon()}
          {/* {isSender && (
          <Box display="flex" alignItems="center" ml={0.5}>
            {unreadcount === 0 ? (
              <CheckCheck size={16} color="#0084ff" /> // ✅ read (blue)
            ) : unreadcount > 0 ? (
              <CheckCheck size={16} color="#888" /> // ✅ delivered (gray)
            ) : (
              <Check size={16} color="#888" /> // ✅ sent (single gray tick)
            )}
          </Box>
        )} */}
        {/* {unreadcount?"sent message": unreadcount ===0?"read message":"have not read"} */}
        {/* {unreadcount === 0 ? (
          <span style={{ color: "#0084ff" }}>ndn✓✓</span> // read
        ) : (
          "✓✓" // delivered
        )} */}

      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: 0.3,
          fontSize: "0.85rem",
        }}>
        {formatTime(timeStamp)}
      </Typography>
    </Box>
  );
}