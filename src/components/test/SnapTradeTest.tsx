import React, { useState } from 'react';
import { SnapTradeServiceSingleton } from '@/services/snaptradeService';

export const SnapTradeTest: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<{ success?: boolean; message: string }>({ message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult({ message: 'Testing SnapTrade registration...' });

    try {
      const snapTradeService = SnapTradeServiceSingleton.getInstance();
      
      // Log the configuration (without sensitive data)
      const config = snapTradeService.getConfig();
      console.log('SnapTrade Config:', {
        hasClientId: !!config.clientId,
        hasConsumerKey: !!config.consumerKey,
        redirectUri: config.redirectUri
      });

      // Attempt to register
      const response = await snapTradeService.registerUser(userId);
      
      console.log('Registration Response:', {
        userId: response.userId,
        hasUserSecret: !!response.userSecret
      });

      setResult({
        success: true,
        message: `Successfully registered user! User Secret: ${response.userSecret.substring(0, 8)}...`
      });
    } catch (error) {
      console.error('Registration Error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-foreground">SnapTrade Registration Test</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground">
          User ID
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter test user ID"
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isLoading || !userId}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          isLoading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isLoading ? 'Testing...' : 'Test Registration'}
      </button>

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

      <div className="text-sm text-muted-foreground">
        <p>This component tests the SnapTrade registration flow with:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Proper error handling</li>
          <li>Configuration validation</li>
          <li>Response logging</li>
          <li>User feedback</li>
        </ul>
      </div>
    </div>
  );
}; 