import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profileService";
import { toast } from "react-hot-toast";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

export default function ProfileSettings() {
  const { user, profile: userProfile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    first_name: userProfile?.first_name || "",
    last_name: userProfile?.last_name || "",
    email: user?.email || ""
  });

  // Load initial profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        email: user?.email || ""
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserProfile) => {
    setFormData((prev: UserProfile) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      const updatedProfile = await profileService.updateProfile(
        user.id,
        updates,
      );

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
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange(e, "first_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange(e, "last_name")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange(e, "email")}
                />
              </div>
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
