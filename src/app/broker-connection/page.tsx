'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';
import { BrokerList } from '@/components/broker-list';

interface Broker {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export default function BrokerConnectionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'init' | 'select' | 'connect' | 'success' | 'error'>('init');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Get these from your app's state management or session
  const config: SnapTradeConfig = {
    clientId: process.env.VITE_SNAPTRADE_CLIENT_ID || '',
    consumerSecret: process.env.VITE_SNAPTRADE_CONSUMER_SECRET || '',
    redirectUri: process.env.VITE_SNAPTRADE_REDIRECT_URI || `${window.location.origin}/broker-callback`,
  };

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    initializeConnection();
  }, []);

  const initializeConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user ID from session
      const userId = localStorage.getItem('snaptrade_user_id');
      if (!userId) {
        throw new Error('User not found');
      }

      // Check if user is registered
      let userSecret = localStorage.getItem('snaptrade_user_secret');
      if (!userSecret) {
        userSecret = await snapTradeService.registerUser(userId);
        localStorage.setItem('snaptrade_user_secret', userSecret);
      }

      setStep('select');
    } catch (err) {
      setError('Failed to initialize connection. Please try again.');
      console.error('Error initializing connection:', err);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrokerSelect = (broker: Broker) => {
    setSelectedBroker(broker);
    setStep('connect');
  };

  const handleConnect = async () => {
    if (!selectedBroker) return;

    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('snaptrade_user_id');
      const userSecret = localStorage.getItem('snaptrade_user_secret');

      if (!userId || !userSecret) {
        throw new Error('User session not found');
      }

      const connectionUrl = await snapTradeService.createConnectionLink(
        userId,
        userSecret,
        selectedBroker.id,
        config.redirectUri
      );

      // Redirect to broker's OAuth page
      window.location.href = connectionUrl;
    } catch (err) {
      setError('Failed to initiate broker connection. Please try again.');
      console.error('Error connecting to broker:', err);
      setStep('error');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'init':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Initializing Connection</h2>
            <p className="text-gray-600">Please wait while we set up your account...</p>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Select Your Broker</h2>
              <p className="text-gray-600">
                Choose your broker from the list below to connect your account.
              </p>
            </div>

            <BrokerList config={config} onSelect={handleBrokerSelect} />
          </div>
        );

      case 'connect':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Connecting to {selectedBroker?.name}</h2>
            <p className="text-gray-600 mb-6">
              You will be redirected to {selectedBroker?.name}'s login page.
              Please complete the authentication process.
            </p>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Connecting...' : 'Continue to Login'}
            </button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Connection Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your {selectedBroker?.name} account has been successfully connected.
            </p>
            <button
              onClick={() => router.push('/trading-journal')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue to Trading Journal
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setStep('init')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
} 