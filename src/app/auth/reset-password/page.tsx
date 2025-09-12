"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Lock } from "lucide-react";

// Yup validation schema
const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPasswordPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  });

  const getBorderColor = (
    touched: boolean | undefined,
    error: string | undefined
  ) => {
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
          background:
            mode === "light"
              ? "rgba(255,255,255,0.95)"
              : "rgba(18,18,18,0.95)",
          boxShadow: {
            xs: "0 2px 8px rgba(0,0,0,0.1)",
            sm: "0 4px 16px rgba(0,0,0,0.1)",
          },
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
              color:
                mode === "light"
                  ? theme.palette.background.paper
                  : theme.palette.background.default,
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
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  fontSize: {
                    xs: "1.5rem",
                    sm: "1.8rem",
                    md: "2rem",
                    lg: "2.2rem",
                  },
                  mb: 1,
                }}
              >
                Reset Password
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: {
                    xs: "0.85rem",
                    sm: "0.9rem",
                    md: "1rem",
                    lg: "1.1rem",
                  },
                }}
              >
                Create a new password for your account.
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Form */}
          <Grid
            item
            xs={12}
            md={7}
            lg={6}
            sx={{
              p: { xs: 2, sm: 3, md: 4, lg: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.5rem",
                  md: "1.7rem",
                  lg: "1.9rem",
                },
                mb: { xs: 1.5, sm: 2 },
              }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Set New Password
            </Typography>

            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={ResetPasswordSchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={(values) => {
                console.log("Reset Password Submitted:", values);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isValid,
              }) => (
                <Form>
                  <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                    {/* New Password */}
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={
                        touched.newPassword && Boolean(errors.newPassword)
                      }
                      helperText={touched.newPassword ? errors.newPassword : " "}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              edge="end"
                            >
                              {showNewPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": {
                            borderColor: getBorderColor(
                              touched.newPassword,
                              errors.newPassword
                            ),
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        },
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
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword ? errors.confirmPassword : " "
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 1, sm: 2 },
                          "& fieldset": {
                            borderColor: getBorderColor(
                              touched.confirmPassword,
                              errors.confirmPassword
                            ),
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        },
                      }}
                    />

                    {/* Submit Button */}
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      fullWidth
                      type="submit"
                      disabled={!isValid}
                      sx={{
                        borderRadius: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.2 },
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: {
                          xs: "0.85rem",
                          sm: "0.9rem",
                          md: "1rem",
                        },
                        "&:hover": {
                          background: theme.palette.primary.dark,
                          boxShadow: {
                            xs: "0 2px 8px rgba(0,0,0,0.15)",
                            sm: "0 4px 12px rgba(0,0,0,0.2)",
                          },
                        },
                      }}
                    >
                      Reset Password
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
