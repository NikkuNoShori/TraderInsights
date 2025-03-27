import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

// Import the SnapTradeDemo component with dynamic loading to avoid SSR issues
const SnapTradeDemo = dynamic(() => import('@/components/SnapTradeDemo'), {
  ssr: false,
  loading: () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

const SnapTradePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>SnapTrade Integration | Trader Insights</title>
        <meta name="description" content="Connect your brokerage accounts using SnapTrade" />
      </Head>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">SnapTrade Integration</h1>
          <p className="mb-6">
            Connect your brokerage accounts securely using SnapTrade's OAuth integration.
            This allows Trader Insights to access your trading data without storing your credentials.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-700">
              <strong>Note:</strong> Your credentials are never stored by Trader Insights.
              All connections are managed securely through SnapTrade's OAuth flow.
            </p>
          </div>
          
          <SnapTradeDemo />
        </div>
      </main>
    </Layout>
  );
};

export default SnapTradePage; 
import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

// Import the SnapTradeDemo component with dynamic loading to avoid SSR issues
const SnapTradeDemo = dynamic(() => import('@/components/SnapTradeDemo'), {
  ssr: false,
  loading: () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

const SnapTradePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>SnapTrade Integration | Trader Insights</title>
        <meta name="description" content="Connect your brokerage accounts using SnapTrade" />
      </Head>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">SnapTrade Integration</h1>
          <p className="mb-6">
            Connect your brokerage accounts securely using SnapTrade's OAuth integration.
            This allows Trader Insights to access your trading data without storing your credentials.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-700">
              <strong>Note:</strong> Your credentials are never stored by Trader Insights.
              All connections are managed securely through SnapTrade's OAuth flow.
            </p>
          </div>
          
          <SnapTradeDemo />
        </div>
      </main>
    </Layout>
  );
};

export default SnapTradePage; 