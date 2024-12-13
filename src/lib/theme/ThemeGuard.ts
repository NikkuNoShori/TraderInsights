type ThemeChangeRequest = {
  component: string;
  oldTheme: Record<string, string>;
  newTheme: Record<string, string>;
  requestedBy: string;
  timestamp: number;
};

export class ThemeGuard {
  private static instance: ThemeGuard;
  private authorized: boolean = false;
  private themeChangeLog: ThemeChangeRequest[] = [];
  private static readonly SECRET_KEY = 'SuperSecret123!';

  private constructor() {}

  static getInstance(): ThemeGuard {
    if (!ThemeGuard.instance) {
      ThemeGuard.instance = new ThemeGuard();
    }
    return ThemeGuard.instance;
  }

  authorize(key: string): boolean {
    this.authorized = key === ThemeGuard.SECRET_KEY;
    if (!this.authorized) {
      console.error('Invalid theme authorization key');
    }
    return this.authorized;
  }

  requestThemeChange(request: Omit<ThemeChangeRequest, 'timestamp'>): boolean {
    if (!this.authorized) {
      console.error('Unauthorized theme change attempt. Please use authorize() with the correct key first.');
      return false;
    }

    this.themeChangeLog.push({
      ...request,
      timestamp: Date.now()
    });

    return true;
  }

  getThemeChangeLog(): ThemeChangeRequest[] {
    if (!this.authorized) {
      console.error('Unauthorized access to theme change log');
      return [];
    }
    return this.themeChangeLog;
  }

  isAuthorized(): boolean {
    return this.authorized;
  }
} 