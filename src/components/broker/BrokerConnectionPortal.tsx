/**
 * BrokerConnectionPortal Component
 * 
 * A modal component that handles the OAuth flow for connecting brokerage accounts.
 * Used as a reusable portal for broker connections across different parts of the application.
 * 
 * Features:
 * - Manages broker OAuth authentication flow
 * - Handles connection success/failure states
 * - Provides user feedback during connection process
 * - Supports custom success/error callbacks
 * 
 * Usage:
 * ```tsx
 * <BrokerConnectionPortal
 *   brokerageId={brokerageId}
 *   userId={userId}
 *   userSecret={userSecret}
 *   onError={handleError}
 * />
 * ```
 * 
 * Props:
 * @prop {string} brokerageId - Brokerage identifier
 * @prop {string} userId - User identifier for SnapTrade
 * @prop {string} userSecret - User secret for SnapTrade authentication
 * @prop {(error: string) => void} onError - Optional callback on connection error
 * 
 * Used By:
 * - ImportTradeForm: For connecting brokers during trade import
 * 
 * @see src/components/trades/ImportTradeForm.tsx
 * @see src/components/broker/BrokerDashboard.tsx
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { snapTradeService } from '@/services/snaptradeService';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createDebugLogger } from '@/stores/debugStore';

const brokerLogger = createDebugLogger('broker');

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

        // Create connection link
        const connectionLink = await snapTradeService.createConnectionLink(
          userId,
          userSecret
        );

        // Check if we're in demo mode
        if (getSnapTradeConfig().isDemo) {
          brokerLogger.debug('Using demo mode connection link');
        }

        // Redirect to authorization URL
        window.location.href = connectionLink.redirectUri;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to broker';
        brokerLogger.error('Error creating connection link:', errorMessage);
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
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Initializing broker connection...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/app/broker-dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return null;
} 