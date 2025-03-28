import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';

interface Broker {
  id: string;
  name: string;
  description: string;
  logo?: string;
  authType?: string;
  [key: string]: any; // Allow additional properties
}

interface BrokerListProps {
  config: SnapTradeConfig;
  onSelect: (broker: Broker) => void;
}

export function BrokerList({ config, onSelect }: BrokerListProps) {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const brokerList = await snapTradeService.getBrokerages();
      console.log('Raw broker list:', JSON.stringify(brokerList, null, 2));
      
      // Filter out brokers without required fields and map to our Broker type
      const validBrokers = brokerList
        .filter((broker): broker is Broker => 
          typeof broker.id === 'string' && 
          typeof broker.name === 'string' && 
          typeof broker.description === 'string'
        );
      
      // Log Webull specifically if found
      const webull = validBrokers.find(b => b.name.toLowerCase().includes('webull'));
      if (webull) {
        console.log('Webull broker details:', JSON.stringify(webull, null, 2));
      }

      setBrokers(validBrokers);
    } catch (err) {
      setError('Failed to load brokers. Please try again later.');
      console.error('Error loading brokers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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

  if (brokers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No brokers available at the moment.
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