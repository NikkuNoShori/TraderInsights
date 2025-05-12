import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import type { SnapTradeError } from '@/lib/snaptrade';

const logger = createDebugLogger('broker' as any); // TODO: Add 'broker' to DebugCategory type

export default function BrokerCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const sessionId = searchParams.get('sessionId');
        const userId = searchParams.get('userId');
        const userSecret = searchParams.get('userSecret');

        if (!sessionId || !userId || !userSecret) {
          throw new Error('Missing required parameters');
        }

        // Store the user credentials for SnapTrade
        StorageHelpers.saveUser({ userId, userSecret });
        
        // Check if we have connections by getting them from storage
        const connections = StorageHelpers.getConnections();
        if (connections.length === 0) {
          logger.debug('No connections found in storage, will check via API');
          
          // Try fetching connections via API to confirm connection was successful
          try {
            // Create client instance with config from environment variables
            const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
            const consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
            
            if (clientId && consumerKey) {
              const client = new SnapTradeClient({ clientId, consumerKey });
              
              // Use loginUser to verify the connection 
              await client.loginUser(userId, userSecret);
              
              logger.debug('Successfully verified connection');
            } else {
              logger.error('Missing SnapTrade credentials in environment');
            }
          } catch (error) {
            logger.error('Error verifying connection:', error);
            // Continue anyway as the connection might still be successful
          }
        }
        
        logger.debug('Broker connection successful:', { userId, sessionId });
        
        // Set a flag in session storage to indicate we're returning from a successful broker connection
        // This will be used by the BrokerDashboard to automatically fetch accounts
        sessionStorage.setItem('returningFromBrokerConnection', 'true');
        
        // Navigate to the broker dashboard instead of the general dashboard
        navigate('/app/broker-dashboard');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process broker connection';
        logger.error('Error handling broker callback:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-8 w-8 text-error mb-4" />
        <div className="text-error mb-4">{error}</div>
        <Button onClick={() => navigate('/app/broker-dashboard')}>
          Return to Broker Dashboard
        </Button>
      </div>
    );
  }

  return null;
} 