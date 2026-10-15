// "use client";

// import {
//   Box,
//   Typography,
//   Avatar,
//   TextField,
//   Button,
//   Grid,
//   Divider,
//   IconButton,
//   InputAdornment,
//   useTheme,
//   Stack,
//   Paper,
// } from "@mui/material";
// import { useState } from "react";
// import * as Yup from "yup";
// import { useRouter } from "next/navigation";
// import { useCurrentUser } from "@/react-query/query-hooks";
// import { useUpdateUser } from "@/react-query/user-hook";
// import { Edit, Eye, EyeOff } from "lucide-react";
// import { getAuthTextFieldSx } from "@/utils/textFieldStyles";
// import toast from "react-hot-toast";
// import { useFormik } from "formik";
// import { deleteAccount, logOut, requestEmailChange } from "@/api/user";
// import DynamicModal from "./dynamic-modal";
// interface SettingProp {
//   setActiveView: (view: 'chat' | 'settings') => void;
// }

// const ChangeEmailSchema = Yup.object({
//   newEmail: Yup.string()
//     .email("Invalid email")
//     .required("Email is required"),

//   password: Yup.string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
// });

// export default function SettingsPage({ setActiveView }: SettingProp) {

//   const theme = useTheme();
//   const mode = theme.palette.mode;
//   const router = useRouter()
//   const { data: currentUser } = useCurrentUser();
//   const [userName, setUserName] = useState(currentUser?.userName || "");
//   const [email] = useState(currentUser?.email || "");
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [password, setPassword] = useState("");
//   const [reAuthPassword, setReAuthPassword] = useState("");
//   const [saveAuthPassword, setSaveAuthPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showReAuthPassword, setShowReAuthPassword] = useState(false);
//   const [showSaveAuthPassword, setShowSaveAuthPassword] = useState(false);
//   const [showEmailAuthPassword, setShowEmailAuthPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isUpdate, setIsupdate] = useState(false);
//   const [isLogout, setIsLogout] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [saveChangesModal, setSaveChangesModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [openEmailModal, setOpenEmailModal] = useState(false)

//   const [errors, setErrors] = useState<{
//     password?: string; confirmPassword?: string,
//     reAuthPassword?: string, saveAuthPassword?: string,
//   }>({});

//   const formik = useFormik({
//     initialValues: {
//       newEmail: "",
//       password: "",
//     },
//     validationSchema: ChangeEmailSchema,
//     onSubmit: async (values) => {
//       try {
//         const res = await requestEmailChange({
//           newEmail: values.newEmail,
//           emailAuthPassword: values.password,
//         });

//         toast.success(res?.message);
//         setOpenEmailModal(false);
//         formik.resetForm();
//       } catch (error: any) {
//         toast.error(error.message || "Something went wrong");
//       }
//     },
//   });

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     console.log("file", file);

//     if (file) setAvatarFile(file);
//   };

//   const validatePasswords = () => {
//     const newErrors: typeof errors = {};
//     if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters";
//     if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateDeletePassword = () => {
//     const newErrors: typeof errors = {};

//     if (!reAuthPassword) {
//       newErrors.reAuthPassword = "Password is required";
//     } else if (reAuthPassword.length < 6) {
//       newErrors.reAuthPassword = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateSavePassword = () => {
//     const newErrors: typeof errors = {};

//     if (!saveAuthPassword) {
//       newErrors.saveAuthPassword = "Password is required";
//     } else if (saveAuthPassword.length < 6) {
//       newErrors.saveAuthPassword = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLogoutModal = () => {
//     setShowLogoutModal(!showLogoutModal)
//   }

//   const handleShowDeleteModal = () => {

//     setShowDeleteModal(!showDeleteModal)
//   }

//   const handleLogout = async () => {
//     try {
//       setIsLogout(true)
//       const response = await logOut()
//       toast.success(response?.message)
//       setTimeout(() => {
//         router.push("/auth/login")
//       }, 2000);
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update profile")
//     } finally {
//       setIsLogout(false)
//     }
//   }

//   const showSaveChangesModal = () => {
//     if (!validatePasswords()) return;
//     setSaveChangesModal(!saveChangesModal)
//   }

//   const { mutateAsync: updateUserMutation } = useUpdateUser();
//   const handleUpdate = async () => {
//     if (isUpdate) return;
//     if (!validateSavePassword()) return;

