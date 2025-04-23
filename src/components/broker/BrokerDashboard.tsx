/**
 * BrokerDashboard Component
 * 
 * Primary component for managing broker connections and displaying the broker selection interface.
 * This is the main entry point for users to connect their brokerage accounts through SnapTrade.
 * 
 * Features:
 * - Displays available brokers in a grid layout
 * - Handles broker connection initialization
 * - Manages SnapTrade user registration
 * - Supports demo/test mode for development
 * - Includes debug tools and logging
 * - Persists session state
 * 
 * Route: /app/broker-dashboard
 * 
 * State Management:
 * - Uses useBrokerDataStore for broker connections and account data
 * - Uses useDebugStore for development and testing features
 * - Uses useAuthStore for user authentication
 * 
 * Related Components:
 * - BrokerConnectionPortal: Handles OAuth flow for broker connections
 * - ImportTradeForm: Uses broker connection functionality for trade imports
 * 
 * @see src/components/broker-connection-portal.tsx
 * @see src/components/trades/ImportTradeForm.tsx
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SnapTradeUser, SnapTradeConnection, SnaptradeBrokerage } from '@/lib/snaptrade/types';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { Tooltip } from '@/components/ui/Tooltip';
import { useDebugStore } from '@/stores/debugStore';
import { createDebugLogger } from '@/stores/debugStore';
import { BrokerList } from './BrokerList';
import { BrokerConnectionPortal } from '@/components/broker/BrokerConnectionPortal';
import { Brokerage } from 'snaptrade-typescript-sdk';

// Create debug logger
const brokerLogger = createDebugLogger('broker');
const apiLogger = createDebugLogger('api');

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

// Define the debug state type
interface DebugState {
  brokers?: Brokerage[];
  connectionStatus?: {
    isConnected: boolean;
    connectionCount: number;
    lastSyncTime: number;
  };
  brokerError?: string;
  loadingBrokers?: boolean;
  missingBrokers?: string[];
}

export function BrokerDashboard() {
  // Remove debug console logging
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
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  
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
  
  const [brokers, setBrokers] = useState<Brokerage[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const config = getSnapTradeConfig();
  const snapTradeClient = new SnapTradeClient(config);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize configuration
  const configMemo = useMemo(() => getSnapTradeConfig(), []);

  // Optimized debug logging
  const logDebug = useCallback((message: string, data?: any) => {
    brokerLogger.debug(message, data);
  }, []);

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
      const snapTradeUser = StorageHelpers.getUser();
      saveBrokerSessionState({
        readOnlyMode,
        isInitialized,
        lastSyncTime,
        snapTradeUser
      });
    }
  }, [readOnlyMode, isInitialized, lastSyncTime]);

  // Sync data periodically
  useEffect(() => {
    if (isInitialized && connections.length > 0) {
      const interval = setInterval(() => {
        syncAllData();
      }, 30000); // Sync every 30 seconds

      return () => clearInterval(interval);
    }
  }, [syncAllData, isInitialized, connections.length]);

  // Initialize SnapTrade service
  useEffect(() => {
    const initialize = async () => {
      try {
        setDebugState({ isInitialized: false });
        await snapTradeClient.initialize();
        setDebugState({ isInitialized: true });
      } catch (error) {
        console.error("Failed to initialize SnapTrade:", error);
        toast.error("Failed to initialize SnapTrade service");
      }
    };

    initialize();
  }, [setDebugState]);

  // Ensure we have valid credentials
  useEffect(() => {
    const checkCredentials = async () => {
      const snapTradeUser = StorageHelpers.getUser();
      if (!snapTradeUser) {
        toast.error("No SnapTrade credentials found");
        return;
      }

      try {
        await snapTradeClient.registerUser(snapTradeUser.userId);
      } catch (error) {
        console.error("Failed to register user:", error);
        toast.error("Failed to register user with SnapTrade");
      }
    };

    if (isInitialized) {
      checkCredentials();
    }
  }, [isInitialized]);

  // Load broker list without requiring registration
  const loadBrokers = useCallback(async () => {
    if (!snapTradeClient) {
      logDebug('SnapTrade service not initialized');
      return [];
    }

    try {
      setDebugState({ loadingBrokers: true, brokerError: undefined });
      const brokerList = await snapTradeClient.getBrokerages();
      // Sort brokers alphabetically by name, handling undefined names
      const sortedBrokers = [...brokerList].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
      setBrokers(sortedBrokers);
      setDebugState({
        brokers: sortedBrokers,
        loadingBrokers: false
      });
      return sortedBrokers;
    } catch (error) {
      logDebug('Failed to load brokers:', error);
      setDebugState({ 
        loadingBrokers: false,
        brokerError: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }, [logDebug]);

  // Initialize component
  useEffect(() => {
    if (!isInitialized && !initializingRef.current) {
      initializingRef.current = true;
      loadBrokers().finally(() => {
        initializingRef.current = false;
      });
    }
  }, [isInitialized, loadBrokers]);

  const toggleDescription = (brokerId: string) => {
    setExpandedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(brokerId)) {
        next.delete(brokerId);
      } else {
        next.add(brokerId);
      }
      return next;
    });
  };

  // Memoize the broker list rendering
  const renderBrokerList = useMemo(() => {
    logDebug('Rendering broker list', { 
      length: brokers.length,
      loadingState: { loadingBrokers, isLoading }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker) => {
          const isExpanded = expandedDescriptions.has(broker.id || '');
          const logoUrl = broker.aws_s3_square_logo_url || '';

          return (
            <div key={broker.id} className="p-4 border rounded-lg flex flex-col h-full">
              <div className="flex-grow">
                <div className="flex items-center space-x-4">
                  <img 
                    src={logoUrl}
                    alt={broker.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{broker.name}</h3>
                    <div className="relative">
                      <p className={`text-sm text-gray-500 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {broker.description}
                      </p>
                      {broker.description && broker.description.length > 100 && (
                        <button
                          onClick={() => toggleDescription(broker.id || '')}
                          className="text-xs text-primary hover:text-primary/80 flex items-center mt-1"
                        >
                          {isExpanded ? (
                            <>
                              Show Less
                              <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                          ) : (
                            <>
                              Show More
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 flex justify-center">
                <Button
                  onClick={() => handleConnectBroker(broker)}
                  disabled={loadingBrokers || isLoading}
                  className="w-full md:w-auto"
                >
                  Connect
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [brokers, loadingBrokers, isLoading, logDebug, expandedDescriptions]);

  // Listen for visibility changes to handle tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      logDebug('Visibility changed:', document.visibilityState);
      
      // Only proceed if the tab is visible and component is mounted
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        const snapTradeUser = StorageHelpers.getUser();
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
  }, [syncAllData, isInitialized, lastSyncTime, brokers.length, brokerError, config.isDemo]);

  // Handle broker connection
  const handleConnectBroker = async (broker: Brokerage) => {
    try {
      setConnecting(true);
      setError(null);
      
      // Get or create user
      let user = StorageHelpers.getUser();
      if (!user) {
        const authUser = useAuthStore.getState().user;
        if (!authUser?.id) {
          throw new Error('User ID is required');
        }
        const newUser = await snapTradeClient.registerUser(authUser.id);
        if (!newUser.userId || !newUser.userSecret) {
          throw new Error('Failed to register user: missing credentials');
        }
        user = {
          userId: newUser.userId,
          userSecret: newUser.userSecret
        };
        StorageHelpers.saveUser(user);
      }

      // Get connection link
      const response = await snapTradeClient.getConnections(user.userId, user.userSecret);
      const connection = response.find(conn => conn.brokerage_authorization?.brokerage?.id === broker.id);
      
      if (connection) {
        // Use existing connection
        setConnectingBrokerId(broker.id || null);
      } else {
        // Create new connection
        setConnectingBrokerId(broker.id || null);
        // Note: The actual connection flow should be handled by BrokerConnectionPortal
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect broker');
      toast.error('Failed to connect broker');
    } finally {
      setConnecting(false);
    }
  };

  // Handle retry
  const handleRetryConnection = async () => {
    try {
      setError(null);
      const user = StorageHelpers.getUser();
      if (!user) {
        throw new Error('No user found');
      }
      await snapTradeClient.getConnections(user.userId, user.userSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry connection');
    }
  };

  // Handle reset connection
  const handleResetConnection = async () => {
    try {
      setError(null);
      const user = StorageHelpers.getUser();
      if (!user) {
        throw new Error('No user found');
      }
      await snapTradeClient.getConnections(user.userId, user.userSecret);
      StorageHelpers.clearConnectionSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset connection');
    }
  };

  // Update debug store when state changes
  useEffect(() => {
    setDebugState({
      isInitialized,
      brokers,
      loadingBrokers,
      brokerError,
      missingBrokers,
      connectionStatus: {
        isConnected: connections.length > 0,
        connectionCount: connections.length,
        lastSyncTime: lastSyncTime ? Number(lastSyncTime) : undefined
      }
    });
  }, [isInitialized, brokers, loadingBrokers, brokerError, missingBrokers, setDebugState, connections, lastSyncTime]);

  // Add refresh function
  const handleRefresh = useCallback(async () => {
    try {
      setDebugState({ loadingBrokers: true, brokerError: null });
      logDebug('Manually refreshing broker list');
      
      const user = StorageHelpers.getUser();
      if (!user) {
        throw new Error('No user found');
      }
      
      // Refresh both brokers and connections
      const [brokerList, connectionList] = await Promise.all([
        snapTradeClient.getBrokerages(),
        snapTradeClient.getConnections(user.userId, user.userSecret).catch(() => []) as Promise<SnapTradeConnection[]>
      ]);
      
      setBrokers(brokerList);
      setDebugState({
        brokers: brokerList,
        connectionStatus: {
          isConnected: connectionList.length > 0,
          connectionCount: connectionList.length,
          lastSyncTime: Date.now()
        }
      });
      
      logDebug('Broker list and connections refreshed successfully', { 
        brokerCount: brokerList.length,
        connectionCount: connectionList.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logDebug('Failed to refresh broker list', { error: errorMessage });
      setDebugState({ 
        brokerError: errorMessage,
        connectionStatus: {
          isConnected: false,
          connectionCount: 0,
          lastSyncTime: Date.now()
        }
      });
    } finally {
      setDebugState({ loadingBrokers: false });
    }
  }, [logDebug]);

  const handleConnect = async () => {
    try {
      const userId = `user-${Date.now()}`;
      const userData = await snapTradeClient.registerUser(userId);
      if (userData && userData.userId && userData.userSecret) {
        const user: SnapTradeUser = {
          userId: userData.userId,
          userSecret: userData.userSecret
        };
        StorageHelpers.saveUser(user);
        toast.success("Successfully connected to SnapTrade");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Failed to connect to SnapTrade");
    }
  };

  const handleDisconnect = async () => {
    try {
      StorageHelpers.clearAll();
      toast.success("Successfully disconnected from SnapTrade");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect from SnapTrade");
    }
  };

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
          
          {/* Read-only mode badge */}
          {readOnlyMode && (
            <Tooltip 
              content={
                <div className="max-w-xs">
                  <p className="font-semibold mb-1">Read-Only Mode Active</p>
                  <p className="mb-1">This is a read-only environment with the following limitations:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>No trades or transactions can be executed</li>
                    <li>Account balances and positions are view-only</li>
                  </ul>
                </div>
              }
            >
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 text-xs cursor-help">
                <Info className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-yellow-700 dark:text-yellow-400">Read-Only</span>
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
            onClick={handleResetConnection}
            disabled={loadingBrokers}
          >
            Reset Connection
          </Button>
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