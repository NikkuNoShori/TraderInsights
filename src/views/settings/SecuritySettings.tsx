import { useState } from "@/lib/react";
import { PageHeader } from "@/components/ui";
import { FormInput } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement password change logic
    } catch (error) {
      console.error("Failed to change password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        subtitle="Manage your account security settings"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>

          <div className="space-y-4">
            <FormInput
              type="password"
              label="Current Password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
            />
            <FormInput
              type="password"
              label="New Password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
            <FormInput
              type="password"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
