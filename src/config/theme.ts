// Consolidate all theme-related constants
export const THEME_CONFIG = {
  light: {
    background: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    text: {
      primary: 'rgb(17, 24, 39)',
      secondary: 'rgb(75, 85, 99)',
      muted: 'rgb(107, 114, 128)'
    },
    border: 'rgb(229, 231, 235)'
  },
  dark: {
    background: 'rgb(17, 17, 17)',
    card: 'rgb(28, 28, 28)',
    text: {
      primary: 'rgb(229, 231, 235)',
      secondary: 'rgb(209, 213, 219)',
      muted: 'rgb(156, 163, 175)'
    },
    border: 'rgba(255, 255, 255, 0.1)'
  }
} as const; 