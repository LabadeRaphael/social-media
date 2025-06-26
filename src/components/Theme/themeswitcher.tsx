// components/Theme/ThemeSwitcher.tsx
'use client';

import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

export default function ThemeSwitcher() {
  const theme = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>(theme.palette.mode);

  useEffect(() => {
    const root = document.querySelector('body');
    root?.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    // This part requires reload for MUI ThemeProviderWrapper to pick up the change
    location.reload(); // temporary solution for switching theme
  };

  return (
    <IconButton onClick={toggleMode} color="inherit">
      {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </IconButton>
  );
}
