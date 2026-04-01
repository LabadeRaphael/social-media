"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/api/axiosInstance";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyRecoverAccountPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid recovery link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post("/auth/recover-account-verify", { token });

        setStatus("success");
        setMessage(res.data.message || "Account restored successfully");

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Recovery link expired or invalid"
        );
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          width: { xs: "100%", sm: "90%", md: "80%", lg: 900 },
          background:
            mode === "light"
              ? "rgba(255,255,255,0.95)"
              : "rgba(18,18,18,0.95)",
                            color: mode === "light" ? theme.palette.background.paper : theme.palette.background.default,
        }}
      >
        <Grid container>
          {/* LEFT SIDE */}
          <Grid
            item
            xs={12}
            md={5}
            lg={6}
            sx={{
              backgroundColor:
                mode === "light"
                  ? theme.palette.primary.contrastText
                  : theme.palette.secondary.contrastText,
                  
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
              textAlign: "center",
            }}
          >
            <Box>
              <Image
                src="/logo.png"
                alt="Nestfinity logo"
                height={70}
                width={70}
                style={{ borderRadius: "50%" }}
              />
              <Typography variant="h4" fontWeight="bold" mt={1}>
                Nestfinity
              </Typography>
              <Typography variant="body2">
                Secure account recovery
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT SIDE */}
          <Grid
            item
            xs={12}
            md={7}
            lg={6}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
               color: mode === "light" ? "red" : theme.palette.background.default,
            }}
          >
            {status === "loading" && <CircularProgress />}

            <Typography variant="h5" fontWeight="bold" mt={2}>
              {message}
            </Typography>

            {status === "success" && (
              <Typography variant="body2" mt={1}>
                Redirecting to login...
              </Typography>
            )}

            {status === "error" && (
              <Typography variant="body2" mt={1} color="error">
                Please request a new recovery link.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}