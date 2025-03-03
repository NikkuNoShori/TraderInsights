import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      // Save the attempted URL for redirecting after login
      navigate("/auth/login", { 
        replace: true,
        state: { from: location }
      });
    }
  }, [user, isInitialized, isLoading, navigate, location]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 