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

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { configManager, configHelpers } from '@/lib/snaptrade/config';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { useDebugStore } from '@/stores/debugStore';
import { createDebugLogger } from '@/stores/debugStore';
import { Brokerage } from 'snaptrade-typescript-sdk';
import { Snaptrade } from 'snaptrade-typescript-sdk';
import { BrokerGrid } from "./BrokerGrid";
import { SyncStatus } from '@/components/broker/SyncStatus';
import { ErrorMessage } from "./ErrorMessage";

// Create debug logger with proper category
const brokerLogger = createDebugLogger('broker');

export function BrokerDashboard() {
  const { user } = useAuthStore();
  const { 
    brokerages,
    getBrokerageList,
    getUserAccounts,
    getAccountHoldings,
    getAccountBalance,
    getUserAccountOrders
  } = useBrokerDataStore();
  
  // Initialize debug store
  const { isDebugMode, isCategoryEnabled, shouldLog } = useDebugStore();
  
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Log initialization
  useEffect(() => {
    if (isCategoryEnabled('broker')) {
      brokerLogger.debug('BrokerDashboard initialized', {
        isDebugMode,
        hasUser: !!user,
        brokerCount: brokerages?.length || 0,
      });
    }
  }, [isDebugMode, user, brokerages, isCategoryEnabled]);

  // Initialize configuration if not already done
  if (!configManager.isInitialized()) {
    configHelpers.initializeFromEnv();
  }
  const config = configManager.getConfig();

  // Log configuration only when debug is enabled
  useEffect(() => {
    if (isCategoryEnabled('broker') && shouldLog('broker', 'debug')) {
      brokerLogger.debug('SnapTrade configuration', {
        hasClientId: !!config.clientId,
        hasConsumerKey: !!config.consumerKey,
      });
    }
  }, [config, isCategoryEnabled, shouldLog]);

  // Initialize SnapTrade service
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch brokerages and accounts
        await Promise.all([
          getBrokerageList(),
          getUserAccounts()
        ]);
        // Get accounts and their data
        const accounts = await getUserAccounts();
        for (const account of accounts) {
          await Promise.all([
            getAccountHoldings(account.id),
            getAccountBalance(account.id),
            getUserAccountOrders(account.id)
          ]);
        }
        setLastSyncTime(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize");
      }
    };
    if (user) {
      initialize();
    }
  }, [getBrokerageList, getUserAccounts, getAccountHoldings, getAccountBalance, getUserAccountOrders, user]);

  // Handle broker connection
  const handleConnectBroker = useCallback(async (broker: Brokerage) => {
    try {
      setError(null);
      
      if (isCategoryEnabled('broker') && shouldLog('broker', 'debug')) {
        brokerLogger.debug('Initiating broker connection', { 
          brokerId: broker.id,
          brokerName: broker.name,
          hasUser: !!user
        });
      }

      // Get or create user
      const authUser = StorageHelpers.getUser();
      if (!authUser) {
        throw new Error('User ID is required');
      }

      // Initialize SnapTrade client with proper configuration
      if (isCategoryEnabled('broker') && shouldLog('broker', 'debug')) {
        brokerLogger.debug('Creating Snaptrade instance', {
          hasClientId: !!config.clientId,
          hasConsumerKey: !!config.consumerKey,
        });
      }

      // ... rest of the handleConnectBroker implementation ...
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect broker");
    }
  }, [config, isCategoryEnabled, shouldLog, user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Broker Connections</h1>
        <SyncStatus lastSyncTime={lastSyncTime} />
      </div>

      <BrokerGrid brokers={brokerages} />

      {error && <ErrorMessage message={error} />}
    </div>
  );
} 