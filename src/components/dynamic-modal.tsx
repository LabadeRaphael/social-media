import { Box, Typography, Button } from "@mui/material";
import React from "react";

interface DynamicModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <Box
      onClick={onClose} 
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          width: "90%",
          maxWidth: 400,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" mb={2}>
            {description}
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>

          <Button
            variant="contained"
            color={confirmColor as any}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DynamicModal;