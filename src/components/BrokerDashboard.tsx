import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { snapTradeService } from '@/services/snaptradeService';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { SnaptradeBrokerage } from '@/lib/snaptrade/types';

export default function BrokerDashboard() {
  const { user } = useAuthStore();
  const { 
    connections, 
    accounts, 
    positions, 
    balances, 
    orders, 
    isLoading, 
    error,
    lastSyncTime,
    registerUser,
    syncAllData 
  } = useBrokerDataStore();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<SnaptradeBrokerage[]>([]);
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [connectingBrokerId, setConnectingBrokerId] = useState<string | null>(null);

  // Initialize SnapTrade service
  useEffect(() => {
    try {
      const config = getSnapTradeConfig();
      snapTradeService.initialize(config);
    } catch (err) {
      console.error("Failed to initialize SnapTrade service:", err);
      setBrokerError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeBrokerData = async () => {
      if (!user) return;

      try {
        // Register user if not already registered
        if (!snapTradeService.isUserRegistered()) {
          console.log('Registering user:', user.id);
          await registerUser(user.id);
        }

        // Load brokers
        console.log('Loading brokers...');
        const brokerList = await snapTradeService.getBrokerages();
        console.log('Loaded brokers:', brokerList);
        setBrokers(brokerList);

        // Sync broker data
        await syncAllData();
      } catch (err) {
        console.error("Failed to initialize broker data:", err);
        setBrokerError(err instanceof Error ? err.message : String(err));
        toast.error("Failed to load broker data. Please try again.");
      }
    };

    initializeBrokerData();
  }, [user, registerUser, syncAllData]);

  const handleConnect = async (broker: SnaptradeBrokerage) => {
    if (!user) return;
    
    try {
      setConnectingBrokerId(broker.id);
      console.log('Creating connection link for broker:', broker.name);
      
      const snapTradeUser = snapTradeService.getUser();
      if (!snapTradeUser) {
        throw new Error('User not registered with SnapTrade');
      }
      
      const connectionUrl = await snapTradeService.createConnectionLink(
        snapTradeUser.userId,
        snapTradeUser.userSecret
      );
      
      window.location.href = connectionUrl;
    } catch (error) {
      console.error('Failed to connect to broker:', error);
      toast.error('Failed to connect to broker. Please try again.');
    } finally {
      setConnectingBrokerId(null);
    }
  };

  // Render broker list
  const renderBrokerList = () => {
    if (brokerError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span>{brokerError}</span>
          </div>
        </div>
      );
    }

    if (brokers.length === 0) {
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <span>No brokers available. Please try again later.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker) => (
          <div key={broker.id} className="flex items-center gap-4 p-4 bg-card rounded-lg">
            <img src={broker.logo} alt={broker.name} className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{broker.name}</h3>
              <p className="text-sm text-muted">{broker.url}</p>
              <p className="text-sm">
                Authentication: {broker.isOAuthSupported ? 'OAuth' : ''} 
                {broker.isOAuthSupported && broker.isCredentialsSupported ? ' & ' : ''}
                {broker.isCredentialsSupported ? 'Credentials' : ''}
              </p>
            </div>
            <Button
              onClick={() => handleConnect(broker)}
              disabled={connectingBrokerId === broker.id}
              variant="default"
            >
              Connect
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Broker Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage your broker accounts and positions
        </p>
      </div>

      {renderBrokerList()}
    </div>
  );
} 