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
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 *   onError={handleError}
 *   config={snapTradeConfig}
 *   userId={userId}
 *   userSecret={userSecret}
 * />
 * ```
 * 
 * Props:
 * @prop {boolean} isOpen - Controls portal visibility
 * @prop {() => void} onClose - Callback when portal is closed
 * @prop {(authorizationId: string) => void} onSuccess - Optional callback on successful connection
 * @prop {(error: { errorCode: string; statusCode: string; detail: string }) => void} onError - Optional callback on connection error
 * @prop {SnapTradeConfig} config - SnapTrade configuration
 * @prop {string} userId - User identifier for SnapTrade
 * @prop {string} userSecret - User secret for SnapTrade authentication
 * 
 * Used By:
 * - ImportTradeForm: For connecting brokers during trade import
 * 
 * @see src/components/trades/ImportTradeForm.tsx
 * @see src/components/BrokerDashboard.tsx
 */

import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BrokerConnectionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (authorizationId: string) => void;
  onError?: (error: { errorCode: string; statusCode: string; detail: string }) => void;
  config: SnapTradeConfig;
  userId: string;
  userSecret: string;
}

export function BrokerConnectionPortal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  config,
  userId,
  userSecret,
}: BrokerConnectionPortalProps) {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeConnection();
    }
  }, [isOpen]);

  useEffect(() => {
    // Set up event listener for messages from the connection portal
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        const data = event.data;
        console.log('Received message from connection portal:', data);

        if (data.status === 'SUCCESS') {
          onSuccess?.(data.authorizationId);
          onClose();
        }

        if (data.status === 'ERROR') {
          const error = {
            errorCode: data.errorCode,
            statusCode: data.statusCode,
            detail: data.detail,
          };
          onError?.(error);
          onClose();
        }

        if (data === 'CLOSE_MODAL' || data === 'CLOSED') {
          onClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError, onClose]);

  const initializeConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const snapTradeService = new SnapTradeService(config);
      const response = await snapTradeService.createConnectionLink(userId, userSecret);

      // The response should contain a redirect URL
      if (!response?.redirectUri) {
        throw new Error('No redirect URL received from SnapTrade');
      }

      setLoginUrl(response.redirectUri);
    } catch (err) {
      console.error('Failed to initialize connection:', err);
      setError('Failed to initialize broker connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background dark:bg-dark-paper border-border dark:border-dark-border max-w-2xl min-h-[600px] flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground dark:text-dark-text">
            Connect Your Broker
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background dark:bg-dark-paper">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background dark:bg-dark-paper">
              <div className="text-destructive text-center p-4">
                <p>{error}</p>
                <Button
                  onClick={initializeConnection}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {loginUrl && !isLoading && !error && (
            <iframe
              src={loginUrl}
              className="w-full h-full"
              title="SnapTrade Connection Portal"
              allow="camera *; clipboard-write *"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 