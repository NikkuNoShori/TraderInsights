import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { createConfig } from '@/lib/snaptrade/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'react-hot-toast';


const SnapTradePage: NextPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const snapTradeClient = new SnapTradeClient(createConfig());

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      if (!snapTradeClient.isUserRegistered()) {
        await snapTradeClient.initialize();
      }
      const connectionLink = await snapTradeClient.createConnectionLink(
        snapTradeClient.getUser()?.userId || '',
        snapTradeClient.getUser()?.userSecret || '',
        'webull' // Default to Webull for now
      );
      window.location.href = connectionLink.redirectURI;
    } catch (error) {
      console.error('Failed to connect to SnapTrade:', error);
      toast.error('Failed to connect to SnapTrade. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>SnapTrade Integration | Trader Insights</title>
        <meta name="description" content="Connect your brokerage accounts using SnapTrade" />
      </Head>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">SnapTrade Integration</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connect Your Brokerage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Connect your brokerage accounts securely using SnapTrade's OAuth integration.
                This allows Trader Insights to access your trading data without storing your credentials.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-700">
                  <strong>Note:</strong> Your credentials are never stored by Trader Insights.
                  All connections are managed securely through SnapTrade's OAuth flow.
                </p>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full sm:w-auto"
              >
                {isConnecting ? 'Connecting...' : 'Connect Brokerage'}
              </Button>
            </CardContent>
          </Card>
          
        </div>
      </main>
    </Layout>
  );
};

export default SnapTradePage; 