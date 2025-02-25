import { useState } from "@/lib/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profileService";
import { FormInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/ui";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await profileService.updateProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      });

      if (!result) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setTimeout(() => {
        navigate("/settings/profile");
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-border">
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

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
