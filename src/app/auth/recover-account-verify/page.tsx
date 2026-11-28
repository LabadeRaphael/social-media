// "use client";

// import {
//     Box,
//     Container,
//     Typography,
//     Paper,
//     CircularProgress,
// } from "@mui/material";
// import Grid from "@mui/material/GridLegacy";
// import { useTheme } from "@mui/material/styles";
// import { useEffect, useState } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import Image from "next/image";
// import api from "@/api/axiosInstance";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ApiMessage } from "@/types/api-response";
// import { verifyRecoverAccount } from "@/api/user";

// export default function VerifyRecoverAccountPage() {
//     const theme = useTheme();
//     const mode = theme.palette.mode;
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     const [apiMessage, setApiMessage] = useState<ApiMessage | null>(null);
//     const [isLoading, setIsLoading] = useState(true)
// const isSuccess = apiMessage?.status === true;
// const isError = apiMessage?.status === false;
//     useEffect(() => {
//         AOS.init({ duration: 800, easing: "ease-in-out", once: true });
//         const token = searchParams.get("token");
//         console.log("token", token);

//         if (!token) {
//             setApiMessage({ message: "Invalid recovery link.", status: false })
//             setIsLoading(false)
//             return;
//         }

//         const verify = async () => {
//             try {
//                 const res = await verifyRecoverAccount(token);
//                 const message = res?.message
//                 const status = res?.status
//                 setApiMessage({ message: message, status: status })
//                 setTimeout(() => {
//                     router.push("/auth/login");
//                 }, 2000);
//             } catch (err: any) {
//                 const message = err?.message || "Recovery link expired or invalid"
//                 const status = err?.data?.status || false
//                 setApiMessage({ message: message, status: status })
//                 console.log(message);
//                 setIsLoading(false)
//             } finally {
//                 setIsLoading(false)
//             }
//         };

//         verify();
//     }, [searchParams, router, setApiMessage]);

//     return (
//         <Container
//             maxWidth="lg"
//             sx={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 px: { xs: 2, sm: 3, md: 4 },
//             }}
//             data-aos="fade-in"
//             data-aos-delay={100}
//         >
//             <Paper
//                 elevation={3}
//                 sx={{
//                     borderRadius: 2,
//                     overflow: "hidden",
//                     width: { xs: "100%", sm: "90%", md: "80%", lg: 900 },
//                     background:
//                         mode === "light"
//                             ? "rgba(255,255,255,0.95)"
//                             : "rgba(18,18,18,0.95)",
//                     // color: mode === "light" ? theme.palette.background.paper : theme.palette.background.default,
//                 }}
//             >
//                 <Grid container>
//                     {/* LEFT SIDE */}
//                     <Grid
//                         item
//                         xs={12}
//                         md={5}
//                         lg={6}
//                         sx={{
//                             backgroundColor:
//                                 mode === "light"
//                                     ? theme.palette.primary.contrastText
//                                     : theme.palette.secondary.contrastText,
//                             color: mode === "light" ? theme.palette.background.paper : theme.palette.background.default,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             p: 4,
//                             textAlign: "center",
//                         }}
//                         data-aos="zoom-in"
//                         data-aos-delay="300"
//                     >
//                         <Box>
//                             <Image
//                                 src="/logo.png"
//                                 alt="Nestfinity logo"
//                                 height={70}
//                                 width={70}
//                                 style={{ borderRadius: "50%" }}
//                             />
//                             <Typography variant="h4" fontWeight="bold" mt={1}>
//                                 Nestfinity
//                             </Typography>
//                             <Typography variant="body2" data-aos="flip-left"
//                                 data-aos-easing="ease-out-cubic"
//                                 data-aos-duration="2000">
//                                 Secure account recovery
//                             </Typography>
//                         </Box>
//                     </Grid>

//                     {/* RIGHT SIDE */}
//                     <Grid
//                         item
//                         xs={12}
//                         md={7}
//                         lg={6}
//                         sx={{
//                             p: 4,
//                             display: "flex",
//                             flexDirection: "column",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             textAlign: "center",
//                             // color: mode === "light" ? "red" : theme.palette.background.default,
//                         }}
//                     >
//                         {/* {status === "loading" && <CircularProgress />} */}
//                         {/* {!isLoading && <CircularProgress />} */}
//                         {isLoading && (
//                             <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
//                                 <CircularProgress  size={30}/>
//                                 <Typography variant="body2">Verifying your account...</Typography>
//                             </Box>
//                         )}
//                         {!isLoading && (
//                             <Typography
//                                 variant="h5"
//                                 fontWeight="bold"
//                                 mt={2}
//                                 color={isSuccess ? "success.main" : "error.main"}
//                             >
//                                 {apiMessage?.message}
//                             </Typography>
//                         )}
                       
