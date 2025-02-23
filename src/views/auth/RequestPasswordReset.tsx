import { useState } from '@/lib/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../lib/services/apiClient';
import { validateEmail } from '../../utils/validation';
import { FormInput } from '../../components/ui/FormInput';
import { LoadingButton } from '../../components/LoadingButton';
import { useAuthStore } from '../../stores/authStore';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Attempt to send reset email
      const { error: resetError } = await apiClient.auth.resetPassword(email);

      if (resetError) {
        throw resetError;
      }

      // Only show success if no errors occurred
      toast.success('Password reset instructions sent to your email');
      navigate('/auth/login', { 
        state: { message: 'Please check your email for password reset instructions' }
      });
    } catch (error) {
      console.error('Failed to process reset request:', error);
      setError(error instanceof Error ? error.message : 'Failed to process reset request');
      toast.error('Failed to process reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          type="email"
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Reset Password
          </LoadingButton>

          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
} 