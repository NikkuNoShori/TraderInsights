import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import type { SnapTradeError } from '@/lib/snaptrade';

const logger = createDebugLogger('broker' as any);

interface BrokerConnectionPortalProps {
  brokerageId: string;
  userId: string;
  userSecret: string;
  onError?: (error: string) => void;
}

export function BrokerConnectionPortal({ 
  brokerageId, 
  userId, 
  userSecret,
  onError 
}: BrokerConnectionPortalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the SnapTrade configuration
        const config = StorageHelpers.getConfig();
        if (!config) {
          throw new Error('SnapTrade configuration not found');
        }

        // Initialize the SnapTrade client
        const snapTradeClient = new SnapTradeClient({
          clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || "",
          consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || "",
          basePath: "https://api.snaptrade.com/api/v1"
        });

        // Get the connection URL using the client
        const redirectUrl = await snapTradeClient.createConnectionLink({
          broker: brokerageId,
          immediateRedirect: false
        });

        // Save the connection session
        StorageHelpers.saveConnectionSession({
          sessionId: crypto.randomUUID(),
          userId: snapTradeClient.getUser()?.userId || '',
          userSecret: snapTradeClient.getUser()?.userSecret || '',
          brokerId: brokerageId,
          redirectUrl,
          createdAt: Date.now(),
          status: 'pending'
        });

        // Redirect to the broker connection portal
        window.location.href = redirectUrl;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to broker';
        logger.error('Error initializing connection:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConnection();
  }, [brokerageId, userId, userSecret, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-8 w-8 text-error mb-4" />
        <div className="text-error mb-4">{error}</div>
        <Button onClick={() => navigate('/app/settings')}>
          Return to Settings
        </Button>
      </div>
    );
  }

  return null;
} 