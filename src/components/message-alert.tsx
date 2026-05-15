"use client";

import { Box, Typography } from "@mui/material";
import {MessageAlertProps} from "@/types/MessageAlertProps"
const MessageAlert = ({ message, status }: MessageAlertProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 1.5,
        borderLeft: 6, // left side border
        borderColor: status ? "success.main" : "error.main",
        backgroundColor: status
          ? "rgba(76, 175, 80, 0.08)" // light green bg
          : "rgba(244, 67, 54, 0.08)", // light red bg
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        color={status ? "success.main" : "error.main"}
      >
        {message}
      </Typography>
    </Box>
  );
}

export default MessageAlert