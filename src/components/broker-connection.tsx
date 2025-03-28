import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';

interface Broker {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

interface BrokerConnectionProps {
  config: SnapTradeConfig;
  userId: string;
  userSecret: string;
}

export function BrokerConnection({ config, userId, userSecret }: BrokerConnectionProps) {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    initializeSnapTrade();
  }, []);

  const initializeSnapTrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Register user if not already registered
      if (!userSecret) {
        const newUserSecret = await snapTradeService.registerUser(userId);
        // Store the user secret
        localStorage.setItem('snaptrade_user_secret', newUserSecret);
      }

      // Load brokers
      const brokerList = await snapTradeService.getBrokerages();
      // Filter out brokers without required fields and map to our Broker type
      const validBrokers = brokerList
        .filter((broker): broker is Broker => 
          typeof broker.id === 'string' && 
          typeof broker.name === 'string' && 
          typeof broker.description === 'string'
        );
      setBrokers(validBrokers);
    } catch (err) {
      setError('Failed to initialize SnapTrade. Please try again later.');
      console.error('Error initializing SnapTrade:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrokerSelect = (broker: Broker) => {
    setSelectedBroker(broker);
    setError(null);
  };

  const handleConnect = async () => {
    if (!selectedBroker) return;

    try {
      setIsConnecting(true);
      setError(null);

      // Create connection link
      const redirectUri = `${window.location.origin}/broker-callback`;
      const connectionUrl = await snapTradeService.createConnectionLink(
        userId,
        userSecret,
        selectedBroker.id,
        redirectUri
      );

      // Redirect to broker's OAuth page
      window.location.href = connectionUrl;
    } catch (err) {
      setError('Failed to initiate broker connection. Please try again.');
      console.error('Error connecting to broker:', err);
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Initializing SnapTrade</h2>
          <p className="text-gray-600">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Broker</h2>
        <p className="text-gray-600">
          Select your broker from the list below to connect your account.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedBroker?.id === broker.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleBrokerSelect(broker)}
          >
            <div className="flex items-center space-x-3">
              {broker.logo && (
                <img
                  src={broker.logo}
                  alt={broker.name}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <h3 className="font-semibold">{broker.name}</h3>
                <p className="text-sm text-gray-600">{broker.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBroker && (
        <div className="mt-6">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium ${
              isConnecting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConnecting ? 'Connecting...' : `Connect to ${selectedBroker.name}`}
          </button>
        </div>
      )}
    </div>
  );
} 