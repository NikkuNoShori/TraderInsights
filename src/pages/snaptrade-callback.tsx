import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { configManager, configHelpers } from '@/lib/snaptrade/config';
import { toast } from 'react-hot-toast';

export default function SnapTradeCallback() {
  const navigate = useNavigate();
  
  // Initialize configuration if not already done
  if (!configManager.isInitialized()) {
    configHelpers.initializeFromEnv();
  }
  const snapTradeClient = new SnapTradeClient(configManager.getConfig());

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Initialize client if needed
        if (!snapTradeClient.isUserRegistered()) {
          await snapTradeClient.initialize();
        }

        // Sync all data
        await snapTradeClient.syncAllData();
        
        // Redirect to dashboard
        navigate('/app/dashboard');
        toast.success('Successfully connected to SnapTrade!');
      } catch (error) {
        console.error('Failed to handle SnapTrade callback:', error);
        toast.error('Failed to connect to SnapTrade. Please try again.');
        navigate('/app/settings');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to SnapTrade</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection...</p>
      </div>
    </div>
  );
} 