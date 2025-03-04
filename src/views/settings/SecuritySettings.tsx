import { useState } from "@/lib/react";
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
    <div className="max-w-3xl mx-auto bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
      <div className="divide-y divide-border dark:divide-border">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-foreground dark:text-dark-text">
            Security
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-dark-muted">
            Manage your account security settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="space-y-6">
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

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
