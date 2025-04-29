import React, { useEffect, useState } from 'react';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';

interface ImportTradeFormProps {
  config: SnapTradeConfig;
  userId: string;
}

export function ImportTradeForm({ config, userId }: ImportTradeFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSecret, setUserSecret] = useState<string | null>(null);

  const snapTradeClient = new SnapTradeClient(config);

  useEffect(() => {
    initializeSnapTrade();
  }, []);

  const initializeSnapTrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is already registered
      const storedUserSecret = localStorage.getItem('snaptrade_user_secret');
      if (storedUserSecret) {
        setUserSecret(storedUserSecret);
        setIsLoading(false);
        return;
      }

      // Register new user
      const response = await snapTradeClient.registerUser(userId);
      localStorage.setItem('snaptrade_user_secret', response.userSecret);
      setUserSecret(response.userSecret);
    } catch (err) {
      setError('Failed to initialize SnapTrade. Please try again later.');
      console.error('Error initializing SnapTrade:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Initializing SnapTrade</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!userSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Failed to initialize SnapTrade. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div>
      {/* Your existing form content */}
    </div>
  );
} 