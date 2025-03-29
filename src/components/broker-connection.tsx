import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSnapTradeStore } from '@/stores/snapTradeStore';
import { snapTradeAPI } from '@/lib/snaptrade/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Broker {
  id: string;
  name: string;
  display_name: string;
  description: string;
  url: string;
  logo_url: string;
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
  const { userData } = useSnapTradeStore();
  const { toast } = useToast();

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      const availableBrokers = await snapTradeAPI.getBrokers();
      setBrokers(availableBrokers);
    } catch (error) {
      console.error('Error loading brokers:', error);
      toast({
        title: "Error",
        description: "Failed to load available brokers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrokerSelect = (broker: Broker) => {
    setSelectedBroker(broker);
    setError(null);
  };

  const handleConnect = async (broker: Broker) => {
    try {
      if (!userData?.snapTradeUserId) {
        throw new Error('No SnapTrade user ID found');
      }

      // Get the connection URL for the selected broker
      const response = await fetch(`/api/snaptrade/connect?brokerId=${broker.id}&userId=${userData.snapTradeUserId}`);
      const data = await response.json();

      if (data.url) {
        // Open the broker connection page in a new window
        window.open(data.url, '_blank');
      } else {
        throw new Error('No connection URL received');
      }
    } catch (error) {
      console.error('Error connecting to broker:', error);
      toast({
        title: "Error",
        description: "Failed to connect to broker. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Brokers</CardTitle>
          <CardDescription>Loading available brokers...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Brokers</CardTitle>
        <CardDescription>Connect your trading account to import trades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokers.map((broker) => (
            <Card key={broker.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {broker.logo_url && (
                    <img
                      src={broker.logo_url}
                      alt={broker.name}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{broker.display_name}</CardTitle>
                    <CardDescription>{broker.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button
                  onClick={() => handleConnect(broker)}
                  className="w-full"
                >
                  Connect {broker.display_name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 