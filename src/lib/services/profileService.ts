import { supabase } from "../supabase";
import type { Profile } from "../../types/database";

interface ProfileResponse {
  data: Profile | null;
  error: any;
}

interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  username?: string;
  username_changes_remaining?: number;
}

export const profileService = {
  getProfile: async (userId: string): Promise<ProfileResponse> => {
    if (userId === "dev-123") {
      return {
        data: {
          id: "dev-123",
          email: "developer@test.com",
          username: "developer",
          username_changes_remaining: 3,
          last_username_change: null,
          first_name: "Dev",
          last_name: "User",
          date_of_birth: null,
          created_at: new Date().toISOString(),
          role: "developer",
        },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  createProfile: async (
    profile: Omit<Profile, "created_at">,
  ): Promise<ProfileResponse> => {
    console.log("Creating profile:", profile);

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  updateProfile: async (
    userId: string,
    updates: Partial<Profile>,
  ): Promise<ProfileResponse> => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Handle developer mode
    if (userId.startsWith("dev-")) {
      console.log("Developer mode profile update:", updates);
      return {
        data: {
          id: userId,
          email: "dev@example.com",
          first_name: updates.first_name || "Developer",
          last_name: updates.last_name || "Mode",
          username: updates.username || "developer",
          username_changes_remaining: updates.username_changes_remaining || 3,
          last_username_change: updates.last_username_change || null,
          date_of_birth: null,
          created_at: new Date().toISOString(),
          role: "developer" as const,
        },
        error: null,
      };
    }

    console.log("Updating profile:", { userId, updates });

    // Ensure we're only updating allowed fields
    const sanitizedUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      username: updates.username,
      username_changes_remaining: updates.username_changes_remaining,
      last_username_change: updates.last_username_change,
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(sanitizedUpdates)
      .eq("id", userId)
      .select()
      .single();

    console.log("Profile update result:", { data, error });

    return { data, error };
  },

  async purchaseUsernameChange(userId: string, paymentMethodId: string) {
    try {
      // Process payment with Stripe
      // Update username_changes_remaining in database
      const { data, error } = await supabase
        .from("profiles")
        .update({ username_changes_remaining: 1 })
        .eq("id", userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error purchasing username change:", error);
      return { success: false, error };
    }
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Error checking username:", error);
      return false;
    }

    return !data; // Return true if username is available (no data found)
  },

  async updateUsername(
    userId: string,
    newUsername: string,
  ): Promise<ProfileResponse> {
    // First check if username is available
    const isAvailable = await this.checkUsernameAvailability(newUsername);
    if (!isAvailable) {
      return {
        data: null,
        error: new Error("Username is already taken"),
      };
    }

    // Then check if user has changes remaining
    const { data: profile } = await this.getProfile(userId);
    if (!profile || profile.username_changes_remaining <= 0) {
      return {
        data: null,
        error: new Error("No username changes remaining"),
      };
    }

    // Update username and decrement changes remaining
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: newUsername,
        username_changes_remaining: profile.username_changes_remaining - 1,
        last_username_change: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    return { data, error };
  },
};
