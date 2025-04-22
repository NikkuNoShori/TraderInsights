/**
 * BrokerCallback Page
 * 
 * Handles the OAuth callback after a user connects their brokerage account.
 * This page receives the authorization code and completes the connection process.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { snapTradeService } from '@/services/snaptradeService';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function BrokerCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

        // Store user credentials
        StorageHelpers.saveUser({ userId, userSecret });

        // Check if user is registered
        const isRegistered = snapTradeService.isUserRegistered();
        
        if (isRegistered) {
          toast.success('Your brokerage account has been connected successfully.');
          navigate('/app/dashboard');
        } else {
          setError('Failed to connect brokerage account. Please try again.');
        }
      } catch (err) {
        console.error('Error handling broker callback:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
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
        <div className="text-error mb-4">{error}</div>
        <Button onClick={() => navigate('/app/settings')}>
          Return to Settings
        </Button>
      </div>
    );
  }

  return null;
} 