import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { SnapTradeClient } from '@/lib/snaptrade';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import type { SnapTradeError, SnapTradeConfig } from '@/lib/snaptrade';

const logger = createDebugLogger('broker' as any);

export function BrokerCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
          throw new Error('No session ID found in callback URL');
        }

        // Retrieve the stored session
        const session = StorageHelpers.getConnectionSession(sessionId);
        if (!session) {
          throw new Error('Invalid or expired session');
        }

        // Validate the session
        if (session.status !== 'pending') {
          throw new Error('Session already processed');
        }

        // Get the SnapTrade configuration
        const config = StorageHelpers.getConfig();
        if (!config) {
          throw new Error('SnapTrade configuration not found');
        }

        const client = new SnapTradeClient(config);
        const connections = await client.getConnections(
          session.userId,
          session.userSecret
        );

        logger.debug('Connections response:', connections);

        // Check if the connection was successful
        const connection = connections.find(c => c.brokerageAuthorizationId === sessionId);
        if (!connection) {
          throw new Error('Connection not found');
        }

        // Update session status
        StorageHelpers.saveConnectionSession({
          ...session,
          status: 'completed'
        });

        // Navigate back to settings
        navigate('/app/settings');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process broker callback';
        logger.error('Error processing callback:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

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