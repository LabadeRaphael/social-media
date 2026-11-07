"use client";

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Globe } from "lucide-react";
interface GoogleAuthButtonProps {
  onError?: (message: string) => void;
}

export default function GoogleAuthButton({
  onError,
}: GoogleAuthButtonProps) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log(apiUrl);
    
    if (!apiUrl) {
      onError?.("Authentication server is not configured.");
      return;
    }

    setLoading(true);

    window.location.assign(
      `${apiUrl.replace(/\/$/, "")}/auth/google`
    );
  };

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {/* OR Divider */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            flex: 1,
            height: "1px",
            bgcolor: "divider",
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          OR
        </Typography>

        <Box
          sx={{
            flex: 1,
            height: "1px",
            bgcolor: "divider",
          }}
        />
      </Stack>

      {/* Google Authentication Button */}
      <Button
        fullWidth
        variant="outlined"
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        startIcon={<Globe size={20} strokeWidth={1.8}/>}
        sx={{
          textTransform: "none",
          borderRadius: { xs: 1, sm: 2 },
          py: { xs: 1.1, sm: 1.3 },
          fontWeight: 600,
          fontSize: {
            xs: "0.85rem",
            sm: "0.9rem",
            md: "1rem",
          },
          borderColor: "divider",
          color: "text.primary",
          transition: "all 0.2s ease",

          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor:
              mode === "light"
                ? "rgba(0,0,0,0.03)"
                : "rgba(255,255,255,0.05)",
          },

          "&.Mui-disabled": {
            opacity: 0.7,
          },
        }}
      >
        {loading ? "Connecting to Google..." : "Continue with Google"}
      </Button>
    </Stack>
  );
}