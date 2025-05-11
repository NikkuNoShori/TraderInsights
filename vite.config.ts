import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env variables from .env files
  const env = loadEnv(mode, process.cwd(), ""); // Allow all env vars, not just VITE_ prefixed

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
        // Ensure the API server is running on port 3000 (npm run server)
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, options) => {
            // Add logging for API requests
            proxy.on("error", (err, req, res) => {
              console.error("API proxy error:", err);
            });

            proxy.on("proxyReq", (proxyReq, req, res) => {
              console.log(`Proxying API request: ${req.method} ${req.url}`);
            });

            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log(
                `API response: ${proxyRes.statusCode} for ${req.method} ${req.url}`
              );
            });
          },
        },
        // Proxy for SnapTrade API to handle CORS issues
        "/snaptrade-api": {
          target: "https://api.snaptrade.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/snaptrade-api/, "/api/v1"),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          configure: (proxy, options) => {
            // Add response interceptor for debugging
            proxy.on("error", (err, req, res) => {
              console.error("Proxy error:", err);
              console.error("Original request details:", {
                method: req.method,
                url: req.url,
                headers: req.headers,
              });
            });

            proxy.on("proxyReq", (proxyReq, req, res) => {
              // Log the outgoing request details
              console.log(
                `Proxying request to SnapTrade API: ${req.method} ${req.url}`
              );

              // Get the request body for debugging if available
              // Use type assertion to handle body, which might be added by middleware
              const reqWithBody = req as any;
              if (reqWithBody.body) {
                try {
                  if (typeof reqWithBody.body === "object") {
                    const reqBody = JSON.stringify(reqWithBody.body);
                    console.log(`Request body: ${reqBody}`);
                  } else if (typeof reqWithBody.body === "string") {
                    console.log(`Request body: ${reqWithBody.body}`);
                  }
                } catch (err) {
                  console.log("Unable to log request body");
                }
              }

              // Log SnapTrade specific headers
              if (req.headers["client-id"]) {
                console.log(`Client ID: ${req.headers["client-id"]}`);
              }

              // Log the URL that will be requested after rewrite
              const rewrittenUrl = req.url?.replace(
                /^\/snaptrade-api/,
                "/api/v1"
              );
              console.log(`After rewrite: ${req.method} ${rewrittenUrl}`);
            });

            proxy.on("proxyRes", (proxyRes, req, res) => {
              const statusCode = proxyRes.statusCode || 0;
              console.log(
                `Received response from SnapTrade: ${statusCode} for ${req.method} ${req.url}`
              );

              // Always log headers for debugging
              console.log("Response headers:", proxyRes.headers);

              // Log response body for inspection, especially on errors
              if (statusCode >= 400) {
                console.error(
                  `SnapTrade API error: ${statusCode} ${proxyRes.statusMessage}`
                );
                let rawData = "";

                proxyRes.on("data", (chunk) => {
                  rawData += chunk;
                });

                proxyRes.on("end", () => {
                  try {
                    console.error("SnapTrade error response body:", rawData);

                    // Try to parse JSON errors for better debugging
                    try {
                      const parsedError = JSON.parse(rawData);
                      console.error("Parsed error:", parsedError);
                      if (parsedError.detail) {
                        console.error("Error detail:", parsedError.detail);
                      }
                    } catch (e) {
                      // Not JSON or couldn't parse
                      console.error("Could not parse error as JSON");
                    }
                  } catch (e) {
                    console.error("Error parsing SnapTrade error response", e);
                  }
                });
              }
            });
          },
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
        // Add other env vars as needed
        NODE_ENV: JSON.stringify(env.NODE_ENV),
        SNAPTRADE_CLIENT_ID: JSON.stringify(env.SNAPTRADE_CLIENT_ID),
        SNAPTRADE_CONSUMER_KEY: JSON.stringify(env.SNAPTRADE_CONSUMER_KEY),
        SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
        SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY),
      },
    },
  };
});
