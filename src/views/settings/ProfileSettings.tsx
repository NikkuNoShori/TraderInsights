import { useState } from '@/lib/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { profileService } from '@/lib/services/profileService';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingButton } from '@/components/LoadingButton';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile: userProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: userProfile?.first_name || '',
    lastName: userProfile?.last_name || '',
    username: userProfile?.username || '',
    email: user?.email || '',
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const validateUsername = (username: string): boolean => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return false;
    }
    setUsernameError(null);
    return true;
  };
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'username') {
      if (userProfile?.username_changes_remaining === 0) {
        setShowPaymentDialog(true);
        return;
      }
      if (!validateUsername(value)) {
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting profile update:', {
        userId: user.id,
        updates: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      const { error: updateError } = await profileService.updateProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (updateError) {
        console.error('Profile update error:', updateError);
        toast.error(updateError.message || 'Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        setIsDirty(false);
        
        // Refresh the page after successful update
        setTimeout(() => {
          navigate('/settings/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard unsaved changes?')) {
        navigate('/settings/profile');
      }
    } else {
      navigate('/settings/profile');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <form onSubmit={handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header section with improved styling */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Update your personal information and manage your account settings.
          </p>
        </div>

        {/* Form fields section with improved layout */}
        <div className="px-8 py-6 space-y-8">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Username section with modern layout */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 max-w-lg">
                <FormInput
                  label="Username"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  error={usernameError}
                  className="w-full"
                  required
                />
                <div className="mt-2 flex items-center space-x-2">
                  {userProfile?.username_changes_remaining !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {userProfile.username_changes_remaining} changes remaining
                    </span>
                  )}
                  {userProfile?.last_username_change && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last changed: {new Date(userProfile.last_username_change).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Name fields with modern grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                required
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>

            {/* Role display with badge */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Type
              </label>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  {
                    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200": userProfile?.role === 'admin',
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": userProfile?.role === 'developer',
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200": userProfile?.role === 'user'
                  }
                )}>
                  {userProfile?.role === 'developer' ? 'Developer' :
                   userProfile?.role === 'admin' ? 'Administrator' :
                   'Standard User'}
                </span>
              </div>
            </div>

            {/* Email field with modern disabled state */}
            <div className="space-y-2">
              <FormInput
                label="Email Address"
                type="email"
                value={formData.email}
                disabled
                required
                className="bg-gray-50 dark:bg-gray-700/50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email address cannot be changed. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Actions section with modern buttons */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Save Changes
          </LoadingButton>
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
              Username changes cost $5 each. This allows you to change your username again.
            </p>
            
            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50">
              <FormInput
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                className="font-mono"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Expiry Date"
                  placeholder="MM/YY"
                />
                <FormInput
                  label="CVC"
                  placeholder="123"
                  maxLength={3}
                />
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
                  toast.success('Username change purchased successfully!');
                  setShowPaymentDialog(false);
                  profileService.updateProfile(user!.id, {
                    username_changes_remaining: 1
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