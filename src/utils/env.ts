/**
 * Environment variable utilities with type safety
 */

// Type-safe environment variable getters
export const env = {
  // Essential Supabase Configuration
  get supabaseUrl() {
    return import.meta.env.VITE_SUPABASE_URL;
  },
  get supabaseAnonKey() {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  },

  // Application Config
  get appName() {
    return import.meta.env.VITE_APP_NAME;
  },
  get appUrl() {
    return import.meta.env.VITE_APP_URL;
  },
  get appEnv() {
    return import.meta.env.VITE_APP_ENV;
  },
  get logLevel() {
    return import.meta.env.VITE_LOG_LEVEL;
  },
  get isDevelopment() {
    return this.appEnv === "development";
  },
  get isProduction() {
    return this.appEnv === "production";
  },

  // Feature Flags - All disabled by default
  get isRealTimeTrading() {
    return import.meta.env.VITE_ENABLE_REAL_TIME_TRADING === "true";
  },
  get isPaperTrading() {
    return import.meta.env.VITE_ENABLE_PAPER_TRADING === "true";
  },
  get isAnalyticsEnabled() {
    return import.meta.env.VITE_ENABLE_ANALYTICS === "true";
  },

  // Trading Configuration
  get apiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL;
  },
  get apiKey() {
    return import.meta.env.VITE_API_KEY;
  },
  get tradingApiUrl() {
    return import.meta.env.VITE_TRADING_API_URL;
  },
  get tradingApiKey() {
    return import.meta.env.VITE_TRADING_API_KEY;
  },
  get tradingWebsocketUrl() {
    return import.meta.env.VITE_TRADING_WEBSOCKET_URL;
  },

  // Market Data
  get marketDataApiUrl() {
    return import.meta.env.VITE_MARKET_DATA_API_URL;
  },
  get marketDataApiKey() {
    return import.meta.env.VITE_MARKET_DATA_API_KEY;
  },
  get marketDataRefreshInterval() {
    return parseInt(import.meta.env.VITE_MARKET_DATA_REFRESH_INTERVAL);
  },

  // Analytics and Monitoring
  get analyticsId() {
    return import.meta.env.VITE_ANALYTICS_ID;
  },
  get errorReportingDsn() {
    return import.meta.env.VITE_ERROR_REPORTING_DSN;
  },

  // Rate Limiting
  get apiRateLimit() {
    return parseInt(import.meta.env.VITE_API_RATE_LIMIT);
  },
  get websocketReconnectInterval() {
    return parseInt(import.meta.env.VITE_WEBSOCKET_RECONNECT_INTERVAL);
  },
};

// Validate required environment variables on app startup
export function validateEnv(): void {
  const requiredVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_APP_ENV",
    "VITE_LOG_LEVEL",
  ] as const;

  const missing = requiredVars.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate enum values
  const validEnvs = ["development", "production"];
  if (!validEnvs.includes(env.appEnv)) {
    throw new Error(
      `Invalid VITE_APP_ENV value. Must be one of: ${validEnvs.join(", ")}`
    );
  }

  const validLogLevels = ["debug", "info", "warn", "error"];
  if (!validLogLevels.includes(env.logLevel)) {
    throw new Error(
      `Invalid VITE_LOG_LEVEL value. Must be one of: ${validLogLevels.join(
        ", "
      )}`
    );
  }
}
