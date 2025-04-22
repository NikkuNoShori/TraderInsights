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
        const searchParams = new URLSearchParams(window.location.search);
        const userId = searchParams.get('userId');
        const userSecret = searchParams.get('userSecret');
        const authorizationId = searchParams.get('authorizationId');

        if (!userId || !userSecret || !authorizationId) {
          throw new Error('Missing required parameters from callback');
        }

        // Store user credentials
        StorageHelpers.saveUser({ userId, userSecret });

        // Get user connections
        const connections = await snapTradeService.getUserConnections();

        // Sync all data to get the new connection
        await syncAllData();

        // Show success message
        setStatus('success');
        setMessage('Successfully connected your broker account!');
        toast.success('Broker account connected successfully');

        // Redirect back to dashboard after a short delay
        setTimeout(() => router.push('/app/broker-dashboard'), 2000);
      } catch (error) {
        console.error('Error handling broker callback:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to handle broker callback');
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