//     setIsupdate(true);
//     try {
//       const payload = {
//         userName,
//         avatar: avatarFile,
//         password: password || undefined,
//         re_auth_psw: saveAuthPassword,
//       };
//       const response = await updateUserMutation(payload)
//       console.log(response);


//       toast.success("Profile updated successfully!");
//       setSaveChangesModal(false);
//       setSaveAuthPassword("");
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to update profile");
//     } finally {
//       setIsupdate(false);
//     }
//   };
//   const handleDelete = async () => {
//     if (!validateDeletePassword()) return;
//     setLoading(true);
//     try {
//       await deleteAccount(reAuthPassword); // call your API
//       setShowDeleteModal(false);
//       handleLogout(); // log out user after deletion

//     } catch (error: any) {
//       toast.error(error?.message)
//     } finally {
//       setLoading(false);
//     }
//   }

//   const getBorderColor = (error?: string) => {
//     if (!error) return undefined;
//     return error ? "error.main" : "success.main";
//   };

//   const previewUrl = avatarFile
//     ? URL.createObjectURL(avatarFile)
//     : currentUser?.avatarUrl || "";
//   return (
//     <Box
//       sx={{
//         p: { xs: 2, md: 2 },
//         mx: "auto",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         gap: 4,
//       }}
//     >
//       <Typography variant="h5" fontWeight={10} >
//         Account Settings
//       </Typography>

//       <Paper
//         elevation={3}
//         sx={{
//           p: { xs: 3, md: 2 },
//           borderRadius: 3,
//           backgroundColor: theme.palette.mode === "light"
//             ? theme.palette.background.paper :
//             theme.palette.background.default,
//         }}
//       >
//         <Grid container spacing={4}>
//           {/* Profile Info */}
//           <Grid
//             item
//             xs={12}
//             md={4}
//             lg={4}
//             display="flex"
//             flexDirection="column"
//             alignItems="center"
//             justifyContent="center"
//             justifyItems="center"
//             gap={2}
//             sx={{
//               alignItems: "center",
//               justifySelf: "center",
//               mx: "auto"
//             }}
//           >
//             <Avatar
//               src={previewUrl}
//               alt="User Avatar"
//               sx={{
//                 width: 120,
//                 height: 120,
//                 bgcolor: "primary.main",
//               }}
//             >
//               {!previewUrl && currentUser?.userName?.[0]?.toUpperCase()}
//             </Avatar>
//             <Button
//               variant="outlined"
//               component="label"
//               startIcon={<Edit size={16} />}
//             >
//               Change Avatar
//               <input type="file" hidden onChange={handleAvatarChange} />
//             </Button>
//           </Grid>
//           {/* Profile Details */}
//           <Grid item xs={12} md={8} sx={{ mx: "auto" }}>
//             <Stack spacing={2}>
//               {/* Username */}
//               <TextField
//                 label="Username"
//                 value={userName}
//                 onChange={(e) => setUserName(e.target.value)}
//                 fullWidth
//                 size="small"
//                 variant="outlined"
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 2,
//                     "& fieldset": { borderColor: getBorderColor() },
//                     "&:hover fieldset": { borderColor: theme.palette.primary.main },
//                   },
//                   "& .MuiInputLabel-root": { fontSize: "0.9rem" },
//                 }}
//               />
//               {/* Email */}
//               <TextField
//                 label="Email"
//                 value={email}
//                 disabled
//                 helperText="To change email, use email settings flow"
//                 fullWidth
//                 size="small"
//                 variant="outlined"
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 2,
//                     "& fieldset": { borderColor: getBorderColor() },
//                     "&:hover fieldset": { borderColor: theme.palette.primary.main },
//                   },
//                   "& .MuiInputLabel-root": { fontSize: "0.9rem" },
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <Button
//                         size="small"
//                         onClick={() => setOpenEmailModal(true)}
//                         sx={{ textTransform: "none" }}
//                       >
//                         Change
//                       </Button>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <DynamicModal
//                 open={openEmailModal}
//                 title="Change Email"
//                 description="Enter your new email. A verification link will be sent to confirm the change."
//                 confirmText="Send Link"
//                 onClose={() => setOpenEmailModal(false)}
//                 onConfirm={formik.handleSubmit}
//                 disabled={!formik.isValid || formik.isSubmitting}
//                 type="Change Email"
//               >
//                 <Stack spacing={2}>

