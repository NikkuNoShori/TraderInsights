import { useState } from "@/lib/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { validatePassword } from "@/utils/validation";
import { FormInput } from "@/components/ui";
import { LoadingButton } from "@/components/LoadingButton";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Clear any stored auth state after password reset
      await supabase.auth.signOut();

      toast.success("Password updated successfully");
      navigate("/auth/login", {
        state: {
          message:
            "Your password has been reset. Please log in with your new password.",
        },
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please request a new reset link.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside pl-2">
              <li>At least 8 characters long</li>
              <li>Must contain at least one uppercase letter</li>
              <li>Must contain at least one lowercase letter</li>
              <li>Must contain at least one number</li>
              <li>Must contain at least one special character</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Back to login
          </button>
          <LoadingButton
            type="submit"
            isLoading={loading}
            disabled={!password || password !== confirmPassword}
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
