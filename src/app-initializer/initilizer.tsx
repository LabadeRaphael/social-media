"use client";

import { useUserToken } from "@/react-query/user-hook";
import {
  clearTokenRefresh,
  scheduleTokenRefresh,
} from "@/utils/token-scheduler";

import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import SessionLoader from "@/components/session-loader";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Include the actual routes used by your Next.js application.
  const AUTH_PAGES = [
    "/auth/login",
    "/auth/signup",
  ];

  const OTHER_PUBLIC_PAGES = [
    "/forgot-password",
    "/reset-password",
    "/recover-account",
    "/recover-account-verify",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/recover-account",
    "/auth/recover-account-verify",
  ];

  const matchesRoute = (routes: string[]) =>
    routes.some(
      (route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

  const isAuthPage = matchesRoute(AUTH_PAGES);
  const isOtherPublicPage = matchesRoute(OTHER_PUBLIC_PAGES);

  const shouldCheckSession = !isOtherPublicPage;
  console.log("shouldCheckSession", shouldCheckSession);

  const {
    data: user,
    isSuccess,
    isError,
    isPending,
    isFetching,
    error,
    refetch,
  } = useUserToken(shouldCheckSession);
  console.log("user", user);

  const isUnauthorized =
    axios.isAxiosError(error) &&
    error.response?.status === 401;

  const hasValidSession =
    isSuccess && Boolean(user?.accessTokenExpireAt);

  const isCheckingAuth =
    isAuthPage && (isPending || isFetching);

  const shouldShowError =
    isAuthPage &&
    !isFetching &&
    isError

  // Schedule automatic access-token renewal.
  useEffect(() => {
    if (!hasValidSession || isFetching) return;

    scheduleTokenRefresh(user.accessTokenExpireAt, router);

    return () => {
      clearTokenRefresh();
    };
  }, [
    hasValidSession,
    isFetching,
    user?.accessTokenExpireAt,
    router,
  ]);

  // Redirect authenticated users away from login/signup.
  useEffect(() => {
    if (!isAuthPage || isFetching || !hasValidSession) return;

    router.replace("/dashboard/chats");
  }, [
    isAuthPage,
    isFetching,
    hasValidSession,
    router,
  ]);

  // Session verification screen.
  if (isCheckingAuth) {
    return <SessionLoader />;

  }

  // Network/server error screen.
  if (shouldShowError) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{ maxWidth: 380, textAlign: "center" }}
        >
          <Typography variant="h5" fontWeight={700}>
            Unable to verify your session
          </Typography>

          <Typography color="text.secondary">
            We couldn't connect to our authentication service.
            Please check your internet connection and try again.
          </Typography>

          <Button
            variant="contained"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </Stack>
      </Box>
    );
  }

  // Valid session: redirect is taking place.
  if (isAuthPage && hasValidSession) {
    return <SessionLoader />;
  }

  // Invalid refresh session: display the requested login/signup page.
  return <>{children}</>;
}
