import React, { useEffect, useState } from 'react';
import { snapTradeService } from '@/services/snaptradeService';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { useAuthStore } from '@/stores/authStore';
import { useDebugStore, createDebugLogger } from '@/stores/debugStore';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Card } from '@/components/ui/card';

const brokerLogger = createDebugLogger('broker');

const BrokerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { registerUser, syncAllData } = useBrokerDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState(false);

  // Debug state
  const { 
    isDebugMode, 
    showDebugPanel, 
    toggleDebugMode, 
    toggleDebugPanel,
    brokerDebug,
    updateBrokerDebug,
    setDebugState
  } = useDebugStore();

  useEffect(() => {
    let isMounted = true;
    let isInitialized = false;

    const initialize = async () => {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Initialize SnapTrade service
        const config = getSnapTradeConfig();
        await snapTradeService.initialize(config);

        // Register user and sync data
        await registerUser(user.id);
        await syncAllData();

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        brokerLogger.error("Error initializing broker dashboard:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize broker dashboard");
          setIsLoading(false);
        }
      }
    };

    if (!isInitialized) {
      isInitialized = true;
      initialize();
    }

    return () => {
      isMounted = false;
    };
  }, [user, registerUser, syncAllData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadBrokers = async () => {
    try {
      setLoadingBrokers(true);
      brokerLogger.info("Loading broker list...");
      const brokerList = await snapTradeService.getBrokerages();
      setBrokers(brokerList);
      
      if (brokerDebug.showBrokerDetails) {
        brokerLogger.debug("Broker details:", brokerList);
      }
      
      setDebugState({
        isInitialized: true,
        brokers: brokerList,
        loadingBrokers: false,
        brokerError: null,
        missingBrokers: []
      });
    } catch (err) {
      brokerLogger.error("Error loading brokers:", err);
      setDebugState({
        brokerError: err instanceof Error ? err.message : "Failed to load brokers"
      });
    } finally {
      setLoadingBrokers(false);
    }
  };

  useEffect(() => {
    loadBrokers();
  }, []);

  // Log broker state changes
  useEffect(() => {
    if (brokerDebug.showConnectionStatus) {
      brokerLogger.info("Broker state updated:", {
        loading: loadingBrokers,
        count: brokers.length,
        error: error
      });
    }
  }, [loadingBrokers, brokers, error, brokerDebug.showConnectionStatus]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Broker Dashboard</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={toggleDebugMode}
            className={isDebugMode ? "bg-primary text-primary-foreground" : ""}
          >
            Debug Mode
          </Button>
          {isDebugMode && (
            <Button
              variant="outline"
              onClick={toggleDebugPanel}
              className={showDebugPanel ? "bg-primary text-primary-foreground" : ""}
            >
              Debug Panel
            </Button>
          )}
        </div>
      </div>

      {showDebugPanel && isDebugMode && (
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Debug Controls</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Toggle
                variant="outline"
                size="default"
                pressed={brokerDebug.showMissingBrokers}
                onPressedChange={(pressed: boolean) => {
                  updateBrokerDebug({ showMissingBrokers: pressed });
                  brokerLogger.info("Show Missing Brokers:", pressed);
                }}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-muted/50 data-[state=off]:text-muted-foreground"
              >
                Show Missing Brokers
              </Toggle>
              <Toggle
                variant="outline"
                size="default"
                pressed={brokerDebug.showBrokerDetails}
                onPressedChange={(pressed: boolean) => {
                  updateBrokerDebug({ showBrokerDetails: pressed });
                  brokerLogger.info("Show Broker Details:", pressed);
                  if (pressed) {
                    brokerLogger.debug("Current broker details:", brokers);
                  }
                }}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-muted/50 data-[state=off]:text-muted-foreground"
              >
                Show Broker Details
              </Toggle>
              <Toggle
                variant="outline"
                size="default"
                pressed={brokerDebug.showConnectionStatus}
                onPressedChange={(pressed: boolean) => {
                  updateBrokerDebug({ showConnectionStatus: pressed });
                  brokerLogger.info("Show Connection Status:", pressed);
                  if (pressed) {
                    brokerLogger.info("Current connection status:", {
                      loading: loadingBrokers,
                      count: brokers.length,
                      error: error
                    });
                  }
                }}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-muted/50 data-[state=off]:text-muted-foreground"
              >
                Show Connection Status
              </Toggle>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker) => (
          <Card key={broker.id} className="p-4">
            <h3 className="text-lg font-semibold">{broker.name}</h3>
            {brokerDebug.showBrokerDetails && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>ID: {broker.id}</p>
                <p>Status: {broker.status}</p>
                <p>Auth Types: {broker.authTypes?.join(", ")}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrokerDashboard; 