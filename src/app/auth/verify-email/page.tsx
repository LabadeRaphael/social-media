
"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  MailCheck,
  ShieldCheck,
  CircleAlert,
  RefreshCw,
  ArrowLeft,
  Mail,
} from "lucide-react";

import {
  useVerifyEmail,
  useResendVerification,
} from "@/react-query/user-hook";
import SessionLoader from "@/components/session-loader";

// Email validation
const ResendSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

type VerificationStatus =
  | "checking"
  | "success"
  | "error"
  | "missing";

const getErrorMessage = (error: unknown): string => {
  const err = error as {
    message?: string | string[];
    response?: {
      data?: {
        message?: string | string[];
      };
    };
  };

  const message =
    err?.response?.data?.message ?? err?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return typeof message === "string"
    ? message
    : "We couldn't verify your email. Please try again.";
};

function VerifyEmailContent() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const [status, setStatus] =
    useState<VerificationStatus>("checking");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [resendMessage, setResendMessage] =
    useState("");

  const [resendSuccess, setResendSuccess] =
    useState(false);

  // Prevent duplicate verification requests in React Strict Mode.
  const processedToken = useRef<string | null>(null);

  const isDark = mode === "dark";

  const accentColor = theme.palette.primary.main;

  const handleVerification = (verificationToken: string) => {
    setStatus("checking");
    setErrorMessage("");

    verifyEmailMutation.mutate(verificationToken, {
      onSuccess: () => {
        setStatus("success");
      },

      onError: (error) => {
        const message = getErrorMessage(error);

        setErrorMessage(message);
        setStatus("error");
      },
    });
  };

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    if (processedToken.current === token) {
      return;
    }

    processedToken.current = token;

    handleVerification(token);
  }, [token]);

  const handleRetry = () => {
    if (!token) return;

    processedToken.current = token;
    verifyEmailMutation.reset();

    handleVerification(token);
  };

  const handleResend = async (
    email: string,
    resetForm: () => void
  ) => {
    setResendMessage("");
    setResendSuccess(false);

    try {
      const response =
        await resendVerificationMutation.mutateAsync(email);

      setResendSuccess(true);

      setResendMessage(
        response?.message ||
          "If an unverified account exists for that email, a verification link will be sent."
      );

      resetForm();
    } catch (error) {
      setResendSuccess(false);

      setResendMessage(
        getErrorMessage(error)
      );
    }
  };

  const isChecking = status === "checking";
  const isVerified = status === "success";
  const hasFailed =
    status === "error" || status === "missing";

  const getStatusContent = () => {
    if (isChecking) {
      return {
        icon: <CircularProgress size={42} thickness={4} />,
        // icon: <SessionLoader/>,
        title: "Verifying your email",
        description:
          "Please wait while we securely verify your email address.",
      };
    }

    if (isVerified) {
      return {
        icon: <ShieldCheck size={48} />,
        title: "Email verified successfully!",
        description:
          "Your email address has been confirmed. Your Nestfinity account is ready for you.",
      };
    }

    if (status === "missing") {
      return {
        icon: <CircleAlert size={48} />,
        title: "Verification link missing",
        description:
          "We couldn't find a verification token in this link. Please check your email or request a new verification link.",
      };
    }

    return {
      icon: <CircleAlert size={48} />,
      title: "Verification unsuccessful",
      description: errorMessage,
    };
  };

  const statusContent = getStatusContent();

  const statusColor = isVerified
    ? isDark
      ? accentColor
      : theme.palette.success.main
    : hasFailed
      ? theme.palette.error.main
      : accentColor;

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: { xs: 1, sm: 2 },
          overflow: "hidden",
          width: { xs: "100%", sm: "90%", md: "80%", lg: 900 },
          maxWidth: "100%",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "5fr 7fr",
            },
            minHeight: { md: 530 },
          }}
        >
          {/* Branding section */}
          <Box
            sx={{
              backgroundColor: isDark
                ? theme.palette.background.default
                : theme.palette.primary.contrastText,
              color: isDark
                ? theme.palette.text.primary
                : theme.palette.background.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: { xs: 3, sm: 4, md: 5 },
            }}
          >
            <Box>
              <Image
                src="/logo.png"
                alt="Nestfinity logo"
                width={70}
                height={70}
                priority
                style={{
                  borderRadius: "50%",
                }}
              />

              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  fontSize: {
                    xs: "1.5rem",
                    sm: "1.8rem",
                    md: "2rem",
                  },
                  mt: 2,
                  mb: 1,
                }}
              >
                Nestfinity
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: {
                    xs: "0.85rem",
                    sm: "0.95rem",
                  },
                  opacity: 0.85,
                }}
              >
                Secure connections start with
                a verified email address.
              </Typography>
            </Box>
          </Box>

          {/* Verification section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: {
                xs: 3,
                sm: 4,
                md: 5,
              },
            }}
          >
            <Stack
              spacing={2.5}
              alignItems="center"
              textAlign="center"
            >
              {/* Status icon */}
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: statusColor,
                  backgroundColor: isVerified
                    ? isDark
                      ? "rgba(255,194,68,0.12)"
                      : theme.palette.success.light
                    : hasFailed
                      ? theme.palette.error.light
                      : "rgba(255,194,68,0.12)",
                }}
              >
                {statusContent.icon}
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: {
                      xs: "1.35rem",
                      sm: "1.55rem",
                      md: "1.75rem",
                    },
                    mb: 1,
                  }}
                >
                  {statusContent.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    maxWidth: 420,
                    mx: "auto",
                  }}
                >
                  {statusContent.description}
                </Typography>
              </Box>

              {/* Verification loading information */}
              {isChecking && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  This should only take a moment...
                </Typography>
              )}

              {/* Successful verification */}
              {isVerified && (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() =>
                    router.replace("/auth/login")
                  }
                  sx={{
                    mt: 1,
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                >
                  Continue to Login
                </Button>
              )}

              {/* Failed verification */}
              {hasFailed && (
                <Stack
                  spacing={2}
                  width="100%"
                  sx={{ mt: 1 }}
                >
                  {status === "error" && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleRetry}
                      disabled={verifyEmailMutation.isPending}
                      startIcon={<RefreshCw size={17} />}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                    >
                      Try verification again
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      router.push("/auth/login")
                    }
                    startIcon={<ArrowLeft size={17} />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      borderColor: accentColor,
                      color: "text.primary",
                      textTransform: "none",
                    }}
                  >
                    Back to Login
                  </Button>

                  <Box
                    sx={{
                      width: "100%",
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 0.5 }}
                    >
                      Need a new verification link?
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Enter your email address below
                      to request another verification email.
                    </Typography>

                    {resendMessage && (
                      <Alert
                        severity={
                          resendSuccess ? "success" : "error"
                        }
                        sx={{
                          mb: 2,
                          textAlign: "left",
                          ...(isDark && resendSuccess
                            ? {
                                backgroundColor:
                                  "rgba(255,194,68,0.12)",
                                color: accentColor,
                              }
                            : {}),
                        }}
                      >
                        {resendMessage}
                      </Alert>
                    )}

                    <Formik
                      initialValues={{ email: "" }}
                      validationSchema={ResendSchema}
                      onSubmit={async (
                        values,
                        { setSubmitting, resetForm }
                      ) => {
                        try {
                          await handleResend(
                            values.email.trim(),
                            resetForm
                          );
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        isSubmitting,
                        isValid,
                        dirty,
                      }) => (
                        <Form>
                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Email address"
                              name="email"
                              type="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.email &&
                                Boolean(errors.email)
                              }
                              helperText={
                                touched.email
                                  ? errors.email
                                  : " "
                              }
                              InputProps={{
                                startAdornment: (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mr: 1,
                                      color: "text.secondary",
                                    }}
                                  >
                                    <Mail size={18} />
                                  </Box>
                                ),
                              }}
                            />

                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              disabled={
                                !isValid ||
                                !dirty ||
                                isSubmitting ||
                                resendVerificationMutation.isPending
                              }
                              startIcon={
                                <RefreshCw size={17} />
                              }
                              sx={{
                                py: 1.2,
                                borderRadius: 2,
                                fontWeight: "bold",
                                textTransform: "none",
                              }}
                            >
                              {isSubmitting ||
                              resendVerificationMutation.isPending
                                ? "Sending verification email..."
                                : "Resend verification email"}
                            </Button>
                          </Stack>
                        </Form>
                      )}
                    </Formik>
                  </Box>
                </Stack>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ pt: 1 }}
              >
                © {new Date().getFullYear()} Nestfinity.
                All rights reserved.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

function VerificationFallback() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <CircularProgress
        sx={{ color: theme.palette.primary.main }}
      />
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
