import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { snapTradeService } from '@/services/snaptradeService';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Info } from 'lucide-react';
import { SnaptradeBrokerage, SnapTradeUser } from '@/lib/snaptrade/types';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { Tooltip } from '@/components/ui/Tooltip';
import { useDebugStore } from '@/stores/debugStore';

// Known list of all supported brokers (to be updated as SnapTrade adds more)
const ALL_SUPPORTED_BROKERS = [
  'Ally Invest',
  'Alpaca',
  'Binance',
  'Binance.US',
  'Charles Schwab', // Includes TD Ameritrade
  'Coinbase',
  'E*TRADE',
  'Fidelity',
  'Firstrade',
  'Interactive Brokers',
  'M1 Finance',
  'Merrill Edge',
  'Merrill Lynch',
  'Questrade',
  'Robinhood',
  'Tastyworks',
  'TradeStation',
  'Vanguard',
  'Webull',
  'Wealthsimple',
  'Wells Fargo',
  'Zacks Trade'
];

// Create a mock user for demo mode
const MOCK_USER: SnapTradeUser = {
  userId: "demo-user",
  userSecret: "demo-secret"
};

// Helper function to store a mock user
const storeMockUser = (mockUser: SnapTradeUser) => {
  StorageHelpers.saveUser(mockUser);
};

// Storage key for broker session persistence
const SESSION_STORAGE_KEY = 'broker_session_state';

// Helper to save session state
const saveBrokerSessionState = (state: any) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save broker session state:', error);
  }
};

