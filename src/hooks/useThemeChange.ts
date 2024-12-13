import { ThemeGuard } from '../lib/theme/ThemeGuard';

export function useThemeChange() {
  const themeGuard = ThemeGuard.getInstance();

  const requestThemeChange = (
    component: string,
    oldTheme: Record<string, string>,
    newTheme: Record<string, string>
  ) => {
    return themeGuard.requestThemeChange({
      component,
      oldTheme,
      newTheme,
      requestedBy: 'developer', // Could be dynamic based on user role
    });
  };

  return {
    requestThemeChange,
    authorize: themeGuard.authorize.bind(themeGuard),
  };
} 