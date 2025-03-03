import { useNavigate } from "react-router-dom";
import { FormInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useState } from "@/lib/react";
import type { FormEvent, ChangeEvent } from "@/lib/react";

export function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement registration logic
      navigate("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

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
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        variant="default"
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
