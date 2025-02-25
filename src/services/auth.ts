import { supabase } from "@/lib/supabase";
import { AuthError, AuthResponse, User } from "@supabase/supabase-js";
import { validateEmail, validatePassword } from "@/utils/validation";
import { authRateLimit } from "@/lib/services/authRateLimit";

export interface UserMetadata {
  created_at: string;
  last_sign_in: string;
  sign_in_count: number;
  last_seen_at: string;
  preferred_theme?: "light" | "dark";
  onboarding_completed?: boolean;
}

export interface AuthService {
  signIn: (
    email: string,
    password: string,
    ip: string
  ) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  getCurrentUser: () => Promise<User | null>;
  checkUserExists: (email: string) => Promise<boolean>;
  updateUserMetadata: (metadata: Partial<UserMetadata>) => Promise<void>;
  verifyEmail: (token: string) => Promise<{ error: AuthError | null }>;
}

class SupabaseAuthService implements AuthService {
  async signIn(
    email: string,
    password: string,
    ip: string
  ): Promise<AuthResponse> {
    // Check rate limiting before attempting login
    const { allowed, remainingAttempts, lockoutRemaining } =
      await authRateLimit.checkLoginAllowed(ip);

    if (!allowed) {
      const minutes = Math.ceil(lockoutRemaining / 60000);
      return {
        data: { session: null, user: null },
        error: new Error(
          `Too many failed attempts. Please try again in ${minutes} minutes.`
        ) as AuthError,
      };
    }

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      await authRateLimit.recordLoginAttempt(ip, false);
      return {
        data: { session: null, user: null },
        error: new Error(emailValidation.errors[0]) as AuthError,
      };
    }

    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Record the login attempt result
      await authRateLimit.recordLoginAttempt(ip, !response.error);

      if (response.error) {
        if (remainingAttempts > 0) {
          response.error.message = `${response.error.message}. ${remainingAttempts} attempts remaining.`;
        }
        return response;
      }

      if (response.data.session) {
        // Update metadata on successful sign in
        const metadata: Partial<UserMetadata> = {
          last_sign_in: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          sign_in_count:
            (response.data.user?.user_metadata?.sign_in_count || 0) + 1,
        };

        await this.updateUserMetadata(metadata);
      }

      return response;
    } catch (error) {
      await authRateLimit.recordLoginAttempt(ip, false);
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        data: { session: null, user: null },
        error: new Error(emailValidation.errors[0]) as AuthError,
      };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        data: { session: null, user: null },
        error: new Error(passwordValidation.errors[0]) as AuthError,
      };
    }

    // Check if user already exists
    const userExists = await this.checkUserExists(email);
    if (userExists) {
      return {
        data: { session: null, user: null },
        error: new Error(
          "An account with this email already exists. Please sign in instead."
        ) as AuthError,
      };
    }

    const metadata: UserMetadata = {
      created_at: new Date().toISOString(),
      last_sign_in: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sign_in_count: 0,
      onboarding_completed: false,
    };

    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata,
      },
    });
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const user = await this.getCurrentUser();
    if (user) {
      await this.updateUserMetadata({
        last_seen_at: new Date().toISOString(),
      });
    }
    return supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        error: new Error(emailValidation.errors[0]) as AuthError,
      };
    }

    try {
      // Send reset email regardless of whether user exists
      // This is a security best practice to prevent email enumeration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error("Error sending reset password email:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Error in reset password flow:", error);
      return {
        error:
          error instanceof Error
            ? (error as AuthError)
            : (new Error(
                "Failed to process reset password request"
              ) as AuthError),
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Update last seen timestamp
      await this.updateUserMetadata({
        last_seen_at: new Date().toISOString(),
      });
    }
    return user;
  }

  async checkUserExists(email: string): Promise<boolean> {
    try {
      // First validate the email format
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return false;
      }

      // Use sign in attempt to check if user exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy-password-for-check",
      });

      // If we get an "Invalid login credentials" error, the user exists but password was wrong
      // If we get a "User not found" error, the user doesn't exist
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return true; // User exists but password was wrong
        }
        if (error.message.includes("Email not confirmed")) {
          return true; // User exists but hasn't confirmed email
        }
        return false; // Any other error means user doesn't exist
      }

      return true; // If no error, user exists (though this shouldn't happen with dummy password)
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  async updateUserMetadata(metadata: Partial<UserMetadata>): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        console.error("Error updating user metadata:", error);
      }
    } catch (error) {
      console.error("Error updating user metadata:", error);
    }
  }

  async verifyEmail(token: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }
}

export const authService = new SupabaseAuthService();
