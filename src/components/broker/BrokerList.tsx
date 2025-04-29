import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig, SnaptradeBrokerage } from '@/lib/snaptrade/types';
import { BrokerListProps } from './types';

export function BrokerList({ config, onSelect }: BrokerListProps) {
  const [brokers, setBrokers] = useState<SnaptradeBrokerage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    console.log('BrokerList mounted with config:', {
      hasClientId: !!config.clientId,
      hasConsumerSecret: !!config.consumerSecret,
      redirectUri: config.redirectUri
    });
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting to load brokers...');
      const brokerList = await snapTradeService.getBrokerages();
      console.log('Raw broker list:', JSON.stringify(brokerList, null, 2));
      
      // Filter out brokers without required fields and map to our Broker type
      const validBrokers = brokerList
        .filter((broker): broker is SnaptradeBrokerage => 
          typeof broker.id === 'string' && 
          typeof broker.name === 'string' && 
          typeof broker.description === 'string'
        );
      
      setBrokers(validBrokers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error loading brokers:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(`Failed to load brokers: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading available brokers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error Loading Brokers</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadBrokers}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (brokers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No brokers available at the moment.</p>
        <button 
          onClick={loadBrokers}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Refresh List
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {brokers.map((broker) => (
        <div
          key={broker.id}
          className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50"
          onClick={() => onSelect(broker)}
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
              {broker.authType && (
                <p className="text-xs text-gray-500 mt-1">
                  Auth: {broker.authType}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 