import { Box, Typography } from "@mui/material";
import { FileIcon } from "lucide-react";

const FileCard = ({
  mediaUrl,
  fileName,
  theme,
  sx = {},
}) => {
   
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

    console.log("fileName", fileType);
  switch (fileType) {
    case "image":
      return (
        <Box
          component="img"
          src={mediaUrl}
          alt={fileName}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...sx,
          }}
        />
      );

    case "audio":
      return (
        <audio controls style={{ width: "100%" }}>
          <source src={mediaUrl} />
          Your browser does not support the audio element.
        </audio>
      );

    case "video":
      return (
        <video controls style={{ width: "100%", height: "100%" }}>
          <source src={mediaUrl} />
          Your browser does not support the video element.
        </video>
      );

    case "pdf":
      return (
        <Box
          sx={{
            textAlign: "center",
            color:
              theme.palette.mode === "light"
                ? theme.palette.secondary.contrastText
                : theme.palette.secondary.main,
            ...sx,
          }}
        >
          <FileIcon size={48} />
          <Typography variant="subtitle2">PDF Preview</Typography>
        </Box>
      );

    default:
      return (
        <Box sx={{ textAlign: "center", ...sx }}>
          <FileIcon size={48} />
          <Typography variant="subtitle2">
            Preview Not Available
          </Typography>
        </Box>
      );
  }
};

export default FileCard
