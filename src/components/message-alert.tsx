// "use client";

// import { Box, Typography, IconButton } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import { MessageAlertProps } from "@/types/MessageAlertProps";
// import { X } from "lucide-react";

// const MessageAlert = ({ message, status, onClose }: MessageAlertProps) => {
//   const theme = useTheme();

//   const palette = status
//     ? theme.palette.success
//     : theme.palette.error;

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5,
//         p: 1.5,
//         borderRadius: 1.5,
//         borderLeft: 6,
//         borderColor: palette.main,
//         backgroundColor: palette.light,
//       }}
//     >
//       <Typography
//         variant="body2"
//         fontWeight="bold"
//         color={palette.main}
//         sx={{ flex: 1}}
//       >
//         {message}
//       </Typography>

//       {onClose && (
//         <IconButton
//           size="small"
//           onClick={onClose}
//           aria-label="Close alert"
//           sx={{ color: palette.main, mb:"auto"  }}
//         >
//           <X size={18} />
//         </IconButton>
//       )}
//     </Box>
//   );
// };

// export default MessageAlert;

"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MessageAlertProps } from "@/types/MessageAlertProps";
import { X } from "lucide-react";

const MessageAlert = ({
  message,
  status,
  severity,
  onClose,
}: MessageAlertProps) => {
  const theme = useTheme();

  const alertSeverity =
    severity ?? (status ? "success" : "error");

  const palette = theme.palette[alertSeverity];

  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 1.5,
        borderLeft: 6,
        borderColor: palette.main,
        backgroundColor: palette.light,
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        color={palette.dark}
        sx={{ flex: 1 }}
      >
        {message}
      </Typography>

      {onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close alert"
          sx={{ color: palette.dark, mb: "auto" }}
        >
          <X size={18} />
        </IconButton>
      )}
    </Box>
  );
};

export default MessageAlert;