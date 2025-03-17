import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { snapTradeService } from '@/services/snaptradeService';

export default function SnapTradeCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;

    const processCallback = async () => {
      try {
        // Check if we have the necessary query parameters
        const { userId, userSecret, accountId, brokerage } = router.query;

        if (!userId || !userSecret) {
          setStatus('error');
          setMessage('Missing required parameters in the callback URL.');
          return;
        }

        // Initialize the SnapTrade service if needed
        if (!snapTradeService.isUserRegistered()) {
          await snapTradeService.init({
            clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || '',
            consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || '',
            redirectUri: `${window.location.origin}/snaptrade-callback`,
          });
        }

        // Sync the user data to refresh connections and accounts
        await snapTradeService.syncAllData();

        setStatus('success');
        setMessage('Your brokerage account has been successfully connected!');
      } catch (error) {
        console.error('Error processing SnapTrade callback:', error);
        setStatus('error');
        setMessage(`Failed to process connection: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    processCallback();
  }, [router.isReady, router.query]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">SnapTrade Connection</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Success!</p>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{message}</p>
          </div>
        )}
        
        <div className="mt-6">
          <Link href="/snaptrade" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Return to SnapTrade Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 