'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';

export default function BrokerCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const code = searchParams.get('code');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // TODO: Get these from your app's state management or session
        const config: SnapTradeConfig = {
          clientId: process.env.VITE_SNAPTRADE_CLIENT_ID || '',
          consumerSecret: process.env.VITE_SNAPTRADE_CONSUMER_SECRET || '',
          redirectUri: process.env.VITE_SNAPTRADE_REDIRECT_URI || `${window.location.origin}/broker-callback`,
        };
        const userId = localStorage.getItem('snaptrade_user_id');
        const userSecret = localStorage.getItem('snaptrade_user_secret');

        if (!userId || !userSecret) {
          throw new Error('User session not found');
        }

        const snapTradeService = new SnapTradeService(config);

        if (error) {
          throw new Error(`Broker connection failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // TODO: Handle the OAuth code and complete the connection
        // This will depend on the specific broker's OAuth flow

        // Redirect back to the broker connection page
        router.push('/broker-connection');
      } catch (err) {
        console.error('Error handling broker callback:', err);
        // Redirect to error page or show error message
        router.push('/broker-connection?error=' + encodeURIComponent(err instanceof Error ? err.message : 'Unknown error'));
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Broker</h1>
        <p className="text-gray-600">Please wait while we complete the connection...</p>
      </div>
    </div>
  );
} 