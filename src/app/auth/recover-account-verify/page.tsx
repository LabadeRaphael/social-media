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
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import api from "@/api/axiosInstance";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiMessage } from "@/types/api-response";
import { verifyRecoverAccount } from "@/api/user";

export default function VerifyRecoverAccountPage() {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [apiMessage, setApiMessage] = useState<ApiMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true)
const isSuccess = apiMessage?.status === true;
const isError = apiMessage?.status === false;
    useEffect(() => {
        AOS.init({ duration: 800, easing: "ease-in-out", once: true });
        const token = searchParams.get("token");
        console.log("token", token);

        if (!token) {
            setApiMessage({ message: "Invalid recovery link.", status: false })
            setIsLoading(false)
            return;
        }

        const verify = async () => {
            try {
                const res = await verifyRecoverAccount(token);
                const message = res?.message
                const status = res?.status
                setApiMessage({ message: message, status: status })
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } catch (err: any) {
                const message = err?.message || "Recovery link expired or invalid"
                const status = err?.data?.status || false
                setApiMessage({ message: message, status: status })
                console.log(message);
                setIsLoading(false)
            } finally {
                setIsLoading(false)
            }
        };

        verify();
    }, [searchParams, router, setApiMessage]);

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
            data-aos="fade-in"
            data-aos-delay={100}
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
                    // color: mode === "light" ? theme.palette.background.paper : theme.palette.background.default,
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
                            color: mode === "light" ? theme.palette.background.paper : theme.palette.background.default,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 4,
                            textAlign: "center",
                        }}
                        data-aos="zoom-in"
                        data-aos-delay="300"
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
                            <Typography variant="body2" data-aos="flip-left"
                                data-aos-easing="ease-out-cubic"
                                data-aos-duration="2000">
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
                            // color: mode === "light" ? "red" : theme.palette.background.default,
                        }}
                    >
                        {/* {status === "loading" && <CircularProgress />} */}
                        {/* {!isLoading && <CircularProgress />} */}
                        {isLoading && (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                <CircularProgress  size={30}/>
                                <Typography variant="body2">Verifying your account...</Typography>
                            </Box>
                        )}
                        {!isLoading && (
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                mt={2}
                                color={isSuccess ? "success.main" : "error.main"}
                            >
                                {apiMessage?.message}
                            </Typography>
                        )}
                       
                        {apiMessage?.status ?
                            <Typography variant="body2" mt={1}>
                                Redirecting to login in 2 seconds...
                            </Typography>
                            :
                            <Typography variant="body2" mt={1} color="error">
                                Please request a new recovery link.
                            </Typography>
                        }
                        
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}