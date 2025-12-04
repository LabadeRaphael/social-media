"use client";

import { Box, Typography, IconButton } from "@mui/material";
import moment from "moment";
import { CheckCheck, Play, Pause, FileText, Download } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
interface MessageBubbleProps {
  text?: string;
  timeStamp: string;
  isRead: boolean;
  isSender: boolean;
  type: "TEXT" | "VOICE" | "DOCUMENT";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
}


export default function MessageBubble({
  text,
  isSender,
  timeStamp,
  isRead,
  type,
  mediaUrl,
  fileName,
  fileSize,
}: MessageBubbleProps) {
  const formatTime = (timeStamp: string) => {
    const now = moment();
    const msgTime = moment(timeStamp);

    if (now.isSame(msgTime, "day")) return `Today ${msgTime.format("hh:mm A")}`;
    if (now.clone().subtract(1, "day").isSame(msgTime, "day"))
      return `Yesterday ${msgTime.format("hh:mm A")}`;
    return msgTime.format("MMM D, hh:mm A");
  };
  const theme = useTheme();
  const mode = theme.palette.mode;

  const getTickIcon = () => {
    if (!isSender) return null;
    return <CheckCheck size={16} color={isRead ? "#0084ff" : "#888"} />;
  };

  // VOICE state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const timeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const loadMetadata = () => setDuration(audio.duration);
    const ended = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", timeUpdate);
    audio.addEventListener("loadedmetadata", loadMetadata);
    audio.addEventListener("ended", ended);

    return () => {
      audio.removeEventListener("timeupdate", timeUpdate);
      audio.removeEventListener("loadedmetadata", loadMetadata);
      audio.removeEventListener("ended", ended);
    };
  }, [mediaUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
const downloadFile = async () => {
  if (!mediaUrl) return;

  try {
    const response = await fetch(mediaUrl);
    console.log(response);
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName ?? "file.jpg"; // fallback filename
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
  }
};



  console.log("from document ", fileSize, fileName);


  return (
    <Box
      mb={2}
      display="flex"
      flexDirection="column"
      alignItems={isSender ? "flex-end" : "flex-start"}
    >
      {(type === 'TEXT' && text) || (type === 'VOICE' && mediaUrl) || (type === 'DOCUMENT' && mediaUrl) ? (

        <Box
          sx={{
            bgcolor: mode === 'light' ? theme.palette.secondary.main : theme.palette.secondary.contrastText,
            color: mode === 'light' ? "secondary.contrastText" : "primary.contrastText",
            p: 1.2,
            borderRadius: 2,
            maxWidth: "70%",
            wordBreak: "break-word",
          }}
        >
          {/* TEXT MESSAGE */}
          {type === "TEXT" && text != null && (
            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
              {text} {getTickIcon()}
            </Typography>
          )}
          {/* DOCUMENT */}
          {type === "DOCUMENT" && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer"
              }}
              // onClick={() => window.open(mediaUrl, "_blank")}
            >
              <Box
                component="img"
                src={mediaUrl}
                alt="document"
                sx={{
                  width: 200,          
                  height: 200,         
                  objectFit: "cover", 
                  borderRadius: 2,
                  mt: 1,
                  cursor: "pointer",
                }} />
              <Typography>{fileName}</Typography>
              <Typography fontSize={12}>{formatFileSize(fileSize!)}</Typography>

              <FileText size={22} />
                
    {/* Download Button */}
    {/* <a
      href={mediaUrl}
      download={fileName ?? "file.jpg"}
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginTop: "8px",
        color: "inherit",
      }}
    >
      <Download size={20} />
      <Typography fontSize={14}>Download</Typography>
    </a> */}
            </Box>
          )}


          {/* VOICE MESSAGE */}
          {type === "VOICE" && mediaUrl && (
            <Box display="flex" alignItems="center" gap={1}

            >
              <IconButton size="small" onClick={togglePlay}>
                {isPlaying ? <Pause size={16} style={{
                  color:
                    theme.palette.mode === "light"
                      ? theme.palette.secondary.contrastText
                      : theme.palette.secondary.main,
                }} /> : <Play size={16} style={{
                  color:
                    theme.palette.mode === "light"
                      ? theme.palette.secondary.contrastText
                      : theme.palette.secondary.main,
                }} />}
              </IconButton>

              {/* Waveform Bars */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flex: 1,
                  height: 20,
                }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 2,
                      height: isPlaying ? `${Math.random() * 100}%` : "20%",
                      bgcolor: isSender && mode === "light" ? theme.palette.secondary.contrastText : theme.palette.secondary.main,
                      borderRadius: 1,
                      transition: "height 0.1s linear",
                    }}
                  />
                ))}
              </Box>

              <Typography variant="caption">{formatDuration(duration)}</Typography>
              {getTickIcon()}

              <audio ref={audioRef} src={mediaUrl} style={{ display: "none" }} />
            </Box>
          )}
        </Box>
      ) : null}

      <Typography
        variant="body2"
        sx={{ mt: 0.3, fontSize: "0.8rem", color: "text.secondary" }}
      >
        {formatTime(timeStamp)}
      </Typography>
    </Box>
  );
}
