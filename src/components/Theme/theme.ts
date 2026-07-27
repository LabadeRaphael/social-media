// theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
declare module '@mui/material/styles' {
  interface Palette {
    chat: {
      sender: string;
    };
  }
  interface PaletteOptions {
    chat?: {
      sender?: string;
    };
  }
}
const baseTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#ffc244', // Gold
      contrastText: '#120802', // Dark text
    },
    secondary: {
      main: '#120802',
      contrastText: '#fdf8f4',
    },
    background: {
      default: '#fdf8f4', // Cream
      paper: '#ffffff',
    },
    text: {
      primary: '#120802',
    },
    success: {
      main: "#2E7D32",
      light: "#E8F5E9",
    },
    error: {
      main: "#73040F",
      light: "#FDECEC",
    },
  },
};

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
      chat: {
        sender: "#3a1f0f", // ✅ your new color
      },

      ...(mode === 'dark' && {
        background: {
          default: '#1a1a1a',
          paper: '#232323',
        },
        primary: {
          main: '#ffc244',
        },
        text: {
          primary: '#fdf8f4',
        },
        success: {
          main: "#81C784",
          light: "#1E3A24",
        },
        error: {
          main: "#73040F",
          light: "#FBE9E7",    // Soft cream/pink background
        }
      }),
    },
    components: {
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.Mui-error": {
              color:
                theme.palette.mode === "dark"
                  ? "#ffc244"
                  : theme.palette.error.main,
            },
          }),
        },
      },
    },
  });


