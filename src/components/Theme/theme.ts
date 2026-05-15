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
        error: {
          main: "#73040F",
        }
      }),
    },
  });


