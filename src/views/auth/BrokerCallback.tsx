import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';
import { SnapTradeClient } from '@/lib/snaptrade';
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

        // Initialize SnapTrade client
        const client = new SnapTradeClient();
        client.setUser({ userId, userSecret });

        // Verify the connection
        const connections = await client.getConnections();
        if (connections.length === 0) {
          throw new Error('No connections found');
        }

        logger.debug('Broker connection successful:', { userId, sessionId });
        navigate('/app/dashboard');
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
        <Button onClick={() => navigate('/app/settings')}>
          Return to Settings
        </Button>
      </div>
    );
  }

  return null;
} 