import { Theme } from "@mui/material/styles";

interface AuthTextFieldStyleProps {
  theme: Theme;
  mode: "light" | "dark";
  touched?: boolean;
  error?: string;
}

export const getAuthTextFieldSx = ({
  theme,
  mode,
  touched,
  error,
}: AuthTextFieldStyleProps) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 1, sm: 2 },

    "& fieldset": {
      borderColor: !touched
        ? undefined
        : error
        ? mode === "dark"
          ? "#FBE9E7"
          : theme.palette.error.main
        : theme.palette.success.main,
    },

    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },

    "&.Mui-error fieldset": {
      borderColor:
        mode === "dark"
          ? "#FBE9E7"
          : theme.palette.error.main,
    },

    "&.Mui-focused.Mui-error fieldset": {
      borderColor:
        mode === "dark"
          ? "#FBE9E7"
          : theme.palette.error.main,
    },
  },

  "& .MuiInputLabel-root": {
    fontSize: {
      xs: "0.85rem",
      sm: "0.9rem",
    },
  },

  "& .MuiInputLabel-root.Mui-error": {
    color:
      mode === "dark"
        ? "#FBE9E7"
        : theme.palette.error.main,
  },

  "& .MuiInputBase-input": {
    color: theme.palette.text.primary,
  },
});