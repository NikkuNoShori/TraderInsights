import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  // Check if user exists when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (email && email.includes('@')) {
        const exists = await authService.checkUserExists(email);
        setUserExists(exists);
        // Automatically switch mode based on user existence
        setIsSignUp(!exists);
      } else {
        setUserExists(null);
      }
    };

    const debounceTimer = setTimeout(checkUser, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }
        throw error;
      }
      
      if (isSignUp && !data.session) {
        toast.success('Please check your email to confirm your account');
        return;
      }

      if (!data.session) {
        throw new Error('No session returned from authentication');
      }
      
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
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
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset instructions');
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Email address"
            />
            {userExists !== null && (
              <p className="mt-1 text-sm text-gray-500">
                {userExists 
                  ? "Account found! Please sign in."
                  : "No account found. You'll need to sign up."}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}