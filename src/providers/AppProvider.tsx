import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { type ReactNode } from "@/lib/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthInitializer />
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
