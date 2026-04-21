"use client";

import { Box, Typography, IconButton, Stack, Tooltip } from "@mui/material";
import moment from "moment";
import { CheckCheck, Play, Pause, FileText, FileImage, FileMusic, FileVideo, File, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { getFileType } from "./file-type-formater";
import FileCard from "./file-card";
import TypingIndicator from "./typing-indicator";

interface MessageBubbleProps {
  text?: string;
  timeStamp: string;
  isRead: boolean;
  isSender: boolean;
  type: "TEXT" | "VOICE" | "DOCUMENT";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  selectedId?: string
  currentUserId?: string
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
  selectedId,
  currentUserId
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
  // const { data: currentUser } = useCurrentUser();
  const getTickIcon = () => {
    if (!isSender) return null;
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <CheckCheck size={16} color={isRead ? "#0084ff" : "#888"} />
      </Box>
    )
  };

  // VOICE state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloading, setDownloading] = useState(false);
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

  const fileType = getFileType(fileName!);
  const getFileIcon = (fileName?: string) => {

    const ext = fileName?.split(".").pop()?.toLowerCase();

    if (!ext) return File;

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return FileImage;
    if (["mp3", "wav", "ogg"].includes(ext)) return FileMusic;
    if (["mp4", "mov", "webm"].includes(ext)) return FileVideo;
    if (["pdf", "docx"].includes(ext)) return FileText;
    return File; // fallback for unknown types
  };
  const FileIcon = getFileIcon(fileName);
  // console.log("fileIcon",FileIcon);
  // const downloadUrl = mediaUrl?.replace(
  //   "/upload/",
  //   "/upload/fl_attachment/"
  // )
  const handleDownload = async () => {
    if (!mediaUrl) return;
    console.log("mediaUrl", mediaUrl);
    setDownloading(true);
    try {
      const res = await fetch(mediaUrl);
      console.log("both", res, mediaUrl);

      const blob = await res.blob();
      console.log("blob", blob);

      const url = window.URL.createObjectURL(blob);
      console.log("url", url);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download"; // 👈 your real name here
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Box
      mb={2}
      display="flex"
      flexDirection="column"
      alignItems={isSender ? "flex-end" : "flex-start"}
    >
      {(type === 'TEXT' && text) || (type === 'VOICE' && mediaUrl) ? (

        <Box
          sx={{
            // bgcolor: mode === 'light' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
            bgcolor: isSender ? mode === 'light' ? "#18033bff" : theme.palette.primary.main : mode === 'light' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
            color: mode === 'light' ? "secondary.contrastText" : "primary.contrastText",
            p: 1.2,
            borderRadius: 2,
            maxWidth: "70%",
            wordBreak: "break-word",
          }}
        >
          {/* TEXT MESSAGE */}
          {type === "TEXT" && text != null && (
            <>
              <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                {text}
              </Typography>
              {getTickIcon()}
            </>
          )}
          {/* DOCUMENT */}



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
      {type === "DOCUMENT" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // mx:"auto",
            // justifyItems:"space-between",
            ml: 2,
            mb: 2,
            border: `1px solid ${theme.palette.mode === "light"
              ? theme.palette.secondary.main
              : theme.palette.secondary.contrastText}`,

            borderRadius: 2,
            maxWidth: 250,
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 250,
              height: 200,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "#f5f5f5",
              backgroundColor: `${theme.palette.mode === "light"
                ? theme.palette.secondary.main
                : theme.palette.secondary.contrastText}`,
              overflow: "hidden",
            }}
          >

            <FileCard
              mediaUrl={mediaUrl}
              fileName={fileName}
              theme={theme}
            />
          </Box>
          <Typography>{fileName}</Typography>
          <Stack direction={"row"} gap={1} mb={1}>
            <Typography>{fileType}</Typography>
            <Typography fontSize={16} fontWeight={"bold"} mt={0.3}> {formatFileSize(fileSize!)}</Typography>

            {mediaUrl &&
              <Tooltip title="Download">
                <IconButton
                  onClick={handleDownload}
                  disabled={downloading}
                  sx={{
                    ml: "30px",
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? theme.palette.secondary.main
                        : theme.palette.secondary.contrastText,

                    color:
                      theme.palette.mode === "light"
                        ? theme.palette.secondary.contrastText
                        : theme.palette.secondary.main,

                    transition: "all 0.2s ease",

                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.secondary.main
                          : theme.palette.secondary.contrastText,

                      transform: "scale(1.05)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Download size={18} />
                </IconButton>
              </Tooltip>
            }
          </Stack>

        </Box>


      )}

      <Typography
        variant="body2"
        sx={{ mt: 0.3, fontSize: "0.8rem", color: "text.secondary" }}
      >
        {formatTime(timeStamp)}
      </Typography>
      <TypingIndicator
        conversationId={selectedId!}
        currentUserId={currentUserId!}
      />
    </Box>
  );
}
