import React, { useEffect, useState } from 'react';
import { snapTradeService } from '@/services/snaptradeService';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { useAuthStore } from '@/stores/authStore';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { toast } from "sonner";

const BrokerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { registerUser, syncAllData } = useBrokerDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.error("Error initializing broker dashboard:", err);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Broker Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
};

export default BrokerDashboard; 