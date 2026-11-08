import { AlertColor } from "@mui/material";

export interface MessageAlertProps {
  message: string;
  status?: boolean;
  severity?: AlertColor;
  onClose?: () => void;
};