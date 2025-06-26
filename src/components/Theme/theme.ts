// theme/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

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
      secondary: '#f9e6c1',
    },
  },
};

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
      ...(mode === 'dark' && {
        background: {
          default: '#1a1a1a',
          paper: '#232323',
        },
        primary: {
          main: '#ffc244',
        },
      }),
    },
  });

// theme/theme.ts
// export const getTheme = (mode: 'light' | 'dark') =>
//   createTheme({
//     ...baseTheme,
//     palette: {
//       ...baseTheme.palette,
//       mode,
//       ...(mode === 'dark' && {
//         primary: {
//           main: '#ffc244', // Still Gold
//           contrastText: '#120802', // Deep Brown text
//         },
//         secondary: {
//           main: '#fdf8f4', // Light Cream
//           contrastText: '#120802',
//         },
//         background: {
//           default: '#120802', // Very dark brown base
//           paper: '#f9e6c1', // Light Gold Paper
//         },
//         text: {
//           primary: '#120802', // Deep brown text on cream paper
//           secondary: '#ffc244', // Gold as accent
//         },
//       }),
//     },
//   });

