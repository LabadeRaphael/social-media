"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import api from "@/api/axiosInstance";
import MessageAlert from "@/components/message-alert";
import Image from "next/image";
import { ApiMessage } from "@/types/api-response";

const RecoverySchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function RecoverAccountPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [apiMessage, setApiMessage] = useState<ApiMessage | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  const getBorderColor = (touched: boolean | undefined, error: string | undefined) => {
    if (!touched) return undefined;
    return error ? "error.main" : "success.main";
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 4 },
      }}
      data-aos="fade-in"
      data-aos-delay={100}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: { xs: 1, sm: 2 },
          overflow: "hidden",
          width: { xs: "100%", sm: "90%", md: "80%", lg: 900 },
          background: mode === "light" ? "rgba(255,255,255,0.95)" : "rgba(18,18,18,0.95)",
          boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.1)", sm: "0 4px 16px rgba(0,0,0,0.1)" },
        }}
        data-aos="fade-up"
        data-aos-delay="200"
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
              p: { xs: 2, sm: 3, md: 4 },
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
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}
             
              >
                Recover Account
              </Typography>
              <Typography variant="body2" data-aos="flip-left"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="2000">
                Restore your deleted Nestfinity account easily.
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
              p: { xs: 2, sm: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Enter your email
            </Typography>

            <Formik
              initialValues={{ email: "" }}
              validationSchema={RecoverySchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true);

                  const res = await api.post("/auth/recover-account", {
                    email: values.email,
                  });

                  setApiMessage({
                    message: res.data.message,
                    status: res.data.status,
                  });

                  setTimeout(() => setApiMessage(null), 3000);
                } catch (err: any) {
                  setApiMessage({
                    message: err.response?.data?.message || "Something went wrong",
                    status: false,
                  });

                  setTimeout(() => setApiMessage(null), 3000);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, isValid, isSubmitting }) => (
                <Form>
                  <Stack spacing={2}>
                    {apiMessage && (
                      <MessageAlert
                        message={apiMessage.message}
                        status={apiMessage.status}
                      />
                    )}

                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email ? errors.email : " "}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: getBorderColor(touched.email, errors.email),
                          },
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={!isValid || isSubmitting}
                      sx={{
                        borderRadius: 2,
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                    >
                      {isSubmitting ? "Processing..." : "Recover Account"}
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>

            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: "center" }}
            >
              Remembered your account?{" "}
              <Box
                component="a"
                href="/auth/login"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Login
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}