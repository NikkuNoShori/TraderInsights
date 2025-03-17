import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useState } from 'react';

const SnapTradeTestPage: NextPage = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (useMock: boolean) => {
    setIsLoading(true);
    setOutput(['Starting SnapTrade test...']);

    try {
      // Make a fetch request to the direct API endpoint
      const response = await fetch(`/api/run-snaptrade-test${useMock ? '?mock=true' : ''}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setOutput(data.logs || ['No logs returned from the API']);
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>SnapTrade API Test | Trader Insights</title>
        <meta name="description" content="Test the SnapTrade API integration" />
      </Head>

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">SnapTrade API Test</h1>
        
        <div className="mb-8">
          <p className="mb-4">
            This page allows you to test the SnapTrade API integration. You can run the test with mock data or with the real API.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => runTest(true)}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              Run with Mock Data
            </button>
            
            <button
              onClick={() => runTest(false)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              Run with Real API
            </button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Test Output</h2>
          
          {isLoading && (
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              <span>Running test...</span>
            </div>
          )}
          
          <pre className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {output.length > 0 ? output.join('\n') : 'No output yet. Run a test to see results.'}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default SnapTradeTestPage; 