export interface PreviewDocumentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  onSend: () => void;
  onCancel: () => void;
  isSending?: boolean;
}