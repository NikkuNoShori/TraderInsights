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

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { useDebugStore } from '@/stores/debugStore';
import { createDebugLogger } from '@/stores/debugStore';
import { Brokerage } from 'snaptrade-typescript-sdk';

// Create debug logger
const brokerLogger = createDebugLogger('broker');

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

export function BrokerDashboard() {
  const { 
    error: brokerError,
    fetchAccounts
  } = useBrokerDataStore();
  
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  
  // Use debug store for state management
  const { 
    setDebugState, 
    brokerState: { 
      isInitialized, 
      brokers: debugBrokers, 
      loadingBrokers 
    }
  } = useDebugStore();
  
  const [brokers, setBrokers] = useState<Brokerage[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const config = getSnapTradeConfig();
  const snapTradeClient = new SnapTradeClient(config);

  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  }, [setDebugState]);

  // Save session state on component updates
  useEffect(() => {
    if (isInitialized) {
      const snapTradeUser = StorageHelpers.getUser();
      saveBrokerSessionState({
        readOnlyMode,
        isInitialized,
        snapTradeUser
      });
    }
  }, [readOnlyMode, isInitialized]);

  // Initialize SnapTrade service
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Initialize client
        setIsServiceInitialized(true);
        logDebug('SnapTrade service initialized successfully');
      } catch (error) {
        logDebug('Failed to initialize SnapTrade service:', error);
        toast.error('Failed to initialize broker service. Please try again.');
      }
    };

    if (!isServiceInitialized) {
      initializeService();
    }
  }, [isServiceInitialized, logDebug]);

  // Load broker list without requiring registration
  const loadBrokers = useCallback(async () => {
    if (!snapTradeClient) {
      logDebug('SnapTrade service not initialized');
      return [];
    }

    try {
      setDebugState({ loadingBrokers: true, brokerError: undefined });
      
      // Use the proxy endpoint to get brokerages - direct endpoint approach
      const response = await fetch('/api/snaptrade/brokerages');
      if (!response.ok) {
        throw new Error(`Failed to fetch brokerages: ${response.status}`);
      }
      
      const brokerList = await response.json();
      // Sort brokers alphabetically by name, handling undefined names
      const sortedBrokers = [...brokerList].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      setDebugState({ 
        brokers: sortedBrokers, 
        loadingBrokers: false 
      });
      
      // Update local state
      setBrokers(sortedBrokers);
      return sortedBrokers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebug('Failed to load brokers:', errorMessage);
      setDebugState({ 
        brokerError: errorMessage, 
        loadingBrokers: false 
      });
      return [];
    }
  }, [logDebug, setDebugState, snapTradeClient]);

  // Toggle description expand/collapse
  const toggleDescription = (brokerId: string) => {
    const updatedDescriptions = new Set(expandedDescriptions);
    if (updatedDescriptions.has(brokerId)) {
      updatedDescriptions.delete(brokerId);
    } else {
      updatedDescriptions.add(brokerId);
    }
    setExpandedDescriptions(updatedDescriptions);
  };

  // Handle fetch accounts when user is registered
  const handleFetchAccounts = useCallback(async () => {
    try {
      const snapTradeUser = StorageHelpers.getUser();
      if (!snapTradeUser || !snapTradeUser.userId || !snapTradeUser.userSecret) {
        logDebug('No SnapTrade user found. Cannot fetch accounts.');
        return;
      }
      
      await fetchAccounts(snapTradeUser.userId, snapTradeUser.userSecret);
    } catch (error) {
      logDebug('Error fetching accounts:', error);
    }
  }, [fetchAccounts, logDebug]);

  // Handle visibility change to refresh data
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      handleFetchAccounts();
    }
  };

  // Add visibility change listener to refresh data when tab becomes visible
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Load brokers on mount and when credentials change
  useEffect(() => {
    loadBrokers();
    
    // Try to fetch accounts if we have credentials
    const snapTradeUser = StorageHelpers.getUser();
    if (snapTradeUser?.userId && snapTradeUser?.userSecret) {
      handleFetchAccounts();
    }
  }, [loadBrokers, handleFetchAccounts]);

  // Handle broker connection
  const handleConnectBroker = async (broker: Brokerage) => {
    if (!broker.id) {
      toast.error('Invalid broker selected.');
      return;
    }

    try {
      setConnecting(true);
      setErrorMsg(null);

      // Get user from storage
      let snapTradeUser = StorageHelpers.getUser();
      
      // Register user if needed
      if (!snapTradeUser || !snapTradeUser.userId || !snapTradeUser.userSecret) {
        try {
          const response = await fetch('/api/snaptrade/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientId: config.clientId
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to register user: ${response.status}`);
          }
          
          const userData = await response.json();
          snapTradeUser = {
            userId: userData.userId,
            userSecret: userData.userSecret
          };
          
          // Save user to storage
          StorageHelpers.saveUser(snapTradeUser);
          logDebug('Registered new SnapTrade user');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error(`Failed to register: ${errorMessage}`);
          setErrorMsg(`Registration failed: ${errorMessage}`);
          setConnecting(false);
          return;
        }
      }
      
      // Get connection URL
      try {
        const response = await fetch('/api/snaptrade/broker-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brokerId: broker.id,
            userId: snapTradeUser.userId,
            userSecret: snapTradeUser.userSecret,
            redirectUri: window.location.origin + '/app/broker-callback'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get connection URL: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.redirectUri) {
          // Record which broker we're connecting
          localStorage.setItem('connecting_broker', broker.id);
          // Redirect to broker connection page
          window.location.href = data.redirectUri;
        } else {
          throw new Error('No redirect URL returned');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Connection failed: ${errorMessage}`);
        setErrorMsg(`Connection failed: ${errorMessage}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-3">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Connect Your Broker</h2>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadBrokers()}
              disabled={loadingBrokers}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingBrokers ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {brokerError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error: {brokerError}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {/* Display broker grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {brokers.map((broker) => (
            <div 
              key={broker.id} 
              className="flex flex-col border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-lg">{broker.name}</div>
                <Button
                  size="sm" 
                  onClick={() => handleConnectBroker(broker)}
                  disabled={connecting || loadingBrokers}
                >
                  Connect
                </Button>
              </div>
              
              {broker.description && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className={`${!expandedDescriptions.has(broker.id || '') ? 'line-clamp-2' : ''}`}>
                    {broker.description}
                  </div>
                  <Button
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleDescription(broker.id || '')}
                    className="mt-1 h-6 px-0 text-xs"
                  >
                    {expandedDescriptions.has(broker.id || '') ? (
                      <ChevronUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    )}
                    {expandedDescriptions.has(broker.id || '') ? 'Show less' : 'Show more'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {brokers.length === 0 && !loadingBrokers && (
          <div className="text-center p-8 text-muted-foreground">
            No brokers available. Please try refreshing.
          </div>
        )}
        
        {loadingBrokers && (
          <div className="text-center p-8 text-muted-foreground">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Loading brokers...
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-muted/50">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              Connect your brokerage to automatically import trades and track your portfolio.
              We use secure read-only connections - we can never place trades or move money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 