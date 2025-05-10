import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env variables from .env files
  const env = loadEnv(mode, process.cwd(), ["VITE_"]);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/contexts": path.resolve(__dirname, "./src/contexts"),
        "@/providers": path.resolve(__dirname, "./src/providers"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "@/utils": path.resolve(__dirname, "./src/utils"),
        "@/stores": path.resolve(__dirname, "./src/stores"),
        "@/types": path.resolve(__dirname, "./src/types"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/config": path.resolve(__dirname, "./src/config"),
        "@/services": path.resolve(__dirname, "./src/services"),
        "@/../": path.resolve(__dirname, "./src"),
        "@/../components": path.resolve(__dirname, "./src/components"),
        "@/../lib": path.resolve(__dirname, "./src/lib"),
        "@/../utils": path.resolve(__dirname, "./src/utils"),
        "@/../types": path.resolve(__dirname, "./src/types"),
        "@/../stores": path.resolve(__dirname, "./src/stores"),
        "@/../config": path.resolve(__dirname, "./src/config"),
        "@/../services": path.resolve(__dirname, "./src/services"),
        "@/../hooks": path.resolve(__dirname, "./src/hooks"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: false,
      proxy: {
        // For local Next.js API routes
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
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
            charts: ["recharts"],
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
