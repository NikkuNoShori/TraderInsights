/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Keys and Authentication
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly API_BASE_URL: string;
  readonly API_KEY: string;
  readonly APP_URL: string;

  // Feature Flags
  readonly ENABLE_REAL_TIME_TRADING: string;
  readonly ENABLE_PAPER_TRADING: string;
  readonly ENABLE_ANALYTICS: string;

  // Trading API Configuration
  readonly TRADING_API_URL: string;
  readonly TRADING_API_KEY: string;
  readonly TRADING_WEBSOCKET_URL: string;

  // Market Data Configuration
  readonly MARKET_DATA_API_URL: string;
  readonly MARKET_DATA_API_KEY: string;
  readonly MARKET_DATA_REFRESH_INTERVAL: string;

  // Application Configuration
  readonly APP_NAME: string;
  readonly APP_VERSION: string;
  readonly NODE_ENV: "development" | "staging" | "production"; // Using literal types
  readonly LOG_LEVEL: "debug" | "info" | "warn" | "error"; // Using literal types

  // Analytics and Monitoring
  readonly ANALYTICS_ID: string;
  readonly ERROR_REPORTING_DSN: string;

  // Rate Limiting
  readonly API_RATE_LIMIT: string;
  readonly WEBSOCKET_RECONNECT_INTERVAL: string;

  // SnapTrade Configuration
  readonly SNAPTRADE_CLIENT_ID: string;
  readonly SNAPTRADE_CONSUMER_KEY: string;
  readonly SNAPTRADE_REDIRECT_URI: string;
}

// This interface is required by Vite
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add type validation helper
declare function validateEnv(): void;
validateEnv = () => {
  const requiredEnvVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NODE_ENV",
    "LOG_LEVEL",
    "APP_URL",
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};
