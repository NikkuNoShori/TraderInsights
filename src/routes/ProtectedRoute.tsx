import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth/login" replace />;
} 