import { useState } from "@/lib/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/services/apiClient";
import { validateEmail } from "@/utils/validation";
import { FormInput } from "@/components/ui/FormInput";
import { LoadingButton } from "@/components/LoadingButton";
import { Logo } from "@/components/ui";

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Attempt to send reset email
      const { error: resetError } = await apiClient.auth.resetPassword(email);

      if (resetError) {
        throw resetError;
      }

      // Only show success if no errors occurred
      toast.success("Password reset instructions sent to your email");
      navigate("/auth/login", {
        state: {
          message: "Please check your email for password reset instructions",
        },
      });
    } catch (error) {
      console.error("Failed to process reset request:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to process reset request",
      );
      toast.error("Failed to process reset request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <Logo className="h-12 w-auto" />
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Enter your email to receive reset instructions</p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          {error && <div className="text-sm text-error">{error}</div>}

          <div className="space-y-4">
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
              Reset Password
            </LoadingButton>

            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="w-full text-sm text-muted hover:text-default transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
