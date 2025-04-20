import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { snapTradeService } from '@/services/snaptradeService';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { SnaptradeBrokerage, SnapTradeUser } from '@/lib/snaptrade/types';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializeAttempts, setInitializeAttempts] = useState(0);
  // Ref to track initialization in progress
  const initializingRef = useRef(false);

  // Ensure we have valid credentials
  const ensureSnapTradeConfig = async () => {
    try {
      const config = getSnapTradeConfig();
      if (!config.clientId || !config.consumerKey) {
        throw new Error("Missing SnapTrade credentials");
      }
      
      // Check for demo credentials
      if (config.clientId === 'TRADING-INSIGHTS-TEST-MJFEC') {
        console.warn("Using demo SnapTrade credentials. These may not work for all requests.");
      }
      
      return config;
    } catch (error) {
      console.error("Failed to get SnapTrade config:", error);
      setBrokerError(error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  // Initialize SnapTrade service and data
  useEffect(() => {
    // Guard against multiple concurrent initializations (React StrictMode causes double render)
    if (initializingRef.current) {
      console.log('Initialization already in progress, skipping');
      return;
    }

    const initialize = async () => {
      // Early return if no user ID or already initialized
      if (!user?.id || isInitialized) return;
      
      // Set initializing flag to prevent duplicate calls
      initializingRef.current = true;
      
      // Limit initialization attempts to prevent infinite loops
      if (initializeAttempts > 3) {
        setBrokerError("Failed to initialize after multiple attempts. Please refresh the page and try again.");
        initializingRef.current = false;
        return;
      }
      
      setInitializeAttempts(prev => prev + 1);

      try {
        const config = await ensureSnapTradeConfig();
        if (!config) {
          initializingRef.current = false;
          return;
        }

        // Ensure we have a valid user ID
        const userId = user.id;
        console.log('Initializing with user ID:', userId);
        
        // Initialize SnapTrade service
        await snapTradeService.initialize(config);

        // Load brokers first (doesn't require registration)
        try {
          console.log('Loading brokers...');
          const brokerList = await snapTradeService.getBrokerages();
          console.log('Loaded brokers:', brokerList);
          setBrokers(brokerList);
          
          // If we've gotten this far, let's consider it partially initialized
          // so the user can at least see the broker list
          setIsInitialized(true);
        } catch (brokerError) {
          console.error("Failed to load brokers:", brokerError);
          // Continue even if broker listing fails
        }

        // Use isUserRegistered to check if the user is already registered
        // This prevents unnecessary registration attempts
        const isAlreadyRegistered = snapTradeService.isUserRegistered();
        console.log('User registration status:', { isAlreadyRegistered });

        // Register user if not already registered
        if (!isAlreadyRegistered) {
          console.log('Registering user:', userId);
          try {
            await registerUser(userId);
            toast.success("Successfully registered with SnapTrade");
            
            // Sync broker data after successful registration
            try {
              await syncAllData();
              toast.success("Account data synchronized successfully");
            } catch (syncError) {
              console.error("Failed to sync data:", syncError);
              toast.error("Failed to sync account data");
              // Continue even if sync fails
            }
          } catch (registrationError) {
            console.error("Registration failed:", registrationError);
            // Registration failed, but we've already shown the brokers,
            // so just show a toast error without blocking the UI
            toast.error("Registration failed. Some features may be limited.");
          }
        } else {
          console.log('User already registered, skipping registration');
          // User is already registered, sync data
          try {
            await syncAllData();
          } catch (syncError) {
            console.error("Failed to sync data:", syncError);
            toast.error("Failed to sync account data");
          }
        }
      } catch (err) {
        console.error("Failed to initialize broker data:", err);
        setBrokerError(err instanceof Error ? err.message : String(err));
        toast.error("Failed to load broker data. Please try again.");
      } finally {
        // Reset initialization flag regardless of success/failure
        initializingRef.current = false;
      }
    };

    initialize();
  }, [user, registerUser, syncAllData, isInitialized, initializeAttempts]);

  const handleConnect = async (broker: SnaptradeBrokerage) => {
    if (!user) return;
    
    try {
      setConnectingBrokerId(broker.id);
      console.log('Creating connection link for broker:', broker.name);
      
      const snapTradeUser = snapTradeService.getUser();
      if (!snapTradeUser) {
        throw new Error('User not registered with SnapTrade');
      }
      
      // Extract and validate userId and userSecret
      const { userId, userSecret } = snapTradeUser;
      
      if (!userId || !userSecret) {
        throw new Error('Invalid SnapTrade user data');
      }
      
      const connectionData = await snapTradeService.createConnectionLink(
        userId,
        userSecret
      );
      
      if (!connectionData?.redirectUri) {
        throw new Error('No redirect URI received from SnapTrade');
      }
      
      // Navigate to the authorization URL
      window.location.href = connectionData.redirectUri;
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
          <Button 
            className="mt-2" 
            variant="outline" 
            onClick={() => {
              setBrokerError(null);
              setInitializeAttempts(0);
              setIsInitialized(false);
              initializingRef.current = false; // Reset initializing flag
            }}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (isLoading && brokers.length === 0) {
      return (
        <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <span className="animate-spin mr-2">⏳</span>
            <span>Loading brokers...</span>
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
              {connectingBrokerId === broker.id ? 'Connecting...' : 'Connect'}
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