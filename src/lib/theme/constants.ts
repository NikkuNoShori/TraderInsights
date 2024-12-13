export const themeTokens = {
  background: {
    light: 'bg-background',
    dark: 'dark:bg-dark-bg',
    hover: {
      light: 'hover:bg-background/90',
      dark: 'dark:hover:bg-dark-bg/90'
    }
  },
  foreground: {
    light: 'text-foreground',
    dark: 'dark:text-dark-text',
    hover: {
      light: 'hover:text-foreground/90',
      dark: 'dark:hover:text-dark-text/90'
    }
  },
  card: {
    light: 'bg-card',
    dark: 'dark:bg-dark-paper',
    hover: {
      light: 'hover:bg-card/90',
      dark: 'dark:hover:bg-dark-paper/90'
    }
  },
  muted: {
    light: 'text-muted-foreground',
    dark: 'dark:text-dark-muted',
    hover: {
      light: 'hover:text-muted-foreground/90',
      dark: 'dark:hover:text-dark-muted/90'
    }
  },
  border: {
    light: 'border-border',
    dark: 'dark:border-dark-border',
    hover: {
      light: 'hover:border-border/90',
      dark: 'dark:hover:border-dark-border/90'
    }
  },
  primary: {
    light: 'text-primary',
    dark: 'dark:text-primary-400',
    bg: {
      light: 'bg-primary',
      dark: 'dark:bg-primary-400'
    }
  },
  success: {
    light: 'text-emerald-500',
    dark: 'dark:text-emerald-400',
    bg: {
      light: 'bg-emerald-50',
      dark: 'dark:bg-emerald-900/20'
    }
  },
  error: {
    light: 'text-rose-500',
    dark: 'dark:text-rose-400',
    bg: {
      light: 'bg-rose-50',
      dark: 'dark:bg-rose-900/20'
    }
  }
} as const;

export const themePresets = {
  card: `${themeTokens.card.light} ${themeTokens.card.dark} rounded-lg shadow`,
  cardHover: `${themeTokens.card.hover.light} ${themeTokens.card.hover.dark}`,
  text: {
    primary: `${themeTokens.foreground.light} ${themeTokens.foreground.dark}`,
    muted: `${themeTokens.muted.light} ${themeTokens.muted.dark}`,
    success: `${themeTokens.success.light} ${themeTokens.success.dark}`,
    error: `${themeTokens.error.light} ${themeTokens.error.dark}`
  },
  button: {
    primary: `${themeTokens.primary.bg.light} ${themeTokens.primary.bg.dark} text-white rounded-md`,
    secondary: `${themeTokens.card.light} ${themeTokens.card.dark} ${themeTokens.foreground.light} ${themeTokens.foreground.dark} rounded-md`,
  },
  input: `bg-background dark:bg-dark-bg border border-border dark:border-dark-border rounded-md`,
  container: `${themeTokens.background.light} ${themeTokens.background.dark}`,
  section: `${themeTokens.card.light} ${themeTokens.card.dark} p-6 rounded-lg shadow-sm`,
} as const; 