"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import moment from "moment";

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  timeStamp: string;
}

export default function MessageBubble({ text, isSender, timeStamp }: MessageBubbleProps) {
  const theme = useTheme();

  const formatTime = (timeStamp: string) => {
    const now = moment()
    console.log("now ", now);

    const timeDiff = now.diff(moment(timeStamp), 'days')
    console.log("time difference ", timeDiff);

    if (timeDiff < 1) {
      return `Today ${moment(timeStamp).format("hh:mm: A")}`
    } else if (timeDiff === 1) {
      return `yesterday ${moment(timeStamp).format("hh:mm: A")}`
    } else {
      return `${moment(timeStamp).format("MMM D, hh:mm: A")}`
    }
  }
  return (
    <Box
      mb={2}
      display="flex"
      flexDirection="column"
      alignItems={isSender ? "flex-end" : "flex-start"}
    // justifyContent={isSender? "flex-end" : "flex-start"}
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
      </Typography>
      <Typography

        variant="body1"
        sx={{
          mt: 0.3,
          fontSize: "0.85rem",
        }}>
        {/* yesterday */}
        {formatTime(timeStamp)}
      </Typography>
    </Box>
  );
}