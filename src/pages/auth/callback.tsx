import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";

export function AuthCallback() {
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleAuthCallback();
        toast.success("Authentication successful!");
        navigate("/app/dashboard");
      } catch (error) {
        toast.error("Authentication failed. Please try again.");
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate, handleAuthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
} 