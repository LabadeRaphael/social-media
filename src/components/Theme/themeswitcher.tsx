// components/Theme/ThemeSwitcher.tsx
'use client';

import { IconButton, Menu, MenuItem } from '@mui/material';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useState } from 'react';
import { useThemeMode } from './themeprovider';

export const ThemeSwitcher = () => {
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (newMode?: 'light' | 'dark' | 'system') => {
    if (newMode) setMode(newMode);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        {mode === 'light' ? <Sun size={20} /> : mode === 'dark' ? <Moon size={20} /> : <Laptop size={20} />}
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
        <MenuItem onClick={() => handleClose('light')}>Light</MenuItem>
        <MenuItem onClick={() => handleClose('dark')}>Dark</MenuItem>
        <MenuItem onClick={() => handleClose('system')}>System</MenuItem>
      </Menu>
    </>
  );
};
