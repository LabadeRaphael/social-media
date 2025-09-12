// components/Theme/ThemeProviderWrapper.tsx
'use client';

import { useMemo} from 'react';
import { useMediaQuery,ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
 const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => getTheme(prefersDarkMode ? "dark" : "light"),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      
    </ThemeProvider>
  );
}
