"use client";

import { Box, Typography, IconButton } from "@mui/material";
import moment from "moment";
import { CheckCheck, Play, Pause, FileText,  FileImage, FileMusic, FileVideo, File,Download } from "lucide-react";
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
  // const downloadFile = async () => {
  //   if (!mediaUrl) return;

  //   try {
  //     const response = await fetch(mediaUrl);
  //     console.log(response);

  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = fileName ?? "file.jpg"; // fallback filename
  //     link.click();

  //     // Clean up
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //   }
  // };


  // const downloadableUrl = mediaUrl?.replace("/image/upload", "/raw/upload");


  // console.log("from document ", fileSize, fileName);
  const getFileType = (name?: string) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    // console.log("fileType", ext);
    if (!ext) return "unknown";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    if (["mp4", "mov", "webm"].includes(ext)) return "video";
    if (["pdf", "docx"].includes(ext)) return "pdf";
    return "other";
  };
  const fileType = getFileType(fileName);
  const getFileIcon = (fileName?: string) => {
  
    const ext = fileName?.split(".").pop()?.toLowerCase();
    // console.log("ext",fileName);
    // console.log("ext",ext);
    
    if (!ext) return File;

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return FileImage;
    if (["mp3", "wav", "ogg"].includes(ext)) return FileMusic;
    if (["mp4", "mov", "webm"].includes(ext)) return FileVideo;
    if (["pdf", "docx"].includes(ext)) return FileText;
    return File; // fallback for unknown types
  };
  const FileIcon = getFileIcon(fileName);
  // console.log("fileIcon",FileIcon);
  
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
          {/* <Box
            component="img"
            src={mediaUrl}
            alt="document"
            sx={{
              width: 250,
              height: 200,
              objectFit: "cover",
              borderRadius: 2,
              // mt: 1,
              cursor: "pointer",
            }} /> */}
          {/* Preview based on type */}
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
            {fileType === "image" && (
              <Box
                component="img"
                src={mediaUrl}
                alt={fileName}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {fileType === "audio" && (
              <audio controls style={{ width: "100%" }}>
                <source src={mediaUrl} />
                Your browser does not support the audio element.
              </audio>
            )}

            {fileType === "video" && (
              <video controls style={{ width: "100%", height: "100%" }}>
                <source src={mediaUrl} />
                Your browser does not support the video element.
              </video>
            )}

            {fileType === "pdf" && (
              <Box sx={{
                textAlign: "center",
                color: `${theme.palette.mode === "light"
                  ? theme.palette.secondary.contrastText
                  : theme.palette.secondary.main}`
              }}>
                <FileIcon size={48} />
                <Typography variant="subtitle2">PDF Preview</Typography>
              </Box>
            )}

            {fileType === "other" && (
              <Box sx={{ textAlign: "center" }}>
                <FileIcon size={48} />
                <Typography variant="subtitle2">Preview Not Available</Typography>
              </Box>
            )}
          </Box>
          <Typography>{fileName}</Typography>
          <Typography fontSize={12}>{formatFileSize(fileSize!)}</Typography>

          <FileIcon size={22} />

          {/* Download Button */}
        </Box>


      )}

      <Typography
        variant="body2"
        sx={{ mt: 0.3, fontSize: "0.8rem", color: "text.secondary" }}
      >
        {formatTime(timeStamp)}
      </Typography>
    </Box>
  );
}
