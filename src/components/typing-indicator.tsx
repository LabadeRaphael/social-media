"use client";
import React from "react";
import { Typography, Box } from "@mui/material";
import {useTypingIndicator} from "@/react-query/query-hooks";

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
  fallback?:any
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId,
  fallback
 
}) => {
  const typingUser = useTypingIndicator(conversationId, currentUserId);
  
  if (!typingUser){
    return <>{fallback}</>
  } 

  return (
    <Box sx={{ py: 0.5 }}>
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
