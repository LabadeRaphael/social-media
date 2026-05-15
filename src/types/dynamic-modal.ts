export interface DynamicModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  disabled?:boolean|string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode; // allows inputs inside
}