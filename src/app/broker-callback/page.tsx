'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapTradeStore } from '@/stores/snapTradeStore';
import { snapTradeAPI } from '@/lib/snaptrade/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function BrokerCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, fetchUserData } = useSnapTradeStore();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        // Exchange the code for access tokens
        await snapTradeAPI.exchangeCodeForTokens(code, state);

        // Refresh user data to get updated broker connections
        await fetchUserData();

        toast({
          title: "Success",
          description: "Successfully connected to your broker",
        });

        // Redirect back to the dashboard
        router.push('/app/dashboard');
      } catch (error) {
        console.error('Error handling broker callback:', error);
        toast({
          title: "Error",
          description: "Failed to complete broker connection",
          variant: "destructive",
        });
        router.push('/app/dashboard');
      }
    };

    handleCallback();
  }, [searchParams, router, fetchUserData, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Completing Broker Connection</CardTitle>
          <CardDescription>Please wait while we finalize your connection...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
} 