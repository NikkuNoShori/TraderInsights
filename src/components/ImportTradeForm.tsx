import React, { useEffect, useState, useRef } from 'react';
import { SnapTradeService } from '@/lib/snaptrade/client';
import { SnapTradeConfig } from '@/lib/snaptrade/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSnapTradeStore } from '@/stores/snapTradeStore';
import { toast } from "react-hot-toast";

interface ImportTradeFormProps {
  config: SnapTradeConfig;
  userId: string;
}

export function ImportTradeForm({ config, userId }: ImportTradeFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSecret, setUserSecret] = useState<string | null>(null);
  const { saveUserData, isLoading: isSaving } = useSnapTradeStore();
  const initializationAttempted = useRef(false);

  const snapTradeService = new SnapTradeService(config);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) {
        return;
      }
      initializationAttempted.current = true;

      try {
        if (!mounted) return;
        setIsLoading(true);
        setError(null);

        // Check if user is already registered in Supabase
        const { userData } = useSnapTradeStore.getState();
        if (userData?.snapTradeUserSecret) {
          if (!mounted) return;
          setUserSecret(userData.snapTradeUserSecret);
          setIsLoading(false);
          return;
        }

        // Check localStorage as fallback
        const storedUserSecret = localStorage.getItem('snaptrade_user_secret');
        if (storedUserSecret) {
          if (!mounted) return;
          setUserSecret(storedUserSecret);
          // Migrate to Supabase
          await saveUserData(userId, storedUserSecret);
          if (!mounted) return;
          setIsLoading(false);
          return;
        }

        // Register new user
        const newUserSecret = await snapTradeService.registerUser(userId);
        if (!mounted) return;
        setUserSecret(newUserSecret);
        // Save to both Supabase and localStorage (for backward compatibility)
        await saveUserData(userId, newUserSecret);
        localStorage.setItem('snaptrade_user_secret', newUserSecret);
      } catch (err) {
        if (!mounted) return;
        const errorMessage = 'Failed to initialize SnapTrade. Please try again later.';
        setError(errorMessage);
        console.error('Error initializing SnapTrade:', err);
        // Only show toast if component is still mounted
        if (mounted) {
          toast.error(errorMessage);
        }
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [userId, config, saveUserData]); // Add saveUserData to dependencies

  const handleDisconnect = async () => {
    try {
      await useSnapTradeStore.getState().clearUserData();
      localStorage.removeItem('snaptrade_user_secret');
      setUserSecret(null);
      toast.success("Successfully disconnected from SnapTrade");
    } catch (error) {
      toast.error("Failed to disconnect from SnapTrade");
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
        variant="outline"
        className="bg-red-100 hover:bg-red-200 text-red-700"
        disabled={isSaving}
      >
        {isSaving ? 'Disconnecting...' : 'Disconnect from SnapTrade'}
      </Button>
    </div>
  );
} 