// Helper to load session state
const loadBrokerSessionState = () => {
  try {
    const savedState = localStorage.getItem(SESSION_STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Failed to load broker session state:', error);
    return null;
  }
};

// Create debug logger factory
const createCategoryLogger = (category: string) => {
  return {
    debug: (message: string, data?: any) => {
      if (useDebugStore.getState().isDebugMode) {
        console.log(`[${category}] ${message}`, data);
      }
    },
    info: (message: string, data?: any) => {
      if (useDebugStore.getState().isDebugMode) {
        console.info(`[${category}] ${message}`, data);
      }
    },
    warn: (message: string, data?: any) => {
      if (useDebugStore.getState().isDebugMode) {
        console.warn(`[${category}] ${message}`, data);
      }
    },
    error: (message: string, data?: any) => {
      if (useDebugStore.getState().isDebugMode) {
        console.error(`[${category}] ${message}`, data);
      }
    }
  };
};

// Create debug loggers for different categories
const brokerLogger = createCategoryLogger('broker');
const apiLogger = createCategoryLogger('api');

export default function BrokerDashboard() {
  const { user } = useAuthStore();
  const { 
    connections, 
    accounts, 
    positions, 
    balances, 
    orders, 
    isLoading, 
    error: brokerError,
    lastSyncTime,
    registerUser,
    syncAllData 
  } = useBrokerDataStore();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [connectingBrokerId, setConnectingBrokerId] = useState<string | null>(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [initializeAttempts, setInitializeAttempts] = useState(0);
  
  // Use debug store for state management
  const { 
    setDebugState, 
    brokerState: { 
      isInitialized, 
      brokers: debugBrokers, 
      loadingBrokers, 
      missingBrokers 
    },
    isDebugMode
  } = useDebugStore();
  
  const [brokers, setBrokers] = useState<SnaptradeBrokerage[]>([]);

  // Memoize configuration
  const config = useMemo(() => getSnapTradeConfig(), []);

  // Optimized debug logging
  const logDebug = useCallback((message: string, data?: any) => {
    if (isInitialized) {
      brokerLogger.debug(message, data);
    }
  }, [isInitialized]);

  // Sync local brokers state with debug store
  useEffect(() => {
    if (debugBrokers.length > 0) {
      setBrokers(debugBrokers);
    }
  }, [debugBrokers]);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Load persisted session state on mount
  useEffect(() => {
    const savedState = loadBrokerSessionState();
    if (savedState) {
      if (savedState.readOnlyMode !== undefined) setReadOnlyMode(savedState.readOnlyMode);
      if (savedState.isInitialized !== undefined) setDebugState({ isInitialized: savedState.isInitialized });
      
      // Restore SnapTrade user if available
      if (savedState.snapTradeUser) {
        StorageHelpers.saveUser(savedState.snapTradeUser);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save session state on component updates
  useEffect(() => {
    if (isInitialized) {
      const snapTradeUser = snapTradeService.getUser();
      saveBrokerSessionState({
        readOnlyMode,
        isInitialized,
        lastSyncTime,
        snapTradeUser
      });
    }
  }, [readOnlyMode, isInitialized, lastSyncTime]);

  // Ensure we have valid credentials
  const ensureSnapTradeConfig = useCallback(async () => {
    try {
      if (!config.clientId || !config.consumerKey) {
        throw new Error("Missing SnapTrade credentials");
      }
      
      // Check for demo credentials
      if (config.isDemo) {
        logDebug("Using demo SnapTrade credentials - some features may be limited");
        setReadOnlyMode(true);
      }
      
      return config;
    } catch (error) {
      logDebug("Failed to get SnapTrade config:", error);
      setDebugState({ brokerError: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }, [config, logDebug]);

  // Load broker list without requiring registration
  const loadBrokers = useCallback(async () => {
    if (!snapTradeService) {
      logDebug('SnapTrade service not initialized');
      return [];
    }

    setDebugState({ loadingBrokers: true, brokerError: null });
    
    try {
      const config = await ensureSnapTradeConfig();
      if (!config) {
        setDebugState({ loadingBrokers: false });
        return [];
      }

      // Initialize SnapTrade service
      await snapTradeService.initialize(config);
      
      // Check if we have a stored user
      const storedUser = snapTradeService.getUser();
      if (storedUser) {
        logDebug('Found stored user session:', storedUser.userId);
      }
      
      // Load brokers (shouldn't require authentication)
      logDebug('Loading brokers...');
      const brokerList = await snapTradeService.getBrokerages();
      logDebug('Loaded brokers:', brokerList);
      
      // Log the structure of the first broker to understand the data format
      if (brokerList.length > 0) {
        logDebug('First broker structure:', JSON.stringify(brokerList[0], null, 2));
      }
      
      // Update both local state and debug store
      setBrokers(brokerList);
      setDebugState({ 
        brokers: brokerList,
        loadingBrokers: false,
        isInitialized: true
      });
      logDebug('Setting broker state with length:', brokerList.length);

      // Check for missing brokers with improved matching
      const loadedBrokerNames = brokerList.map((b: SnaptradeBrokerage) => b.name.toLowerCase());
      const missing = ALL_SUPPORTED_BROKERS.filter(broker => {
        const brokerLower = broker.toLowerCase();
        // Check for exact match or partial match
        return !loadedBrokerNames.some((name: string) => {
          // Normalize both names for comparison
          const normalizedName = name.replace(/[^a-z0-9]/g, '');
          const normalizedBroker = brokerLower.replace(/[^a-z0-9]/g, '');
          
          // Check for exact match
          if (normalizedName === normalizedBroker) return true;
          
          // Check for partial matches
          if (normalizedName.includes(normalizedBroker) || normalizedBroker.includes(normalizedName)) return true;
          
          // Special cases for known variations
          switch (broker) {
            case 'Ally Invest':
              return name.includes('ally') || name.includes('invest');
            case 'E*TRADE':
              return name.includes('etrade') || name.includes('e-trade');
            case 'Firstrade':
              return name.includes('firstrade');
            case 'M1 Finance':
              return name.includes('m1') || name.includes('finance');
            case 'Merrill Edge':
            case 'Merrill Lynch':
              return name.includes('merrill');
            case 'Tastyworks':
              return name.includes('tasty') || name.includes('works');
            case 'Wells Fargo':
              return name.includes('wells') || name.includes('fargo');
            default:
              return false;
          }
        });
      });

      if (missing.length > 0) {
        logDebug('Missing brokers after improved matching:', missing);
        setDebugState({ missingBrokers: missing });
      }
    } catch (error) {
      logDebug('Error loading brokers:', error);
      setDebugState({ 
        loadingBrokers: false,
        brokerError: error instanceof Error ? error.message : String(error)
      });
    }
  }, [ensureSnapTradeConfig, logDebug]);

  // Initialize component
  useEffect(() => {
    if (!isInitialized && !initializingRef.current) {
      initializingRef.current = true;
      loadBrokers().finally(() => {
        initializingRef.current = false;
      });
    }
  }, [isInitialized, loadBrokers]);

  // Memoize the broker list rendering
  const renderBrokerList = useMemo(() => {
    logDebug('Rendering broker list', { 
      length: brokers.length,
      loadingState: { loadingBrokers, isLoading }
    });

    // Sort brokers alphabetically by name
    const sortedBrokers = [...brokers].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedBrokers.map((broker) => (
          <div key={broker.id} className="p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <img 
                src={broker.aws_s3_square_logo_url} 
                alt={broker.name}
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-medium">{broker.name}</h3>
                <p className="text-sm text-gray-500">{broker.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => handleConnect(broker)}
                disabled={loadingBrokers || isLoading}
              >
                Connect
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }, [brokers, loadingBrokers, isLoading, logDebug]);

  // Listen for visibility changes to handle tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      logDebug('Visibility changed:', document.visibilityState);
      
      // Only proceed if the tab is visible and component is mounted
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        const snapTradeUser = snapTradeService.getUser();
        logDebug('Tab visible, checking conditions:', {
          hasUser: !!snapTradeUser,
          isInitialized,
          lastSyncTime,
          brokersCount: brokers.length,
          hasError: !!brokerError
        });
        
        // Only refresh if we have a valid user and the component is initialized
        if (snapTradeUser && isInitialized) {
          // Calculate time since last sync (in minutes)
          const syncTimestamp = lastSyncTime ? 
            (typeof lastSyncTime === 'number' ? lastSyncTime : parseInt(lastSyncTime, 10)) : 
            Date.now();
          const timeSinceLastSync = (Date.now() - syncTimestamp) / (1000 * 60);
          
          logDebug('Time since last sync:', {
            minutes: timeSinceLastSync,
            lastSyncTime,
            currentTime: Date.now()
          });
          
          // Only refresh if:
          // 1. It's been more than 5 minutes since last sync AND
          // 2. We have no brokers loaded OR there was an error in the previous load
          if (timeSinceLastSync > 5 && (brokers.length === 0 || brokerError)) {
            logDebug('Conditions met for refresh:', {
              timeSinceLastSync,
              hasBrokers: brokers.length > 0,
              hasError: !!brokerError
            });
            syncAllData().catch(console.error);
          } else {
            logDebug('Skipping refresh:', {
              timeSinceLastSync,
              hasBrokers: brokers.length > 0,
              hasError: !!brokerError
            });
          }
        } else {
          logDebug('Skipping refresh - missing requirements:', {
            hasUser: !!snapTradeUser,
            isInitialized
          });
        }
      }
    };

    logDebug('Setting up visibility change listener');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      logDebug('Cleaning up visibility change listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncAllData, isInitialized, lastSyncTime, brokers.length, brokerError]);

  const handleConnect = async (broker: SnaptradeBrokerage) => {
    if (!user) return;
    
    try {
      setConnectingBrokerId(broker.id);
      logDebug('Creating connection link for broker:', broker.name);
      
      // In read-only mode, immediately use mock user
      if (readOnlyMode) {
        logDebug('Using mock user for read-only mode');
        storeMockUser(MOCK_USER);
      } else {
        // Check if user is registered
        const snapTradeUser = snapTradeService.getUser();
        if (!snapTradeUser) {
          // Try to register if not already registered
          try {
            logDebug('User not registered, attempting registration...');
            await registerUser(user.id);
            toast.success("Successfully registered with SnapTrade");
          } catch (error) {
            logDebug("Registration failed during connect attempt:", error);
            
            // If registration fails, fall back to read-only mode
            setReadOnlyMode(true);
            storeMockUser(MOCK_USER);
            toast.error("Using test credentials for demo purposes.");
          }
        }
      }
      
      // Try again after registration/mock user
      const updatedUser = snapTradeService.getUser();
      if (!updatedUser) {
        throw new Error('Failed to initialize user. Please refresh and try again.');
      }
      
      // Extract and validate userId and userSecret
      const { userId, userSecret } = updatedUser;
      
      if (!userId || !userSecret) {
        throw new Error('Invalid SnapTrade user data');
      }
      
      // Create connection link
      try {
        const connectionData = await snapTradeService.createConnectionLink(
          userId,
          userSecret
        );
        
        if (!connectionData?.redirectUri) {
          throw new Error('No redirect URI received from SnapTrade');
        }
        
        // Before redirecting, show info for read-only mode
        if (readOnlyMode) {
          toast.success("Redirecting to broker connection page. Note: Using test credentials in read-only mode.");
        }
        
        // Navigate to the authorization URL
        logDebug('Redirecting to broker authorization page...');
        window.location.href = connectionData.redirectUri;
      } catch (connectionError) {
        logDebug('Connection error:', connectionError);
        
        // If demo/test mode is active, provide a clearer error message
        if (readOnlyMode || getSnapTradeConfig().isDemo) {
          throw new Error('Failed to create connection link. This may be due to demo mode limitations.');
        } else {
          throw connectionError;
        }
      }
    } catch (error) {
      logDebug('Failed to connect to broker:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to broker. Please try again.');
    } finally {
      setConnectingBrokerId(null);
    }
  };

  // Update the retry button click handler
  const handleRetry = () => {
    setDebugState({ 
      brokerError: null,
      isInitialized: false
    });
    setInitializeAttempts(0);
    initializingRef.current = false;
    loadBrokers();
  };

  // Update debug store when state changes
  useEffect(() => {
    setDebugState({
      isInitialized,
      brokers,
      loadingBrokers,
      brokerError,
      missingBrokers
    });
  }, [isInitialized, brokers, loadingBrokers, brokerError, missingBrokers, setDebugState]);

  // Add refresh function
  const handleRefresh = useCallback(async () => {
    try {
      setDebugState({ loadingBrokers: true, brokerError: null });
      logDebug('Manually refreshing broker list');
      const brokerList = await snapTradeService.getBrokerages();
      setBrokers(brokerList);
      logDebug('Broker list refreshed successfully', { count: brokerList.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logDebug('Failed to refresh broker list', { error: errorMessage });
      setDebugState({ brokerError: errorMessage });
    } finally {
      setDebugState({ loadingBrokers: false });
    }
  }, [logDebug]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Broker Dashboard</h1>
            <p className="text-muted-foreground">
              Connect with your brokerage accounts to import your holdings and trades
            </p>
          </div>
          
          {/* Testing mode badge - smaller and more subtle */}
          {(getSnapTradeConfig().isDemo || readOnlyMode) && (
            <Tooltip 
              content={
                <div className="max-w-xs">
                  <p className="font-semibold mb-1">Demo Mode Active</p>
                  <p className="mb-1">This is a simulated environment with the following limitations:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Using mock data instead of real brokerage accounts</li>
                    <li>No real trades or transactions are executed</li>
                    <li>Account balances and positions are simulated</li>
                    <li>API calls use test endpoints only</li>
                  </ul>
                </div>
              }
            >
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 text-xs cursor-help">
                <Info className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-yellow-700 dark:text-yellow-400">Test Mode</span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingBrokers}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingBrokers ? 'animate-spin' : ''}`} />
            Refresh Brokers
          </Button>
          {loadingBrokers && (
            <span className="text-sm text-muted-foreground">Loading...</span>
          )}
        </div>
        {lastSyncTime && (
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date(lastSyncTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      {brokerError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="inline-block mr-2" />
          {brokerError}
        </div>
      )}

      {renderBrokerList}
    </div>
  );
} 