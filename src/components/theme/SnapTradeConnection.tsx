import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDebugLogger } from '@/stores/debugStore';
import { snapTradeService } from '@/services/snaptradeService';

const logger = createDebugLogger('theme');

interface SnapTradeConnectionProps {
  brokerageId: string;
  userId: string;
  userSecret: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function SnapTradeConnection({ 
  brokerageId, 
  userId, 
  userSecret,
  onError,
  onSuccess
}: SnapTradeConnectionProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.debug('Initializing SnapTrade connection', { 
          brokerageId: brokerageId.substring(0, 4) + '...' 
        });

        // Create broker connection link
        const { redirectUri } = await snapTradeService.createConnectionLink(
          userId,
          userSecret
        );
        
        if (redirectUri) {
          logger.debug('Received redirect URI, navigating...');
          window.location.href = redirectUri;
          onSuccess?.();
        } else {
          throw new Error('Invalid response from SnapTrade API');
        }
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
  }, [brokerageId, userId, userSecret, onError, onSuccess]);

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