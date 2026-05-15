"use client";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import { X, Check, Loader2 } from "lucide-react";
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

  const fileType = getFileType(fileName);
  console.log("fileType", fileType);

  const shortenFileName = (name: string, maxLength: number = 20) => {
    const ext = name.split(".").pop();
    const baseName = name.replace(`.${ext}`, "");
    if (name.length <= maxLength) return name; // short enough
    const start = baseName.slice(0, maxLength / 2);
    const end = baseName.slice(-maxLength / 2);
    return `${start}…${end}.${ext}`;
  };

  console.log("isSending", isSending);

  const theme = useTheme();
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