//                         {apiMessage?.status ?
//                             <Typography variant="body2" mt={1}>
//                                 Redirecting to login in 2 seconds...
//                             </Typography>
//                             :
//                             <Typography variant="body2" mt={1} color="error">
//                                 Please request a new recovery link.
//                             </Typography>
//                         }
                        
//                     </Grid>
//                 </Grid>
//             </Paper>
//         </Container>
//     );
// }

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/GridLegacy";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CircleAlert,
  ArrowLeft,
} from "lucide-react";
import { useVerifyRecoverAccount } from "@/react-query/user-hook";

type VerificationStatus =
  | "checking"
  | "success"
  | "error"
  | "missing";

const getErrorMessage = (error: any) => {
  const message =
    error?.response?.data?.message ??
    error?.data?.message ??
    error?.message;

  return Array.isArray(message)
    ? message.join(", ")
    : message || "Recovery link expired or invalid.";
};

function VerificationFallback() {
  const theme = useTheme();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={theme.palette.background.default}
    >
      <CircularProgress />
    </Box>
  );
}

function VerifyRecoverAccountContent() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const verifyMutation = useVerifyRecoverAccount();

  const [status, setStatus] =
    useState<VerificationStatus>("checking");

  const [errorMessage, setErrorMessage] = useState("");

  const processedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    if (processedToken.current === token) return;

    processedToken.current = token;

    const verify = async () => {
      setStatus("checking");
      setErrorMessage("");

      try {
        const response = await verifyMutation.mutateAsync(token);

        if (response?.status === false) {
          setErrorMessage(
            response.message || "Unable to verify your recovery link."
          );
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        setStatus("error");
      }
    };

    void verify();
  }, [token, verifyMutation.mutateAsync]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, router]);

  const isChecking = status === "checking";
  const isSuccess = status === "success";
  const hasFailed = status === "error" || status === "missing";

  const title = isChecking
    ? "Verifying your recovery link"
    : isSuccess
      ? "Account recovered successfully!"
      : status === "missing"
        ? "Invalid recovery link"
        : "Recovery verification failed";

  const description = isChecking
    ? "Please wait while we verify your account recovery request."
    : isSuccess
      ? "Your account recovery has been completed successfully."
      : status === "missing"
        ? "The recovery token is missing from this link."
        : errorMessage;

  const StatusIcon = isSuccess ? ShieldCheck : CircleAlert;

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
          borderRadius: 3,
          overflow: "hidden",
          width: { xs: "100%", sm: "90%", md: "80%", lg: 900 },
          background:
            mode === "light"
              ? "rgba(255,255,255,0.95)"
              : "rgba(18,18,18,0.95)",
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
              color:
                mode === "light"
                  ? theme.palette.background.paper
                  : theme.palette.background.default,
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

              <Typography variant="body2" mt={1}>
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
              p: { xs: 3, sm: 4 },
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Stack spacing={2} alignItems="center" maxWidth={380}>
              {isChecking ? (
                <CircularProgress
                  size={42}
                  thickness={4}
                  sx={{ color: theme.palette.primary.main }}
                />
              ) : (
                <Box
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isSuccess
                      ? theme.palette.primary.main
                      : theme.palette.error.main,
                    backgroundColor: isSuccess
                      ? mode === "light"
                        ? "rgba(255,194,68,0.15)"
                        : "rgba(255,194,68,0.12)"
                      : theme.palette.action.hover,
                  }}
                >
                  <StatusIcon size={38} />
                </Box>
              )}

              <Typography variant="h5" fontWeight="bold">
                {title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {description}
              </Typography>

              {isChecking && (
                <Typography variant="caption" color="text.secondary">
                  This may take a moment...
                </Typography>
              )}

              {isSuccess && (
                <Typography variant="body2" color="text.secondary">
                  Redirecting you to login in 2 seconds...
                </Typography>
              )}

              {hasFailed && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Please request a new account recovery link if
                    your current link has expired.
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.replace("/auth/login")}
                    sx={{
                      mt: 1,
                      py: 1.2,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Back to login
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default function VerifyRecoverAccountPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerifyRecoverAccountContent />
    </Suspense>
  );
}