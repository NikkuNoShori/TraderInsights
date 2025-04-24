import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { Snaptrade } from 'snaptrade-typescript-sdk';
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
        const snaptrade = new Snaptrade({
          clientId: config.clientId,
          consumerKey: config.consumerKey,
          // Use production endpoint as per SDK documentation
          basePath: "https://api.snaptrade.com/api/v1"
        });

        // Store the session information
        StorageHelpers.saveConnectionSession({
          sessionId: 'pending',
          userId,
          userSecret,
          brokerId: brokerageId,
          redirectUrl: window.location.href,
          createdAt: Date.now(),
          status: 'pending'
        });

        // Get the connection URL using the connections API
        const response = await snaptrade.connections.listBrokerageAuthorizations({
          userId,
          userSecret
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Failed to get connection URL from SnapTrade');
        }

        logger.debug('SnapTrade connection response:', response.data);

        // Redirect to the SnapTrade connection portal
        window.location.href = response.data[0].redirectURI;

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