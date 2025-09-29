// // components/Theme/ThemeProviderWrapper.tsx
// 'use client';

// import { useMemo} from 'react';
// import { useMediaQuery,ThemeProvider, CssBaseline } from '@mui/material';
// import { getTheme } from './theme';

// export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
//  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

//   const theme = useMemo(
//     () => getTheme(prefersDarkMode ? "dark" : "light"),
//     [prefersDarkMode]
//   );
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {children}
      
//     </ThemeProvider>
//   );
// }

// components/Theme/ThemeProviderWrapper.tsx
'use client';

import { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { useMediaQuery, ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'system',
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<Mode>('system');

  // Effective mode: system follows user preference
  const effectiveMode = mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;

  const theme = useMemo(() => getTheme(effectiveMode), [effectiveMode]);

  // Optional: persist in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as Mode | null;
    if (saved) setMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
