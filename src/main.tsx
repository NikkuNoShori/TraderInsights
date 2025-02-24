import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/globals.css";

console.log("[main] Starting initialization");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("[main] Root element not found");
  }

  console.log("[main] Creating root and attempting render");

  const app = (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Add window error handlers
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error("[Window Error]", { msg, url, lineNo, columnNo, error });
    return false;
  };

  window.onunhandledrejection = function (event) {
    console.error("[Unhandled Promise Rejection]", event.reason);
  };

  ReactDOM.createRoot(root).render(app);
  console.log("[main] Initial render complete");
} catch (error) {
  console.error("[main] Fatal initialization error:", error);
  // Try to show error on page
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Fatal Error</h1>
      <pre style="white-space: pre-wrap;">${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
