import { useState, useEffect, useRef } from "@/lib/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { validatePassword } from "@/utils/validation";
import { FormInput } from "@/components/ui/FormInput";
import { LoadingButton } from "@/components/LoadingButton";
import { useAuthStore } from "@/stores/authStore";
import { clearDeveloperMode } from "@/lib/utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messageShownRef = useRef(false);
  const { user, isLoading, isInitialized, signIn, signUp } = useAuthStore();
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

  // Reset state when switching modes
  const resetState = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError(new Error("Please enter both email and password"));
      return false;
    }

    if (isSignUp) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(new Error(passwordValidation.errors[0]));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created successfully");
      } else {
        await signIn(email, password);
        toast.success("Successfully logged in");
      }
      // Navigation will be handled by the useEffect hook above
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
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
        placeholder={isSignUp ? "Create a password" : "Enter your password"}
        required
        autoComplete={isSignUp ? "new-password" : "current-password"}
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
          {isSignUp ? "Create Account" : "Sign In"}
        </LoadingButton>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetState();
          }}
          className="w-full text-sm text-muted hover:text-default transition-colors"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>

        {!isSignUp && (
          <button
            type="button"
            onClick={() => navigate("/auth/request-reset")}
            className="w-full text-sm text-muted hover:text-default transition-colors"
          >
            Forgot your password?
          </button>
        )}
      </div>
    </form>
  );
}
