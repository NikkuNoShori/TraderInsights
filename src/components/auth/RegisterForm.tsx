import { useNavigate } from "react-router-dom";
import { FormInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useState } from "@/lib/react";
import type { FormEvent, ChangeEvent } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";

export function RegisterForm() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const { toast } = useToast();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Register user with Supabase
      await signUp(email, password, username, fullName);

      // Show success message
      toast({
        title: "Account created successfully",
        description: "Please check your email to confirm your account.",
      });

      // Redirect to login page
      navigate("/auth/login");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during registration";
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <FormInput
        id="email"
        type="email"
        label="Email"
        required
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        autoComplete="email"
        className="mt-1"
        placeholder="Enter your email"
      />

      <FormInput
        id="username"
        type="text"
        label="Username"
        required
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
        autoComplete="username"
        className="mt-1"
        placeholder="Choose a username"
      />

      <FormInput
        id="fullName"
        type="text"
        label="Full Name"
        required
        value={fullName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFullName(e.target.value)
        }
        autoComplete="name"
        className="mt-1"
        placeholder="Enter your full name"
      />

      <FormInput
        id="password"
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
        autoComplete="new-password"
        className="mt-1"
        placeholder="Create a password"
      />

      <FormInput
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        required
        value={confirmPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
        autoComplete="new-password"
        className="mt-1"
        placeholder="Confirm your password"
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        variant="default"
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <div className="text-sm text-gray-600 text-center">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </div>
    </form>
  );
}
