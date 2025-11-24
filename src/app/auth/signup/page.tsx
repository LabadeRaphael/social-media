"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import api from "@/api/axiosInstance";
import MessageAlert from "@/components/message-alert";
import Image from "next/image";
// Yup validation schema
const SignupSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Username too short")
    .max(30, "Username too long")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required("Confirm Password is required"),
});
interface ApiMessage {
  message: string;
  status: boolean;
}

export default function SignupPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiMessage, setApiMessage] = useState<ApiMessage | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  });

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
          maxWidth: "100%",
          background: mode === "light" ? "rgba(255,255,255,0.95)" : "rgba(18,18,18,0.95)",
          boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.1)", sm: "0 4px 16px rgba(0,0,0,0.1)" },
        }}
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <Grid container>
          {/* Left Side - Branding */}
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
              display: { xs: "flex", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, sm: 3, md: 4, lg: 5 },
              textAlign: "center",
              minHeight: { xs: 150, sm: 200, md: "100%" },
            }}
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <Box>
              <Image
                src='/logo.png'
                alt="Nestfinity logo"
                height={70}
                width={70}
                style={{ borderRadius: '50%' }}
              />
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem", lg: "2.2rem" }, mb: 1 }}
              >
                Welcome to Nestfinity
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem", lg: "1.1rem" } }}
              >
                Sign up and start connecting with your world.
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Form */}
          <Grid
            item
            xs={12}
            md={7}
            lg={6}
            sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.7rem", lg: "1.9rem" }, mb: { xs: 1.5, sm: 2 } }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Create Account
            </Typography>

            <Formik
              initialValues={{
                userName: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={SignupSchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={async (values, { setSubmitting}) => {
                try {
                  setSubmitting(true)

                  const res = await api.post("/auth/signup", {
                    userName: values.userName,
                    email: values.email,
                    password: values.password,
                  });
                  // resetForm();
                  console.log("Signup success:", res.data);
                  const message = res?.data?.message
                  const status = res?.data?.status
                  setApiMessage({ message: message, status: status });
                  // 🔹 Hide message after 3 seconds
                  setTimeout(() => setApiMessage(null), 3000);

                  // 🔹 Redirect after 2 seconds
                  setTimeout(() => {
                    window.location.href = "/auth/login";
                  }, 2000);

                } catch (err: any) {
                  const message = err.response?.data?.message || err.message
                  const status = err.response?.data?.status
                  setApiMessage({ message: message, status: status });
                  // 🔹 Hide message after 3 seconds
                  setTimeout(() => setApiMessage(null), 3000);
                  console.error("Signup error:", err.response?.data || err.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, isValid, isSubmitting }) => (
                <Form>
                  <Stack spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                    {apiMessage && (
                      <MessageAlert
                        message={apiMessage.message}
                        status={apiMessage.status}
                      />
                    )}
                    {/* Username */}
                    <TextField
                      label="Username"
                      name="userName"
                      value={values.userName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={touched.userName && Boolean(errors.userName)}
                      helperText={touched.userName ? errors.userName : " "} // Reserve space
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": {
                            borderColor: getBorderColor(touched.userName, errors.userName),
                          },
                          "&:hover fieldset": { borderColor: theme.palette.primary.main },
                        },
                        "& .MuiInputLabel-root": { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                      }}
                    />

                    {/* Email */}
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email ? errors.email : " "} // Reserve space
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": { borderColor: getBorderColor(touched.email, errors.email) },
                          "&:hover fieldset": { borderColor: theme.palette.primary.main },
                        },
                        "& .MuiInputLabel-root": { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                      }}
                    />

                    {/* Password */}
                    <TextField
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password ? errors.password : " "} // Reserve space
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": { borderColor: getBorderColor(touched.password, errors.password) },
                          "&:hover fieldset": { borderColor: theme.palette.primary.main },
                        },
                        "& .MuiInputLabel-root": { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Confirm Password */}
                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword ? errors.confirmPassword : " "} // Reserve space
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": {
                            borderColor: getBorderColor(touched.confirmPassword, errors.confirmPassword),
                          },
                          "&:hover fieldset": { borderColor: theme.palette.primary.main },
                        },
                        "& .MuiInputLabel-root": { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Submit Button */}
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      fullWidth
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      sx={{
                        borderRadius: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.2 },
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        "&:hover": {
                          background: theme.palette.primary.dark,
                          boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.15)", sm: "0 4px 12px rgba(0,0,0,0.2)" },
                        },
                      }}
                    >
                      {isSubmitting ? "Please wait..." : "Sign Up"}
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="bold"
              sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: "center", fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" } }}
            >
              Already have an account?{" "}
              <Box component="a" href="/auth/login" sx={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: "bold", "&:hover": { textDecoration: "underline" } }}>
                Log In
              </Box>
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="bold"
              sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: "center", fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" } }}
            >
              <Box component="a" href="/auth/forgot-password" sx={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: "bold", "&:hover": { textDecoration: "underline" } }}>
                forgotten password?
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
