import { Box, Typography } from "@mui/material";
import {
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  File,
} from "lucide-react";

export const getFileType = (name: string) => {
  const ext = name?.split(".").pop()?.toLowerCase();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Box display="flex" alignItems="center" gap={1}>
      {children}
    </Box>
  );

  if (!ext) {
    return (
      <Wrapper>
        <File size={16} />
        <Typography variant="body2">Unknown</Typography>
      </Wrapper>
    );
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <Wrapper>
        <ImageIcon size={16} />
        <Typography variant="body2">Image</Typography>
      </Wrapper>
    );
  }

  if (["mp3", "wav", "ogg"].includes(ext)) {
    return (
      <Wrapper>
        <Music size={16} />
        <Typography variant="body2">Audio</Typography>
      </Wrapper>
    );
  }

  if (["mp4", "mov", "webm"].includes(ext)) {
    return (
      <Wrapper>
        <Video size={16} />
        <Typography variant="body2">Video</Typography>
      </Wrapper>
    );
  }

  if (["pdf", "docx"].includes(ext)) {
    return (
      <Wrapper>
        <FileText size={16} />
        <Typography variant="body2">PDF</Typography>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <File size={16} />
      <Typography variant="body2">Other</Typography>
    </Wrapper>
  );
};
