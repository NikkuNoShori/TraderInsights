import { useState } from "@/lib/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profileService";
import { FormInput } from "@/components/ui/FormInput";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import { PageHeader } from "@/components/ui";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile: userProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: userProfile?.first_name || "",
    lastName: userProfile?.last_name || "",
    username: userProfile?.username || "",
    email: user?.email || "",
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const validateUsername = (username: string): boolean => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameError(
        "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      );
      return false;
    }
    setUsernameError(null);
    return true;
  };
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === "username") {
      if (userProfile?.username_changes_remaining === 0) {
        setShowPaymentDialog(true);
        return;
      }
      if (!validateUsername(value)) {
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

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
      setIsDirty(false);

      // Refresh the page after successful update
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

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("Discard unsaved changes?")) {
        navigate("/settings/profile");
      }
    } else {
      navigate("/settings/profile");
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

      {/* Payment Dialog with modern styling */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Purchase Username Change
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Username changes cost $5 each. This allows you to change your
              username again.
            </p>

            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50">
              <FormInput
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                className="font-mono"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Expiry Date" placeholder="MM/YY" />
                <FormInput label="CVC" placeholder="123" maxLength={3} />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Username change purchased successfully!");
                  setShowPaymentDialog(false);
                  profileService.updateProfile(user!.id, {
                    username_changes_remaining: 1,
                  });
                }}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Pay $5
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
