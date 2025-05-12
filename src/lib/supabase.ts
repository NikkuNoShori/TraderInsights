import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get environment variables based on runtime environment
const isServer = typeof window === "undefined";
const supabaseUrl = isServer
  ? process.env.VITE_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isServer
  ? process.env.VITE_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Missing environment variables:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    environment: isServer ? "server" : "client",
  });
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
});

// Test connection
if (!isServer) {
  supabase.auth
    .getSession()
    .then(({ data, error }) => {
      console.log("[Supabase] Initial connection test:", {
        success: !error,
        hasSession: !!data.session,
        error: error?.message,
      });
    })
    .catch((err) => {
      console.error("[Supabase] Connection test failed:", err);
    });
}

export { supabase };
