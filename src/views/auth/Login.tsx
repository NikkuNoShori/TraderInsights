import { useState, useEffect, useRef } from "@/lib/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FormInput } from "@/components/ui/FormInput";
import { LoadingButton } from "@/components/LoadingButton";
import { useAuthStore } from "@/stores/authStore";
import { clearDeveloperMode } from "@/lib/utils/auth";
import { Logo } from "@/components/ui";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const messageShownRef = useRef(false);
  const { user, isLoading, isInitialized, signIn } = useAuthStore();
  const from = location.state?.from?.pathname || "/app/dashboard";

  // Clear developer mode on mount
  useEffect(() => {
    clearDeveloperMode();
  }, []);

  // Handle navigation after successful login
  useEffect(() => {
    if (isInitialized && user && !isLoading) {
      console.log("Navigating to:", from);
      navigate(from, { replace: true });
    }
  }, [isInitialized, user, isLoading, navigate, from]);

  // Show any messages passed via navigation state
  useEffect(() => {
    const message = location.state?.message;
    if (message && !messageShownRef.current) {
      messageShownRef.current = true;
      toast.success(message);
      // Clear the message from history to prevent showing it again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(new Error("Please enter both email and password"));
      return;
    }

    try {
      await signIn(email, password);
      toast.success("Successfully logged in");
      // Navigation will be handled by the useEffect hook above
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        <FormInput
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="text-sm text-error">
            {error.message}
          </div>
        )}

        <div className="space-y-4">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
          >
            Sign In
          </LoadingButton>

          <div className="flex flex-col gap-2 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/auth/register")}
              className="text-muted hover:text-default transition-colors"
            >
              Don't have an account? Sign up
            </button>

            <button
              type="button"
              onClick={() => navigate("/auth/request-reset")}
              className="text-muted hover:text-default transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
