import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { clsx } from 'clsx';

export interface DarkModeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function DarkModeToggle({ showLabel, className }: DarkModeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={clsx(
        'flex items-center space-x-2 p-2 text-sm',
        'text-muted-foreground hover:text-foreground',
        'transition-colors duration-150',
        className
      )}
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      {showLabel && (
        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
      )}
    </button>
  );
} 
