"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface MessageBubbleProps {
  text: string;
  isSent: boolean;
}

export default function MessageBubble({ text, isSent }: MessageBubbleProps) {
  const theme = useTheme();
  ;
  // const isSent = 
  return (
    <Box
      mb={2}
      display="flex"
      justifyContent={isSent? "flex-end" : "flex-start"}
    >
      <Typography
        sx={{
          bgcolor: isSent ? "secondary.main" : "primary.main",
          color: isSent ? "secondary.contrastText" : "primary.contrastText",
          display: "inline-block",
          p: 1.2,
          borderRadius: 2,
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}