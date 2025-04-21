/**
 * BrokerCallback Page
 * 
 * Handles the OAuth callback after a user connects their brokerage account.
 * This page receives the authorization code and completes the connection process.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { snapTradeService } from '@/services/snaptradeService';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { StorageHelpers } from '@/lib/snaptrade/storage';
import { toast } from 'react-hot-toast';
import { useBrokerDataStore } from '@/stores/brokerDataStore';

export default function BrokerCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing your broker connection...');
  const { syncAllData } = useBrokerDataStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get error and code from URL params
        const error = searchParams.get('error');
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // Check for errors first
        if (error) {
          console.error('Broker connection error:', error);
          setStatus('error');
          setMessage(`Connection failed: ${error}`);
          toast.error('Failed to connect broker account');
          setTimeout(() => router.push('/app/broker-dashboard'), 2000);
          return;
        }

        // Validate we have the required code
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get config to check if we're in demo mode
        const config = getSnapTradeConfig();
        
        // In demo mode, we don't need to validate the user session
        if (!config.isDemo) {
          // Get the stored user
          const user = StorageHelpers.getUser();
          if (!user || !user.userId || !user.userSecret) {
            throw new Error('User session not found');
          }
        }

        // Initialize SnapTrade service
        await snapTradeService.initialize(config);

        // Complete the connection with the authorization code
        await snapTradeService.connections.list();
        
        // Sync all data to get the new connection
        await syncAllData();

        // Show success message
        setStatus('success');
        setMessage('Successfully connected your broker account!');
        toast.success('Broker account connected successfully');

        // Redirect back to dashboard after a short delay
        setTimeout(() => router.push('/app/broker-dashboard'), 2000);
      } catch (err) {
        console.error('Error handling broker callback:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to complete broker connection');
        toast.error('Failed to connect broker account');
        setTimeout(() => router.push('/app/broker-dashboard'), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams, syncAllData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Connecting Your Account</h1>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Connection Successful!</h1>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
            </>
          )}
          
          <p className="text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting you back to the dashboard...</p>
        </div>
      </div>
    </div>
  );
} 