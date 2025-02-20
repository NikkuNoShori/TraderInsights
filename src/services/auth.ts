import { supabase } from "../lib/supabase";
import { AuthError, AuthResponse, User } from "@supabase/supabase-js";
import { validateEmail, validatePassword } from "../utils/validation";

export interface UserMetadata {
  created_at: string;
  last_sign_in: string;
  sign_in_count: number;
  last_seen_at: string;
  preferred_theme?: "light" | "dark";
  onboarding_completed?: boolean;
}

export interface AuthService {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  getCurrentUser: () => Promise<User | null>;
  checkUserExists: (email: string) => Promise<boolean>;
  updateUserMetadata: (
    userId: string,
    metadata: Partial<UserMetadata>
  ) => Promise<void>;
  verifyEmail: (token: string) => Promise<{ error: AuthError | null }>;
}

class SupabaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        data: { session: null, user: null },
        error: new Error(emailValidation.errors[0]) as AuthError,
      };
    }

    // First check if the user exists
    const userExists = await this.checkUserExists(email);
    if (!userExists) {
      return {
        data: { session: null, user: null },
        error: new Error(
          "No account found with this email. Please sign up first."
        ) as AuthError,
      };
    }

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.data.session) {
      // Update metadata on successful sign in
      const metadata: Partial<UserMetadata> = {
        last_sign_in: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        sign_in_count:
          (response.data.user?.user_metadata?.sign_in_count || 0) + 1,
      };

      await this.updateUserMetadata(response.data.user!.id, metadata);
    }

    return response;
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
      await this.updateUserMetadata(user.id, {
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

    // Check if user exists before sending reset email
    const userExists = await this.checkUserExists(email);
    if (!userExists) {
      return {
        error: new Error("No account found with this email.") as AuthError,
      };
    }

    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Update last seen timestamp
      await this.updateUserMetadata(user.id, {
        last_seen_at: new Date().toISOString(),
      });
    }
    return user;
  }

  async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error checking user existence:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  async updateUserMetadata(
    userId: string,
    metadata: Partial<UserMetadata>
  ): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
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
