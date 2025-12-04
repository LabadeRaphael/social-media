"use client";

import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { FileText, X, Check } from "lucide-react"; // X = cancel, Check = send

interface PreviewDocumentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  onSend: () => void;
  onCancel: () => void;
}

export default function DocumentPreview({
  fileUrl,
  fileName,
  fileSize,
  onSend,
  onCancel,
}: PreviewDocumentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ml:2,
        mb:2,
        border: "1px solid #ccc",
        borderRadius: 2,
        maxWidth: 250,
        gap: 1,
      }}
    >
      <Box
        component="img"
        src={fileUrl}
        alt="document preview"
        sx={{
          width: 250,
          height: 200,
          objectFit: "cover",
          borderRadius: 2,
        }}
      />
      <Typography fontWeight={600}>{fileName}</Typography>
      <Typography fontSize={12}>{formatFileSize(fileSize)}</Typography>
      <FileText size={22} />
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
         <Tooltip title={"Cancel"}>
            <IconButton
            onClick={onCancel}
            color="error"
            size="small"
            >
            <X size={30} />
            </IconButton>
         </Tooltip>
        <Tooltip title={"Send"}>
        <IconButton
          onClick={onSend}
          color="primary"
          size="small"
        >
          <Check size={30} />
        </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