//                   <TextField
//                     label="New Email"
//                     name="newEmail"
//                     value={formik.values.newEmail}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.newEmail && Boolean(formik.errors.newEmail)}
//                     helperText={formik.touched.newEmail && formik.errors.newEmail}
//                     fullWidth
//                     size="small"
//                     sx={
//                       getAuthTextFieldSx({
//                         theme,
//                         mode,
//                         touched: formik.touched.newEmail,
//                         error: formik.errors.newEmail,
//                       })}
//                   />
//                   <TextField
//                     label="Password"
//                     name="password"
//                     type={showEmailAuthPassword ? "text" : "password"}
//                     value={formik.values.password}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.password && Boolean(formik.errors.password)}
//                     helperText={formik.touched.password && formik.errors.password}
//                     fullWidth
//                     size="small"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton onClick={() => setShowEmailAuthPassword(!showEmailAuthPassword)}>
//                             {showEmailAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                     sx={
//                       getAuthTextFieldSx({
//                         theme,
//                         mode,
//                         touched: formik.touched.password,
//                         error: formik.errors.password,
//                       })
//                     }
//                   />
//                 </Stack>
//               </DynamicModal>
//               {/* Passwords Side by Side */}
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="New Password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     fullWidth
//                     size="small"
//                     variant="outlined"
//                     error={!!errors.password}
//                     helperText={errors.password || " "}
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         borderRadius: 2,
//                         "& fieldset": { borderColor: getBorderColor(errors.password) },
//                         "&:hover fieldset": { borderColor: theme.palette.primary.main },
//                       },
//                       "& .MuiInputLabel-root": { fontSize: "0.9rem" },
//                     }}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton onClick={() => setShowPassword(!showPassword)}>
//                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Confirm Password"
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     fullWidth
//                     size="small"
//                     variant="outlined"
//                     error={!!errors.confirmPassword}
//                     helperText={errors.confirmPassword || " "}
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         borderRadius: 2,
//                         "& fieldset": { borderColor: getBorderColor(errors.confirmPassword) },
//                         "&:hover fieldset": { borderColor: theme.palette.primary.main },
//                       },
//                       "& .MuiInputLabel-root": { fontSize: "0.9rem" },
//                     }}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                           >
//                             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//               {/* Buttons */}
//               <Box display="flex" gap={2} mt={2} flexWrap="wrap">
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={showSaveChangesModal}
//                   sx={{ flex: 1 }}
//                   disabled={isUpdate}
//                 >
//                   Save Changes
//                 </Button>

//                 <DynamicModal
//                   open={saveChangesModal}
//                   title="Update Account?"
//                   description="This action will update your account profile. Enter your password to confirm."
//                   confirmText={isUpdate ? "Updating..." : "Update"}
//                   confirmColor="error"
//                   disabled={isUpdate}
//                   onClose={() => {
//                     setSaveChangesModal(false);
//                     setPassword("");
//                   }}
//                   onConfirm={handleUpdate}                >
//                   <TextField
//                     label="Password"
//                     type={showSaveAuthPassword ? "text" : "password"}
//                     value={saveAuthPassword}
//                     onChange={(e) => setSaveAuthPassword(e.target.value)}
//                     error={!!errors.saveAuthPassword}
//                     helperText={errors.saveAuthPassword || " "}
//                     fullWidth
//                     size="small"
//                     variant="outlined"
//                     autoFocus
//                     sx={
//                       getAuthTextFieldSx({
//                         theme,
//                         mode,
//                         touched: !!saveAuthPassword,
//                         error: errors.saveAuthPassword,
//                       })}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton onClick={() => setShowSaveAuthPassword(!showSaveAuthPassword)}>
//                             {showSaveAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         handleUpdate();
//                       }
//                     }}

//                   />
//                 </DynamicModal>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={() => setActiveView("chat")}
//                   sx={{
//                     flex: 1,
//                     color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//                     borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             </Stack>
//           </Grid>
//         </Grid>

//         <Divider sx={{ my: 3 }} />

//         {/* Account Actions */}
//         <Grid container spacing={2} sx={{ display: "flex", justifyContent: "end" }}>
//           <Grid item xs={12} sm={3}>
//             <Box>
//               <Button variant="outlined" onClick={handleLogoutModal} disabled={isLogout} sx={{
//                 color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//                 borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//               }}>
//                 {isLogout ? "please wait" : "Logout"}
//               </Button>
//             </Box>

