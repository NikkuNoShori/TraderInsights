import "dotenv/config";

export const serverEnv = {
  port: process.env.PORT || 3000,
  isDevelopment: process.env.VITE_APP_ENV === "development",
  appUrl: process.env.VITE_APP_URL || "http://localhost:5173",
  apiRateLimit: parseInt(process.env.VITE_API_RATE_LIMIT || "100"),
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  snapTrade: {
    clientId: process.env.VITE_SNAPTRADE_CLIENT_ID,
    consumerKey: process.env.VITE_SNAPTRADE_CONSUMER_KEY,
    redirectUri:
      process.env.VITE_SNAPTRADE_REDIRECT_URI ||
      "http://localhost:5173/broker-callback",
  },
};

// Validate required environment variables
const requiredVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_APP_ENV",
] as const;

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

// Log SnapTrade configuration
console.log("SnapTrade configuration:", {
  hasClientId: !!serverEnv.snapTrade.clientId,
  hasConsumerKey: !!serverEnv.snapTrade.consumerKey,
  redirectUri: serverEnv.snapTrade.redirectUri,
});
