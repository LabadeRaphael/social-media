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
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/react-query/query-hooks";
import { useUpdateUser } from "@/react-query/user-hook";
import { Edit, Eye, EyeOff } from "lucide-react";
import { getAuthTextFieldSx } from "@/utils/textFieldStyles";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { deleteAccount, logOut, requestEmailChange } from "@/api/user";
import DynamicModal from "./dynamic-modal";
interface SettingProp {
  setActiveView: (view: 'chat' | 'settings') => void;
}

const ChangeEmailSchema = Yup.object({
  newEmail: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function SettingsPage({ setActiveView }: SettingProp) {

  const theme = useTheme();
  const mode = theme.palette.mode;
  const router = useRouter()
  const { data: currentUser } = useCurrentUser();
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [email] = useState(currentUser?.email || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [reAuthPassword, setReAuthPassword] = useState("");
  const [saveAuthPassword, setSaveAuthPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReAuthPassword, setShowReAuthPassword] = useState(false);
  const [showSaveAuthPassword, setShowSaveAuthPassword] = useState(false);
  const [showEmailAuthPassword, setShowEmailAuthPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdate, setIsupdate] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveChangesModal, setSaveChangesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false)

  const [errors, setErrors] = useState<{
    password?: string; confirmPassword?: string,
    reAuthPassword?: string, saveAuthPassword?: string,
  }>({});

  const formik = useFormik({
    initialValues: {
      newEmail: "",
      password: "",
    },
    validationSchema: ChangeEmailSchema,
    onSubmit: async (values) => {
      try {
        const res = await requestEmailChange({
          newEmail: values.newEmail,
          emailAuthPassword: values.password,
        });

        toast.success(res?.message);
        setOpenEmailModal(false);
        formik.resetForm();
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      }
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("file", file);

    if (file) setAvatarFile(file);
  };

  const validatePasswords = () => {
    const newErrors: typeof errors = {};
    if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDeletePassword = () => {
    const newErrors: typeof errors = {};

    if (!reAuthPassword) {
      newErrors.reAuthPassword = "Password is required";
    } else if (reAuthPassword.length < 6) {
      newErrors.reAuthPassword = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSavePassword = () => {
    const newErrors: typeof errors = {};

    if (!saveAuthPassword) {
      newErrors.saveAuthPassword = "Password is required";
    } else if (saveAuthPassword.length < 6) {
      newErrors.saveAuthPassword = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal)
  }

  const handleShowDeleteModal = () => {

    setShowDeleteModal(!showDeleteModal)
  }

  const handleLogout = async () => {
    try {
      setIsLogout(true)
      const response = await logOut()
      toast.success(response?.message)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLogout(false)
    }
  }

  const showSaveChangesModal = () => {
    if (!validatePasswords()) return;
    setSaveChangesModal(!saveChangesModal)
  }

  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const handleUpdate = async () => {
    if (isUpdate) return;
    if (!validateSavePassword()) return;

    setIsupdate(true);
    try {
      const payload = {
        userName,
        avatar: avatarFile,
        password: password || undefined,
        re_auth_psw: saveAuthPassword,
      };
      const response = await updateUserMutation(payload)
      console.log(response);


      toast.success("Profile updated successfully!");
      setSaveChangesModal(false);
      setSaveAuthPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsupdate(false);
    }
  };
  const handleDelete = async () => {
    if (!validateDeletePassword()) return;
    setLoading(true);
    try {
      await deleteAccount(reAuthPassword); // call your API
      setShowDeleteModal(false);
      handleLogout(); // log out user after deletion

    } catch (error: any) {
      toast.error(error?.message)
    } finally {
      setLoading(false);
    }
  }

  const getBorderColor = (error?: string) => {
    if (!error) return undefined;
    return error ? "error.main" : "success.main";
  };

  const previewUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : currentUser?.avatarUrl || "";
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2 },
        mx: "auto",
        width: "100%",
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
          p: { xs: 3, md: 2 },
          borderRadius: 3,
          backgroundColor: theme.palette.mode === "light"
            ? theme.palette.background.paper :
            theme.palette.background.default,
        }}
      >
        <Grid container spacing={4}>
          {/* Profile Info */}
          <Grid
            item
            xs={12}
            md={4}
            lg={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            justifyItems="center"
            gap={2}
            sx={{
              alignItems: "center",
              justifySelf: "center",
              mx: "auto"
            }}
          >
            <Avatar
              src={previewUrl}
              alt="User Avatar"
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.main",
              }}
            >
              {!previewUrl && currentUser?.userName?.[0]?.toUpperCase()}
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
          <Grid item xs={12} md={8} sx={{ mx: "auto" }}>
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={() => setOpenEmailModal(true)}
                        sx={{ textTransform: "none" }}
                      >
                        Change
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <DynamicModal
                open={openEmailModal}
                title="Change Email"
                description="Enter your new email. A verification link will be sent to confirm the change."
                confirmText="Send Link"
                onClose={() => setOpenEmailModal(false)}
                onConfirm={formik.handleSubmit}
                disabled={!formik.isValid || formik.isSubmitting}
                type="Change Email"
              >
                <Stack spacing={2}>

                  <TextField
                    label="New Email"
                    name="newEmail"
                    value={formik.values.newEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.newEmail && Boolean(formik.errors.newEmail)}
                    helperText={formik.touched.newEmail && formik.errors.newEmail}
                    fullWidth
                    size="small"
                    sx={
                      getAuthTextFieldSx({
                        theme,
                        mode,
                        touched: formik.touched.newEmail,
                        error: formik.errors.newEmail,
                      })}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type={showEmailAuthPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowEmailAuthPassword(!showEmailAuthPassword)}>
                            {showEmailAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={
                      getAuthTextFieldSx({
                        theme,
                        mode,
                        touched: formik.touched.password,
                        error: formik.errors.password,
                      })
                    }
                  />
                </Stack>
              </DynamicModal>
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
                  onClick={showSaveChangesModal}
                  sx={{ flex: 1 }}
                  disabled={isUpdate}
                >
                  Save Changes
                </Button>

                <DynamicModal
                  open={saveChangesModal}
                  title="Update Account?"
                  description="This action will update your account profile. Enter your password to confirm."
                  confirmText={isUpdate ? "Updating..." : "Update"}
                  confirmColor="error"
                  disabled={isUpdate}
                  onClose={() => {
                    setSaveChangesModal(false);
                    setPassword("");
                  }}
                  onConfirm={handleUpdate}                >
                  <TextField
                    label="Password"
                    type={showSaveAuthPassword ? "text" : "password"}
                    value={saveAuthPassword}
                    onChange={(e) => setSaveAuthPassword(e.target.value)}
                    error={!!errors.saveAuthPassword}
                    helperText={errors.saveAuthPassword || " "}
                    fullWidth
                    size="small"
                    variant="outlined"
                    autoFocus
                    sx={
                      getAuthTextFieldSx({
                        theme,
                        mode,
                        touched: !!saveAuthPassword,
                        error: errors.saveAuthPassword,
                      })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowSaveAuthPassword(!showSaveAuthPassword)}>
                            {showSaveAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUpdate();
                      }
                    }}

                  />
                </DynamicModal>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setActiveView("chat")}
                  sx={{
                    flex: 1,
                    color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
                    borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Account Actions */}
        <Grid container spacing={2} sx={{ display: "flex", justifyContent: "end" }}>
          <Grid item xs={12} sm={3}>
            <Box>
              <Button variant="outlined" onClick={handleLogoutModal} disabled={isLogout} sx={{
                color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
                borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
              }}>
                {isLogout ? "please wait" : "Logout"}
              </Button>
            </Box>

            <DynamicModal
              open={showLogoutModal}
              title="Logout ?"
              description="You will be logged out of your account."
              confirmText="Yes"
              confirmColor="error"
              onClose={() => setShowLogoutModal(false)}
              onConfirm={() => {
                handleLogout();
                setShowLogoutModal(false);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={handleShowDeleteModal}
              sx={{
                color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
                borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
              }}
            >
              Delete Account
            </Button>
            <DynamicModal
              open={showDeleteModal}
              title="Delete Account?"
              description="This action will permanently deactivate your account. Enter your password to confirm."
              confirmText={loading ? "Deleting..." : "Delete"}
              confirmColor="error"
              disabled={loading}
              onClose={() => {
                setShowDeleteModal(false);
                setPassword("");
              }}
              onConfirm={handleDelete}>
              <TextField
                label="Password"
                type={showReAuthPassword ? "text" : "password"}
                value={reAuthPassword}
                onChange={(e) => setReAuthPassword(e.target.value)}
                error={!!errors.reAuthPassword}
                helperText={errors.reAuthPassword || " "}
                fullWidth
                size="small"
                variant="outlined"
                autoFocus
                sx={getAuthTextFieldSx({
                  theme,
                  mode,
                  touched: !!reAuthPassword,
                  error: errors.reAuthPassword,
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowReAuthPassword(!showReAuthPassword)}>
                        {showReAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleDelete();
                  }
                }}
              />
            </DynamicModal>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
