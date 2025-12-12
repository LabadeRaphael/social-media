"use client";

import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  Stack,
  Paper,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useUpdateUser } from "@/react-query/query-hooks";
import { Edit, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const updateUserMutation = useUpdateUser();

  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [email] = useState(currentUser?.email || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const validatePasswords = () => {
    const newErrors: typeof errors = {};
    if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validatePasswords()) return;

    try {
      await updateUserMutation.mutateAsync({
        userName,
        avatar: avatarFile,
        password: password || undefined,
      });
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const getBorderColor = (error?: string) => {
    if (!error) return undefined;
    return error ? "error.main" : "success.main";
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 6 },
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Typography variant="h5" fontWeight={10} >
        Account Settings
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1A1A1A",
        }}
      >
        <Grid container spacing={4}>
          {/* Profile Info */}
          <Grid
            item
            xs={12}
            md={4}
            lg={1}
            display="flex"
            flexDirection="column"
             alignItems="center"
            justifyContent="center" 
            justifyItems="center"
            gap={2}
            sx={{
                 alignItems:"center",
                 justifySelf:"center",
                mx:"auto"
                 
            }}
           
          >
            <Avatar
              sx={{ width: 120, height: 120, bgcolor: "primary.main", fontSize: 48 }}
            >
              {currentUser?.userName?.[0]?.toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Edit size={16} />}
            >
              Change Avatar
              <input type="file" hidden onChange={handleAvatarChange} />
            </Button>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8} sx={{mx:"auto"}}>
            <Stack spacing={2}>
              {/* Username */}
              <TextField
                label="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": { borderColor: getBorderColor() },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                  },
                  "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                }}
              />

              {/* Email */}
              <TextField
                label="Email"
                value={email}
                disabled
                helperText="To change email, use email settings flow"
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": { borderColor: getBorderColor() },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                  },
                  "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                }}
              />

              {/* Passwords Side by Side */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    size="small"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password || " "}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: getBorderColor(errors.password) },
                        "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      },
                      "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    size="small"
                    variant="outlined"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword || " "}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: getBorderColor(errors.confirmPassword) },
                        "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      },
                      "& .MuiInputLabel-root": { fontSize: "0.9rem" },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Buttons */}
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  sx={{ flex: 1 }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => router.push("/")}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Account Actions */}
        <Stack spacing={2}>
          <Button variant="outlined" color="error">
            Logout
          </Button>
          <Button variant="outlined" color="primary">
            Delete Account
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
