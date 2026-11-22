
"use client";

import Image from "next/image";
import { Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export default function SessionLoader() {
  const theme = useTheme();
  const gold = theme.palette.primary.main;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        overflow: "hidden",
      }}
    >
      <Stack
        alignItems="center"
        spacing={3}
        sx={{ px: 3 }}
      >
        {/* Animated brand mark */}
        <Box
          sx={{
            position: "relative",
            width: 104,
            height: 104,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${alpha(gold, 0.16)}`,
            },

            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: gold,
              borderRightColor: alpha(gold, 0.35),
              animation: "nestfinity-orbit 1.8s linear infinite",
            },

            "@keyframes nestfinity-orbit": {
              "0%": {
                transform: "rotate(0deg)",
              },
              "100%": {
                transform: "rotate(360deg)",
              },
            },

            "@keyframes nestfinity-pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 1,
              },
              "50%": {
                transform: "scale(0.94)",
                opacity: 0.85,
              },
            },

            "@media (prefers-reduced-motion: reduce)": {
              "&::after": {
                animation: "none",
                borderTopColor: gold,
              },
            },
          }}
        >
          {/* Inner logo container */}
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              boxShadow: `0 4px 24px ${alpha(gold, 0.16)}`,
              animation: "nestfinity-pulse 2s ease-in-out infinite",

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            <Image
              src="/logo.png"
              alt="Nestfinity logo"
              width={48}
              height={48}
              priority
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>

        {/* Brand name */}
        <Stack alignItems="center" spacing={0.8}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.8px",
            }}
          >
            Nestfinity
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              letterSpacing: "0.2px",
            }}
          >
            Securely restoring your session
          </Typography>
        </Stack>

        {/* Animated loading indicator */}
        <Stack direction="row" spacing={0.7}>
          {[0, 1, 2].map((item) => (
            <Box
              key={item}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: gold,
                animation: "nestfinity-dots 1.2s ease-in-out infinite",
                animationDelay: `${item * 0.18}s`,

                "@keyframes nestfinity-dots": {
                  "0%, 60%, 100%": {
                    opacity: 0.3,
                    transform: "translateY(0)",
                  },
                  "30%": {
                    opacity: 1,
                    transform: "translateY(-4px)",
                  },
                },

                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  opacity: 0.8,
                },
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