//             <DynamicModal
//               open={showLogoutModal}
//               title="Logout ?"
//               description="You will be logged out of your account."
//               confirmText="Yes"
//               confirmColor="error"
//               onClose={() => setShowLogoutModal(false)}
//               onConfirm={() => {
//                 handleLogout();
//                 setShowLogoutModal(false);
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <Button variant="outlined" onClick={handleShowDeleteModal}
//               sx={{
//                 color: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//                 borderColor: mode === "light" ? theme.palette.error.main : theme.palette.primary.main,
//               }}
//             >
//               Delete Account
//             </Button>
//             <DynamicModal
//               open={showDeleteModal}
//               title="Delete Account?"
//               description="This action will permanently deactivate your account. Enter your password to confirm."
//               confirmText={loading ? "Deleting..." : "Delete"}
//               confirmColor="error"
//               disabled={loading}
//               onClose={() => {
//                 setShowDeleteModal(false);
//                 setPassword("");
//               }}
//               onConfirm={handleDelete}>
//               <TextField
//                 label="Password"
//                 type={showReAuthPassword ? "text" : "password"}
//                 value={reAuthPassword}
//                 onChange={(e) => setReAuthPassword(e.target.value)}
//                 error={!!errors.reAuthPassword}
//                 helperText={errors.reAuthPassword || " "}
//                 fullWidth
//                 size="small"
//                 variant="outlined"
//                 autoFocus
//                 sx={getAuthTextFieldSx({
//                   theme,
//                   mode,
//                   touched: !!reAuthPassword,
//                   error: errors.reAuthPassword,
//                 })}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={() => setShowReAuthPassword(!showReAuthPassword)}>
//                         {showReAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     handleDelete();
//                   }
//                 }}
//               />
//             </DynamicModal>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Box>
//   );
// }

"use client";
import {
  Edit,
  Eye,
  EyeOff,
  UserRound,
  ShieldCheck,
  LogOut,
  Trash2,
  LockKeyhole,
  Mail,
  Camera,
} from "lucide-react";
import { useEffect, useState } from "react";

