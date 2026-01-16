"use client";

import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import { FileText, X, Check, Loader2 } from "lucide-react"; 
import { useTheme } from "@mui/material/styles";
import { getFileType } from "./file-type-formater";
import FileCard from "./file-card";
interface PreviewDocumentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  onSend: () => void;
  onCancel: () => void;
  isSending?: boolean;
}

export default function DocumentPreview({
  fileUrl,
  fileName,
  fileSize,
  onSend,
  onCancel,
  isSending,

}: PreviewDocumentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };
  // const getFileType = (name: string) => {
  //   const ext = name.split(".").pop()?.toLowerCase();
  //   console.log("fileType", ext);
  //   if (!ext) return "unknown";

  //   if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  //   if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
  //   if (["mp4", "mov", "webm"].includes(ext)) return "video";
  //   if (["pdf", "docx"].includes(ext)) return "pdf";
  //   return "other";
  // };
  const fileType = getFileType(fileName);
  console.log("fileType", fileType);



  const shortenFileName = (name: string, maxLength: number = 20) => {
    const ext = name.split(".").pop();
    const baseName = name.replace(`.${ext}`, "");
    if (name.length <= maxLength) return name; // short enough
    const start = baseName.slice(0, maxLength / 2);
    const   end = baseName.slice(-maxLength / 2);
    return `${start}…${end}.${ext}`;
  };

  console.log("isSending", isSending);

  const theme = useTheme();
  // const mode = theme.palette.mode;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ml: 2,
        mb: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        maxWidth: 250,
        gap: 1,
      }}
    >
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
       <FileCard
              mediaUrl={fileUrl}
              fileName={fileName}
              theme={theme}
            />
        
        {/* {fileType === "image" && (
          <Box
            component="img"
            src={fileUrl}
            alt={fileName}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {fileType === "audio" && (
          <audio controls style={{ width: "100%" }}>
            <source src={fileUrl} />
            Your browser does not support the audio element.
          </audio>
        )}

        {fileType === "video" && (
          <video controls style={{ width: "100%", height: "100%" }}>
            <source src={fileUrl} />
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
            <FileText size={48} />
            <Typography variant="subtitle2">PDF Preview</Typography>
          </Box>
        )}

        {fileType === "other" && (
          <Box sx={{ textAlign: "center" }}>
            <FileText size={48} />
            <Typography variant="subtitle2">Preview Not Available</Typography>
          </Box>
        )} */}
      </Box>

      <Typography sx={{ textAlign: "center" }} fontWeight={600}>{shortenFileName(fileName)}</Typography>
                <Stack direction={"row"} gap={1} mb={1}>
                  <Typography>{fileType}</Typography>
                  <Typography fontSize={12} fontWeight={"bold"} mt={0.2}> {formatFileSize(fileSize!)}</Typography>
                </Stack>

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Tooltip title={"Cancel"}>
          <IconButton onClick={onCancel} color="error" size="small" disabled={isSending}>
            <X size={30} />
          </IconButton>
        </Tooltip>

        <Tooltip title={"Send"}>
          <IconButton onClick={onSend} color="primary" size="small" disabled={isSending}>
            {isSending ? (
              <Box
                sx={{
                  display: "flex",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <Loader2 size={30} />
              </Box>
            ) : (
              <Check size={30} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

}
