import { useState, useEffect } from "@/lib/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profileService";
import { FormInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/ui";
import type { UserProfile } from "@/types";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
  });

  // Load initial profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || user?.email || "",
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      };

      const updatedProfile = await profileService.updateProfile(user.id, updates);

      if (!updatedProfile) {
        throw new Error("Failed to update profile");
      }

      // Update the profile in the auth store
      setProfile(updatedProfile);

      toast.success("Profile updated successfully");
      setLoading(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
      <div className="divide-y divide-border dark:divide-border">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-foreground dark:text-dark-text">
            Profile
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-dark-muted">
            Manage your personal information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="sm:col-span-2"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
