export const config = {
  theme: {
    defaultMode: 'dark',
    supportedModes: ['light', 'dark'] as const,
  },
  auth: {
    persistKey: 'auth_token',
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
    timeout: 10000,
  }
} as const; 