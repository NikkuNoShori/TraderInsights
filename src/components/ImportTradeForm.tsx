import React, { useEffect, useState } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSnapTradeStore } from '@/stores/snapTradeStore';
import { useToast } from '@/components/ui/use-toast';

interface ImportTradeFormProps {
  config: SnapTradeConfig;
  userId: string;
}

export function ImportTradeForm({ config, userId }: ImportTradeFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSecret, setUserSecret] = useState<string | null>(null);
  const { saveUserData, isLoading: isSaving } = useSnapTradeStore();
  const { toast } = useToast();

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    initializeSnapTrade();
  }, []);

  const initializeSnapTrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is already registered in Supabase
      const { userData } = useSnapTradeStore.getState();
      if (userData?.snapTradeUserSecret) {
        setUserSecret(userData.snapTradeUserSecret);
        setIsLoading(false);
        return;
      }

      // Check localStorage as fallback
      const storedUserSecret = localStorage.getItem('snaptrade_user_secret');
      if (storedUserSecret) {
        setUserSecret(storedUserSecret);
        // Migrate to Supabase
        await saveUserData(userId, storedUserSecret);
        setIsLoading(false);
        return;
      }

      // Register new user
      const newUserSecret = await snapTradeService.registerUser(userId);
      setUserSecret(newUserSecret);
      // Save to both Supabase and localStorage (for backward compatibility)
      await saveUserData(userId, newUserSecret);
      localStorage.setItem('snaptrade_user_secret', newUserSecret);
    } catch (err) {
      setError('Failed to initialize SnapTrade. Please try again later.');
      console.error('Error initializing SnapTrade:', err);
      toast({
        title: "Error",
        description: "Failed to initialize SnapTrade. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await useSnapTradeStore.getState().clearUserData();
      localStorage.removeItem('snaptrade_user_secret');
      setUserSecret(null);
      toast({
        title: "Success",
        description: "Successfully disconnected from SnapTrade",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from SnapTrade",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Initializing SnapTrade</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!userSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Failed to initialize SnapTrade. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
        Successfully connected to SnapTrade
      </div>
      <Button 
        onClick={handleDisconnect}
        variant="destructive"
        disabled={isSaving}
      >
        {isSaving ? 'Disconnecting...' : 'Disconnect from SnapTrade'}
      </Button>
    </div>
  );
} 