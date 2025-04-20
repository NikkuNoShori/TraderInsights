import React, { useEffect, useState, useRef } from 'react';
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
import { createDebugLogger } from '@/stores/debugStore';

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

// Create debug loggers for different categories
const brokerLogger = createDebugLogger('broker');
const apiLogger = createDebugLogger('api');

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
      brokerError, 
      missingBrokers 
    } 
  } = useDebugStore();
  
  const [brokers, setBrokers] = useState<SnaptradeBrokerage[]>([]);

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
      // Mark component as unmounted
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
  const ensureSnapTradeConfig = async () => {
    try {
      const config = getSnapTradeConfig();
      if (!config.clientId || !config.consumerKey) {
        throw new Error("Missing SnapTrade credentials");
      }
      
      // Check for demo credentials
      if (config.isDemo) {
        console.log("Using demo SnapTrade credentials - some features may be limited");
        // Enable read-only mode with demo credentials
        setReadOnlyMode(true);
      }
      
      return config;
    } catch (error) {
      console.error("Failed to get SnapTrade config:", error);
      setDebugState({ brokerError: error instanceof Error ? error.message : String(error) });
      return null;
    }
  };

  // Load broker list without requiring registration
  const loadBrokers = async () => {
    if (!snapTradeService) {
      console.warn('SnapTrade service not initialized');
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
        console.log('Found stored user session:', storedUser.userId);
      }
      
      // Load brokers (shouldn't require authentication)
      console.log('Loading brokers...');
      const brokerList = await snapTradeService.getBrokerages();
      console.log('Loaded brokers:', brokerList);
      
      // Log the structure of the first broker to understand the data format
      if (brokerList.length > 0) {
        console.log('First broker structure:', JSON.stringify(brokerList[0], null, 2));
      }
      
      // Update both local state and debug store
      setBrokers(brokerList);
      setDebugState({ 
        brokers: brokerList,
        loadingBrokers: false,
        isInitialized: true
      });
      console.log('Setting broker state with length:', brokerList.length);

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
            case 'Zacks Trade':
              return name.includes('zacks') || name.includes('trade');
            default:
              return false;
          }
        });
      });
      
      console.log('Missing brokers after improved matching:', missing);
      setDebugState({ missingBrokers: missing });
      
      return brokerList;
    } catch (error) {
      console.error('Error loading brokers:', error);
      setDebugState({ 
        brokerError: `Failed to load brokers: ${error instanceof Error ? error.message : String(error)}`,
        loadingBrokers: false,
        isInitialized: false
      });
      return [];
    }
  };

  // Initialize SnapTrade service and data
  useEffect(() => {
    // Guard against multiple concurrent initializations (React StrictMode causes double render)
    if (initializingRef.current) {
      brokerLogger.debug('Initialization already in progress, skipping');
      return;
    }

    // If already initialized, just load brokers
    if (isInitialized && user?.id) {
      brokerLogger.debug('Already initialized with user, loading brokers only');
      loadBrokers().catch(console.error);
      return;
    }

    const initialize = async () => {
      try {
        brokerLogger.info('Starting initialization process');
        brokerLogger.debug('Current state:', {
          isInitialized,
          hasUser: !!user?.id,
          initializeAttempts,
          readOnlyMode
        });

        // Always try to load brokers first regardless of user state
        brokerLogger.info('Loading brokers...');
        const brokerList = await loadBrokers();
        brokerLogger.info('Loaded brokers count:', brokerList?.length || 0);
        
        // Early return here if no user ID
        if (!user?.id) {
          brokerLogger.debug('No user ID, skipping registration but brokers should be loaded');
          return;
        }
        
        // Skip if already initialized with user
        if (isInitialized) {
          brokerLogger.debug('Already initialized, skipping');
          return;
        }
        
        // Set initializing flag to prevent duplicate calls
        initializingRef.current = true;
        brokerLogger.debug('Set initializing flag to true');
        
        // Limit initialization attempts to prevent infinite loops
        if (initializeAttempts > 3) {
          brokerLogger.warn('Too many initialization attempts, giving up');
          setDebugState({ 
            brokerError: "Failed to initialize after multiple attempts. Please refresh the page and try again.",
            isInitialized: false
          });
          initializingRef.current = false;
          return;
        }
        
        setInitializeAttempts(prev => prev + 1);
        brokerLogger.debug('Incremented initialization attempts:', initializeAttempts + 1);

        // If we've gotten this far with brokers, let's consider it partially initialized
        if (brokerList?.length) {
          brokerLogger.debug('Setting partial initialization state');
          setDebugState({ isInitialized: true });
        }

        // Ensure we have a valid user ID
        const userId = user.id;
        brokerLogger.debug('Initializing with user ID:', userId);

        // Check if we're in read-only mode (demo credentials)
        if (readOnlyMode) {
          brokerLogger.info('Operating in read-only mode - skipping user registration');
          storeMockUser(MOCK_USER);
          return;
        }

        // Use isUserRegistered to check if the user is already registered
        const isAlreadyRegistered = snapTradeService.isUserRegistered();
        brokerLogger.debug('User registration status:', { isAlreadyRegistered });

        if (!isAlreadyRegistered) {
          brokerLogger.info('Registering user:', userId);
          try {
            await registerUser(userId);
            brokerLogger.info('User registration successful');
            toast.success("Successfully registered with SnapTrade");
            
            try {
              brokerLogger.info('Syncing data after registration');
              await syncAllData();
              brokerLogger.info('Data sync successful');
              toast.success("Account data synchronized successfully");
            } catch (syncError) {
              brokerLogger.error('Sync failed:', syncError);
              toast.error("Failed to sync account data");
            }
          } catch (registrationError) {
            brokerLogger.error('Registration failed:', registrationError);
            setReadOnlyMode(true);
            storeMockUser(MOCK_USER);
            toast.error("Registration failed. Operating in read-only mode.");
          }
        } else {
          brokerLogger.debug('User already registered, syncing data');
          try {
            await syncAllData();
            brokerLogger.info('Data sync successful');
          } catch (syncError) {
            brokerLogger.error('Sync failed:', syncError);
            toast.error("Failed to sync account data");
          }
        }
      } catch (err) {
        brokerLogger.error('Initialization failed:', err);
        setDebugState({ 
          brokerError: err instanceof Error ? err.message : String(err),
          isInitialized: false
        });
        toast.error("Failed to load broker data. Please try again.");
      } finally {
        brokerLogger.debug('Resetting initialization flag');
        initializingRef.current = false;
      }
    };

    initialize();
  }, [user, registerUser, syncAllData, isInitialized, initializeAttempts, readOnlyMode]);

  // Listen for visibility changes to handle tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      brokerLogger.debug('Visibility changed:', document.visibilityState);
      
      // Only proceed if the tab is visible and component is mounted
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        const snapTradeUser = snapTradeService.getUser();
        brokerLogger.debug('Tab visible, checking conditions:', {
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
          
          brokerLogger.debug('Time since last sync:', {
            minutes: timeSinceLastSync,
            lastSyncTime,
            currentTime: Date.now()
          });
          
          // Only refresh if:
          // 1. It's been more than 5 minutes since last sync AND
          // 2. We have no brokers loaded OR there was an error in the previous load
          if (timeSinceLastSync > 5 && (brokers.length === 0 || brokerError)) {
            brokerLogger.info('Conditions met for refresh:', {
              timeSinceLastSync,
              hasBrokers: brokers.length > 0,
              hasError: !!brokerError
            });
            syncAllData().catch(console.error);
          } else {
            brokerLogger.debug('Skipping refresh:', {
              timeSinceLastSync,
              hasBrokers: brokers.length > 0,
              hasError: !!brokerError
            });
          }
        } else {
          brokerLogger.debug('Skipping refresh - missing requirements:', {
            hasUser: !!snapTradeUser,
            isInitialized
          });
        }
      }
    };

    brokerLogger.debug('Setting up visibility change listener');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      brokerLogger.debug('Cleaning up visibility change listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncAllData, isInitialized, lastSyncTime, brokers.length, brokerError]);

  const handleConnect = async (broker: SnaptradeBrokerage) => {
    if (!user) return;
    
    try {
      setConnectingBrokerId(broker.id);
      console.log('Creating connection link for broker:', broker.name);
      
      // In read-only mode, immediately use mock user
      if (readOnlyMode) {
        console.log('Using mock user for read-only mode');
        storeMockUser(MOCK_USER);
      } else {
        // Check if user is registered
        const snapTradeUser = snapTradeService.getUser();
        if (!snapTradeUser) {
          // Try to register if not already registered
          try {
            console.log('User not registered, attempting registration...');
            await registerUser(user.id);
            toast.success("Successfully registered with SnapTrade");
          } catch (error) {
            console.error("Registration failed during connect attempt:", error);
            
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
        console.log('Redirecting to broker authorization page...');
        window.location.href = connectionData.redirectUri;
      } catch (connectionError) {
        console.error('Connection error:', connectionError);
        
        // If demo/test mode is active, provide a clearer error message
        if (readOnlyMode || getSnapTradeConfig().isDemo) {
          throw new Error('Failed to create connection link. This may be due to demo mode limitations.');
        } else {
          throw connectionError;
        }
      }
    } catch (error) {
      console.error('Failed to connect to broker:', error);
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

  // Render broker list
  const renderBrokerList = () => {
    console.log('Rendering broker list, brokers state length:', brokers.length);
    console.log('Loading state:', { loadingBrokers, isLoading });
    
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
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      );
    }

    // Simplified loading condition
    if (loadingBrokers) {
      return (
        <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
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
          <Button 
            className="mt-2" 
            variant="outline" 
            onClick={() => loadBrokers()}
          >
            Refresh
          </Button>
        </div>
      );
    }

    // Sort brokers alphabetically by name
    const sortedBrokers = [...brokers].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBrokers.map((broker) => {
            // Use the square logo as primary, fallback to regular logo or an empty div
            const logoUrl = broker.aws_s3_square_logo_url || broker.aws_s3_logo_url || broker.logo;
            
            return (
              <div key={broker.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
                {logoUrl ? (
                  <img src={logoUrl} alt={broker.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xl font-bold">{broker.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{broker.name || 'Unknown Broker'}</h3>
                  <p className="text-sm text-muted-foreground">{broker.release_stage || broker.status || 'Unknown status'}</p>
                  <p className="text-sm">
                    {((broker.authorization_types && broker.authorization_types.length > 0) || broker.isOAuthSupported || broker.isCredentialsSupported) && (
                      <span>
                        Authentication: {broker.isOAuthSupported ? 'OAuth' : ''} 
                        {broker.isOAuthSupported && broker.isCredentialsSupported ? ' & ' : ''}
                        {broker.isCredentialsSupported ? 'Credentials' : ''}
                      </span>
                    )}
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
            );
          })}
        </div>
        
        {/* Show refresh button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => loadBrokers()} 
            disabled={loadingBrokers}
          >
            <RefreshCw className={`h-4 w-4 ${loadingBrokers ? 'animate-spin' : ''}`} />
            {loadingBrokers ? 'Refreshing...' : 'Refresh brokers'}
          </Button>
        </div>
      </div>
    );
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

      {/* Debug Panel */}
      <div className="mb-6 p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Debug Information</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isInitialized ? 'Initialized' : 'Not Initialized'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Loaded Brokers:</span>
            <span>{brokers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Loading State:</span>
            <span>{loadingBrokers ? 'Loading...' : 'Idle'}</span>
          </div>
          {brokerError && (
            <div className="flex items-center justify-between text-red-500">
              <span className="text-muted-foreground">Error:</span>
              <span>{brokerError}</span>
            </div>
          )}
          {missingBrokers.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Missing Brokers:</span>
                <span>{missingBrokers.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {missingBrokers.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {renderBrokerList()}
    </div>
  );
} 