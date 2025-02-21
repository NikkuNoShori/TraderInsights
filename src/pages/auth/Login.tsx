import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth';
import { validatePassword } from '../../utils/validation';
import { FormInput } from '../../components/ui/FormInput';
import { LoadingButton } from '../../components/LoadingButton';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Show any messages passed via navigation state
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      toast.success(message);
      // Clear the message from history to prevent showing it again
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Reset state when switching modes
  const resetState = () => {
    setEmail('');
    setPassword('');
    setIsLoading(false);
    setUserExists(null);
    setError(null);
  };

  // Check if user exists when email changes
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const checkUser = async () => {
      if (email && email.includes('@')) {
        setIsCheckingEmail(true);
        try {
          const exists = await authService.checkUserExists(email);
          setUserExists(exists);
          // Automatically switch mode based on user existence
          setIsSignUp(!exists);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setUserExists(null);
      }
    };

    debounceTimer = setTimeout(checkUser, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

  const validateForm = () => {
    if (isSignUp) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = isSignUp 
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('already exists')) {
          setIsSignUp(false);
          throw new Error('Account already exists. Please sign in instead.');
        } else if (error.message?.includes('not found')) {
          setIsSignUp(true);
          throw new Error('No account found. Please sign up first.');
        } else if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
      
      if (isSignUp && !data.session) {
        toast.success('Please check your email to confirm your account');
        resetState();
        return;
      }

      if (!data.session) {
        throw new Error('No session returned from authentication');
      }
      
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
      resetState();
      navigate('/auth/login', { 
        state: { message: 'Please check your email for password reset instructions' }
      });
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset instructions');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetState();
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6" aria-label={isSignUp ? "Sign up form" : "Sign in form"}>
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoComplete="email"
            disabled={isLoading}
            aria-label="Email address"
          />
          {isCheckingEmail && (
            <p className="mt-1 text-sm text-gray-500">
              Checking email...
            </p>
          )}
          {!isCheckingEmail && userExists !== null && (
            <p className="mt-1 text-sm text-gray-500" role="status">
              {userExists 
                ? "Account found! Please sign in."
                : "No account found. You'll need to sign up."}
            </p>
          )}

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={isSignUp ? "Create a password" : "Enter your password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            disabled={isLoading}
            aria-label="Password"
          />

          {isSignUp && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside pl-2">
                <li>At least 8 characters long</li>
                <li>Must contain at least one uppercase letter</li>
                <li>Must contain at least one lowercase letter</li>
                <li>Must contain at least one number</li>
                <li>Must contain at least one special character</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
          {!isSignUp && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </button>
          )}
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || isCheckingEmail}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
        </LoadingButton>
      </form>
    </div>
  );
}