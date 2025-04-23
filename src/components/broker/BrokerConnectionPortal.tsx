import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { SnapTradeClient } from '@/lib/snaptrade';
import type { SnapTradeError } from '@/lib/snaptrade';

const logger = createDebugLogger('broker' as any); // TODO: Add 'broker' to DebugCategory type

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

        const client = new SnapTradeClient();
        const response = await client.createConnectionLink(
          userId,
          userSecret,
          brokerageId,
          {
            immediateRedirect: true,
            connectionType: 'read',
            connectionPortalVersion: 'v4'
          }
        );

        logger.debug('SnapTrade login response:', response);
        window.location.href = response.redirectURI;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to broker';
        logger.error('Error creating connection link:', errorMessage);
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