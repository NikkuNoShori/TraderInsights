import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: false,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
      watch: {
        usePolling: true,
      },
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
            charts: ["recharts", "lightweight-charts"],
            utils: ["date-fns", "axios"],
          },
        },
      },
    },
    define: {
      // Expose env variables to the client
      "process.env": {
        VITE_APP_ENV: JSON.stringify(env.VITE_APP_ENV),
        VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        VITE_APP_NAME: JSON.stringify(env.VITE_APP_NAME),
        VITE_LOG_LEVEL: JSON.stringify(env.VITE_LOG_LEVEL),
        VITE_ENABLE_REAL_TIME_TRADING: JSON.stringify(
          env.VITE_ENABLE_REAL_TIME_TRADING
        ),
        VITE_ENABLE_PAPER_TRADING: JSON.stringify(
          env.VITE_ENABLE_PAPER_TRADING
        ),
        VITE_ENABLE_ANALYTICS: JSON.stringify(env.VITE_ENABLE_ANALYTICS),
      },
    },
  };
});