import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/react-query/query-hooks";
import { useUpdateUser } from "@/react-query/user-hook";
// import { Edit, Eye, EyeOff } from "lucide-react";
// import { getAuthTextFieldSx } from "@/utils/textFieldStyles";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { deleteAccount, logOut, requestEmailChange } from "@/api/user";
import DynamicModal from "./dynamic-modal";
import { Avatar, Box, Button, Divider, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import { getAuthTextFieldSx } from "@/utils/textFieldStyles";
interface SettingProp {
  setActiveView: (view: 'chat' | 'settings') => void;
}

const ChangeEmailSchema = Yup.object({
  newEmail: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

});
const ChangePasswordSchema = Yup.object({
  password: Yup.string().test(
    "password-length",
    "Password must be at least 6 characters",
    (value) => !value || value.length >= 6
  ),

  confirmPassword: Yup.string().test(
    "password-match",
    "Passwords do not match",
    function (value) {
      const { password } = this.parent;

      if (!password && !value) return true;

      return Boolean(password) && value === password;
    }
  ),
});
const SaveAuthPasswordSchema = Yup.object({
  saveAuthPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Password must be at least 6 characters"),
});

const ReAuthPasswordSchema = Yup.object({
  reAuthPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Password must be at least 6 characters"),
});
export default function SettingsPage({ setActiveView }: SettingProp) {

  const theme = useTheme();
  const mode = theme.palette.mode;
  const router = useRouter()
  const { data: currentUser } = useCurrentUser();
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
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

  // synchronize useName and email if currrentUser() fail on mount
  useEffect(() => {
    if (!currentUser) return;

    setUserName(currentUser.userName ?? "");
    setEmail(currentUser.email ?? "");
  }, [currentUser, setUserName, setEmail]);
  const [errors, setErrors] = useState<{
    password?: string; confirmPassword?: string,
    reAuthPassword?: string, saveAuthPassword?: string,
  }>({});

  const formik = useFormik({
    initialValues: {
      newEmail: "",
      password: "",
      // confirmPassword: "",
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

  const passwordFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: ChangePasswordSchema,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: () => { },
  });
  const savePasswordFormik = useFormik({
    initialValues: {
      saveAuthPassword: "",
    },
    validationSchema: SaveAuthPasswordSchema,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async () => {
      await handleUpdate();
      setSaveChangesModal(false);
      savePasswordFormik.resetForm();

    },
  });
  const delPasswordFormik = useFormik({
    initialValues: {
      reAuthPassword: "",
    },
    validationSchema: ReAuthPasswordSchema,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async () => {
      await handleDelete();
      setShowDeleteModal(false);
      delPasswordFormik.resetForm();

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
      await deleteAccount(reAuthPassword);
      setShowDeleteModal(false);
      handleLogout(); // log out user after deletion

    } catch (error: any) {
      toast.error(error?.message)
    } finally {
      setLoading(false);
    }
  }

  const previewUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : currentUser?.avatarUrl || "";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
        color: "text.primary",
      }}
    >
      {/* Page heading */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontSize: { xs: "1.75rem", sm: "2.1rem" },
            }}
          >
            Settings
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: 520, lineHeight: 1.7 }}
          >
            Manage your profile, keep your account secure, and control
            your account access.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => setActiveView("chat")}
          sx={{
            borderRadius: 2.5,
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          Back to chats
        </Button>
      </Box>

      {/* PROFILE SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              color: "primary.main",
              bgcolor:
                mode === "dark"
                  ? "rgba(255,194,68,0.12)"
                  : "rgba(255,194,68,0.16)",
            }}
          >
            <UserRound size={21} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={750}>
              Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update the information people see about you.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "divider" }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "190px minmax(0, 1fr)" },
            gap: { xs: 3, md: 4 },
            alignItems: "start",
          }}
        >
          {/* Avatar */}
          <Stack
            alignItems="center"
            spacing={1.5}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              bgcolor: "action.hover",
            }}
          >
            <Avatar
              src={previewUrl}
              alt="User avatar"
              sx={{
                width: 104,
                height: 104,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "2rem",
                fontWeight: 700,
                border: "3px solid",
                borderColor: "background.paper",
                boxShadow: 2,
              }}
            >
              {!previewUrl && currentUser?.userName?.[0]?.toUpperCase()}
            </Avatar>

            <Button
              variant="outlined"
              component="label"
              startIcon={<Camera size={16} />}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 160 },
                px: { xs: 2, sm: 2.5, md: 1.5 },
                py: 1,
                borderColor: "divider",
                color: "text.primary",
                whiteSpace: "nowrap",
                transition: "border-color 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              Change avatar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Choose a photo that represents you.
            </Typography>
          </Stack>

          {/* Profile fields */}
          <Stack spacing={2.5}>
            <TextField
              label="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              helperText="This is how people identify you on Nestfinity."
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
            />

            <Box>
              <TextField
                label="Email address"
                value={email}
                disabled
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={1}
                sx={{ mt: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Your email is used for account verification and recovery.
                </Typography>

                <Button
                  size="small"
                  startIcon={<Mail size={15} />}
                  onClick={() => setOpenEmailModal(true)}
                  sx={{
                    flexShrink: 0,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Change email
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Change email modal: existing behavior preserved */}
        <DynamicModal
          open={openEmailModal}
          title="Change email address"
          description="Enter your new email address. A verification link will be sent to confirm the change."
          confirmColor="primary"
          confirmText="Send link"
          onClose={() => setOpenEmailModal(false)}
          onConfirm={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          type="Change Email"
        >
          <Stack spacing={2}>
            <TextField
              label="New email address"
              name="newEmail"
              value={formik.values.newEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.newEmail && Boolean(formik.errors.newEmail)
              }
              helperText={
                formik.touched.newEmail && formik.errors.newEmail
              }
              fullWidth
              size="small"
              sx={
                getAuthTextFieldSx({
                  theme,
                  mode,
                  touched: formik.touched.newEmail,
                  error: formik.errors.newEmail,
                })
              }
            />

            <TextField
              label="Current password"
              name="password"
              type={showEmailAuthPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.password && Boolean(formik.errors.password)
              }
              helperText={
                formik.touched.password && formik.errors.password
              }
              fullWidth
              size="small"
              sx={
                getAuthTextFieldSx({
                  theme,
                  mode,
                  touched: formik.touched.password,
                  error: formik.errors.password,
                })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showEmailAuthPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowEmailAuthPassword((prev) => !prev)
                      }
                      edge="end"
                    >
                      {showEmailAuthPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DynamicModal>
      </Paper>

      {/* SECURITY SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              color: "primary.main",
              bgcolor:
                mode === "dark"
                  ? "rgba(255,194,68,0.12)"
                  : "rgba(255,194,68,0.16)",
            }}
          >
            <ShieldCheck size={21} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={750}>
              Security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Change your password to help protect your account.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "divider" }} />

        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
              Update password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Leave both password fields empty if you only want to update
              your profile information.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {/* <TextField
              label="New password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              error={!!errors.password}
              helperText={errors.password || " "}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            /> */}

            <TextField
              label="New password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={passwordFormik.values.password}
              onChange={(e) => {
                const value = e.target.value;

                passwordFormik.setFieldValue("password", value);
                setPassword(value);
              }}
              onBlur={passwordFormik.handleBlur}
              error={Boolean(
                passwordFormik.touched.password &&
                passwordFormik.errors.password
              )}
              helperText={
                passwordFormik.touched.password
                  ? passwordFormik.errors.password || " "
                  : " "
              }
              fullWidth
              size="small"
              sx={getAuthTextFieldSx({
                theme,
                mode,
                // touched: passwordFormik.touched.password,
                error: passwordFormik.errors.password,
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />


            {/* <TextField
              label="Confirm new password"
              type={showConfirmPassword ? "text" : "password"}
              // value={confirmPassword}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              fullWidth
              size="small"
              sx={
                getAuthTextFieldSx({
                  theme,
                  mode,
                  touched: !!confirmPassword,
                  error: errors.confirmPassword,
                })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            /> */}
            {/* <TextField
              label="Confirm password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              fullWidth
              size="small"
              sx={
                getAuthTextFieldSx({
                  theme,
                  mode,
                  touched: formik.touched.confirmPassword,
                  error: formik.errors.confirmPassword,
                })
              }
            /> */}

            <TextField
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordFormik.values.confirmPassword}
              onChange={(e) => {
                passwordFormik.handleChange(e);
                setConfirmPassword(e.target.value);
              }}
              onBlur={passwordFormik.handleBlur}
              error={
                Boolean(
                  passwordFormik.touched.confirmPassword &&
                  passwordFormik.errors.confirmPassword
                )
              }
              helperText={
                passwordFormik.touched.confirmPassword
                  ? passwordFormik.errors.confirmPassword || " "
                  : " "
              }
              fullWidth
              size="small"
              sx={getAuthTextFieldSx({
                theme,
                mode,
                // touched: passwordFormik.touched.confirmPassword,
                error: passwordFormik.errors.confirmPassword,
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            />

          </Box>

          <Divider sx={{ borderColor: "divider" }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={650}>
                Save your changes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your profile updates and optional password change are saved together.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={showSaveChangesModal}
              disabled={isUpdate}
              sx={{
                borderRadius: 2.5,
                px: { xs: 2.5, sm: 2.5, md: 2 },
                py: { xs: 1.15, sm: 1.15, md: 1 },
                fontSize: { xs: "0.875rem", md: "0.8125rem", lg: "0.875rem" },
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                minWidth: { xs: "auto", md: 0 },
                boxShadow: "none",
                "&:hover": { boxShadow: 1 },
              }}
            >
              {isUpdate ? "Saving..." : "Save changes"}
            </Button>
          </Box>
        </Stack>

        {/* Existing profile/password update confirmation */}
        <DynamicModal
          open={saveChangesModal}
          title="Save account changes?"
          description="Your profile information and any password change will be updated after you confirm your current password."
          confirmText={isUpdate ? "Saving..." : "Confirm changes"}
          confirmColor="primary"
          onConfirm={savePasswordFormik.handleSubmit}
          disabled={!savePasswordFormik.isValid || savePasswordFormik.isSubmitting}
          onClose={() => {
            setSaveChangesModal(false);
            setPassword("");
          }}
        >
          <TextField
            label="Current password"
            name="saveAuthPassword"
            type={showSaveAuthPassword ? "text" : "password"}
            value={savePasswordFormik.values.saveAuthPassword}
            onChange={(e) => {
              savePasswordFormik.handleChange(e);
              setSaveAuthPassword(e.target.value);
            }}
            onBlur={savePasswordFormik.handleBlur}
            error={Boolean(
              savePasswordFormik.touched.saveAuthPassword &&
              savePasswordFormik.errors.saveAuthPassword
            )}
            helperText={
              savePasswordFormik.touched.saveAuthPassword
                ? savePasswordFormik.errors.saveAuthPassword || " "
                : " "
            }
            fullWidth
            size="small"
            autoFocus
            sx={getAuthTextFieldSx({
              theme,
              mode,
              touched: savePasswordFormik.touched.saveAuthPassword,
              error: savePasswordFormik.errors.saveAuthPassword,
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showSaveAuthPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowSaveAuthPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showSaveAuthPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
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
      </Paper>

      {/* ACCOUNT MANAGEMENT SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              color: "text.secondary",
              bgcolor: "action.hover",
            }}
          >
            <LockKeyhole size={21} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={750}>
              Account management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your current session or remove your account.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "divider" }} />

        {/* Logout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            py: 0.5,
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Log out
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign out of Nestfinity on this device.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<LogOut size={17} />}
            onClick={handleLogoutModal}
            disabled={isLogout}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              textTransform: "none",
              fontWeight: 650,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            {isLogout ? "Logging out..." : "Log out"}
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: "divider" }} />

        {/* Danger zone */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? "rgba(255,110,110,0.35)"
                : "rgba(211,47,47,0.25)",
            bgcolor:
              mode === "dark"
                ? "rgba(211,47,47,0.06)"
                : "rgba(211,47,47,0.025)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={750}
                color={mode === "light" ? "error.main" : "error.light"}
              >
                Delete account
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 480, lineHeight: 1.7 }}
              >
                This deactivates your account. Make sure you understand the
                recovery period before proceeding.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={17} />}
              onClick={handleShowDeleteModal}
              sx={{
                flexShrink: 0,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                fontWeight: 650,
                textTransform: "none",
                backgroundColor: mode === "dark" && "error.light"

              }}
            >
              Delete account
            </Button>
          </Stack>
        </Box>

        {/* Logout confirmation */}
        <DynamicModal
          open={showLogoutModal}
          title="Log out of Nestfinity?"
          description="You will be signed out of your account on this device."
          confirmText={isLogout ? "Logging out..." : "Yes, log out"}
          confirmColor="error"
          disabled={isLogout}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={async () => {
            await handleLogout();
            setShowLogoutModal(false);
          }}
        />

        {/* Delete confirmation */}
        <DynamicModal
          open={showDeleteModal}
          title="Delete your account?"
          description="Your account will be deactivated. Enter your password to confirm this action."
          confirmText={loading ? "Deleting..." : "Delete account"}
          confirmColor="error"

          onConfirm={delPasswordFormik.handleSubmit}
          disabled={!delPasswordFormik.isValid || delPasswordFormik.isSubmitting}
          // onClose={() => {
          //   setSaveChangesModal(false);
          //   setPassword("");
          // }}
          // disabled={loading}
          onClose={() => {
            setShowDeleteModal(false);
            setReAuthPassword("");
          }}
        // onConfirm={handleDelete}
        >
          <TextField
            label="Current password"
            name="reAuthPassword"
            type={showReAuthPassword ? "text" : "password"}
            value={delPasswordFormik.values.reAuthPassword}
            onChange={(e) => {
              delPasswordFormik.handleChange(e);
              setReAuthPassword(e.target.value);
            }}
            onBlur={delPasswordFormik.handleBlur}
            error={
              Boolean(
                delPasswordFormik.touched.reAuthPassword &&
                delPasswordFormik.errors.reAuthPassword
              )
            }
            helperText={
              delPasswordFormik.touched.reAuthPassword
                ? delPasswordFormik.errors.reAuthPassword || " "
                : " "
            }
            fullWidth
            size="small"
            autoFocus
            sx={
              getAuthTextFieldSx({
                theme,
                mode,
                touched: delPasswordFormik.touched.reAuthPassword,
                error: delPasswordFormik.errors.reAuthPassword,
              })
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showReAuthPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowReAuthPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showReAuthPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !delPasswordFormik.isSubmitting) {
                e.preventDefault();
                delPasswordFormik.handleSubmit();
              }
            }}
          />
        </DynamicModal>
      </Paper>
    </Box>
  );

}

