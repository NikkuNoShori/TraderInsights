import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/auth";

export class ProfileService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }

  async updateUsername(
    userId: string,
    username: string
  ): Promise<UserProfile | null> {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username_changes_remaining")
        .eq("id", userId)
        .single();

      if (!profile || profile.username_changes_remaining <= 0) {
        throw new Error("No username changes remaining");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          username,
          username_changes_remaining: profile.username_changes_remaining - 1,
          last_username_change: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating username:", error);
      return null;
    }
  }

  async purchaseUsernameChange(userId: string): Promise<UserProfile | null> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username_changes_remaining: 1,
        })
        .eq("id", userId);

      if (error) throw error;

      return this.getProfile(userId);
    } catch (error) {
      console.error("Error purchasing username change:", error);
      return null;
    }
  }
}

export const profileService = new ProfileService();
