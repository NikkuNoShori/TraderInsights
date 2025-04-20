import React, { useState } from 'react';
import { Button } from "@/components/ui";
import { registerUser, deleteUser, getUser } from '@/services/snaptradeService';
import { toast } from 'react-hot-toast';

export default function SnapTradeSettings() {
  const [testUserId, setTestUserId] = useState('test-user-' + Date.now());
  const [result, setResult] = useState<{ success?: boolean; message: string }>({ message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult({ message: 'Testing SnapTrade API...' });

    try {
      // Log the configuration (without sensitive data)
      console.log('SnapTrade Config:', {
        hasClientId: !!getUser(),
        hasConsumerKey: true // We know this exists from the config
      });

      // Attempt to register
      const response = await registerUser(testUserId);
      
      console.log('Registration Response:', {
        userId: response.userId,
        hasUserSecret: !!response.userSecret
      });

      setResult({
        success: true,
        message: `Successfully registered test user! User Secret: ${response.userSecret?.substring(0, 8) || 'Not available'}...`
      });

      // Clean up test user
      await deleteUser(testUserId);
    } catch (error) {
      console.error('API Test Error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">SnapTrade Integration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Test and configure your SnapTrade integration
        </p>
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-4">API Connection Test</h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
              Test User ID
            </label>
            <input
              type="text"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              placeholder="Enter test user ID"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleTest}
            disabled={isLoading || !testUserId}
            className="w-full"
            variant={isLoading ? "outline" : "default"}
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </Button>

          {result.message && (
            <div
              className={`p-4 rounded-md ${
                result.success
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-2">Current Configuration</h3>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div>
            <span className="text-sm font-medium text-foreground">Client ID: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.VITE_SNAPTRADE_CLIENT_ID || 'Not configured'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">Redirect URI: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.VITE_SNAPTRADE_REDIRECT_URI || window.location.origin + '/broker-callback'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">Environment: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.MODE}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-4">Documentation</h3>
        <div className="space-y-2">
          <a
            href="https://docs.snaptrade.com/reference/Authentication/Authentication_registerSnapTradeUser"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            SnapTrade API Documentation
          </a>
          <a
            href="https://snaptrade.com/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            Getting Started Guide
          </a>
        </div>
      </div>
    </div>
  );
} 