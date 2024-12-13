import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/ui/Logo';
import { toast } from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickLoading, setIsQuickLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      if (!data.session) {
        throw new Error('No session returned from authentication');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'dev' | 'customer') => {
    setIsQuickLoading(true);
    try {
      const credentials = type === 'dev'
        ? { email: 'nickneal17@gmail.com', password: 'SuperSecret123!' }
        : { email: 'nickneal17+customer@gmail.com', password: 'SuperSecret123!' };

      console.log('Attempting login with:', { type, email: credentials.email });

      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        console.error('Authentication error:', error);
        throw error;
      }

      if (!data.session) {
        console.error('No session returned');
        throw new Error('No session returned from authentication');
      }

      console.log('Login successful:', { user: data.user, session: data.session });

      if (type === 'dev') {
        localStorage.setItem('developer-mode', 'true');
        console.log('Developer mode enabled');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsQuickLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400">
              Or quick login
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleQuickLogin('dev')}
            disabled={isQuickLoading}
            className="flex-1 py-2 px-4 border border-primary-200 dark:border-primary-800 rounded-md
                     text-sm font-medium text-primary-700 dark:text-primary-300
                     bg-primary-50 dark:bg-primary-900/20
                     hover:bg-primary-100 dark:hover:bg-primary-900/30
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isQuickLoading ? 'Signing in...' : 'Development Login'}
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            disabled={isQuickLoading}
            className="flex-1 py-2 px-4 border border-primary-200 dark:border-primary-800 rounded-md
                     text-sm font-medium text-primary-700 dark:text-primary-300
                     bg-primary-50 dark:bg-primary-900/20
                     hover:bg-primary-100 dark:hover:bg-primary-900/30
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isQuickLoading ? 'Signing in...' : 'Customer Login'}
          </button>
        </div>
      </div>
    </div>
  );
}