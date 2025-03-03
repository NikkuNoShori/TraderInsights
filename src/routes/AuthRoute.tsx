import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import React from "react";

interface AuthRouteProps {
  children: React.ReactNode;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const { user, isLoading } = useAuthStore();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
} 