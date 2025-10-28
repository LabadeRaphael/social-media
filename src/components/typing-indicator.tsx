"use client";
import React from "react";
import { Typography, Box } from "@mui/material";
import {useTypingIndicator} from "@/react-query/query-hooks";

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId,
}) => {
  const typingUser = useTypingIndicator(conversationId, currentUserId);
  // console.log('typinguser',typingUser);
  
  if (!typingUser) return null;

  return (
    <Box sx={{ px: 2, py: 0.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontStyle: "italic",
          color: "text.secondary",
        }}
      >
        Typing...
      </Typography>
    </Box>
  );
};

export default TypingIndicator;
