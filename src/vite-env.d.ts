/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Keys and Authentication
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_APP_URL: string;

  // Feature Flags
  readonly VITE_ENABLE_REAL_TIME_TRADING: string;
  readonly VITE_ENABLE_PAPER_TRADING: string;
  readonly VITE_ENABLE_ANALYTICS: string;

  // Trading API Configuration
  readonly VITE_TRADING_API_URL: string;
  readonly VITE_TRADING_API_KEY: string;
  readonly VITE_TRADING_WEBSOCKET_URL: string;

  // Market Data Configuration
  readonly VITE_MARKET_DATA_API_URL: string;
  readonly VITE_MARKET_DATA_API_KEY: string;
  readonly VITE_MARKET_DATA_REFRESH_INTERVAL: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: "development" | "staging" | "production"; // Using literal types
  readonly VITE_LOG_LEVEL: "debug" | "info" | "warn" | "error"; // Using literal types

  // Analytics and Monitoring
  readonly VITE_ANALYTICS_ID: string;
  readonly VITE_ERROR_REPORTING_DSN: string;

  // Rate Limiting
  readonly VITE_API_RATE_LIMIT: string;
  readonly VITE_WEBSOCKET_RECONNECT_INTERVAL: string;
}

// This interface is required by Vite
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add type validation helper
declare function validateEnv(): void;
validateEnv = () => {
  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_APP_ENV",
    "VITE_LOG_LEVEL",
    "VITE_APP_URL",
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};
