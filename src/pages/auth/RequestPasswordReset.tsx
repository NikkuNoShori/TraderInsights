import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth';
import { validateEmail } from '../../utils/validation';
import { FormInput } from '../../components/ui/FormInput';
import { LoadingButton } from '../../components/LoadingButton';

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
      // Attempt to send reset email (includes user existence check)
      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        // Handle specific error cases
        if (resetError.message.includes('No account found')) {
          setError('No account found with this email address. Please check the email or sign up.');
          return;
        }
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
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="rounded-md shadow-sm -space-y-px">
          <FormInput
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Back to login
          </button>
        </div>

        <div>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send reset instructions'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
} 