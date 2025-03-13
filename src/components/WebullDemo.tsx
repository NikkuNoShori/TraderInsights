import { useState, useEffect } from 'react';
import { webullService } from '@/services/webullService';
import type { WebullCredentials } from '@/lib/webull/client';
import type { WebullTrade } from '@/services/webullService';
import type { WebullPosition, WebullAccount } from '@/lib/webull/client';

export default function WebullDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trades, setTrades] = useState<WebullTrade[]>([]);
  const [positions, setPositions] = useState<WebullPosition[]>([]);
  const [account, setAccount] = useState<WebullAccount | null>(null);
  const [credentials, setCredentials] = useState<WebullCredentials>({
    username: '',
    password: '',
    deviceId: '',
    deviceName: 'TraderInsights',
    mfaCode: '',
  });
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if we're in a browser environment
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Initialize the service
      await webullService.init(true); // Use mock client for demo

      // Login
      await webullService.login(credentials);
      setIsAuthenticated(true);
    } catch (err) {
      setError(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await webullService.logout();
      setIsAuthenticated(false);
      setTrades([]);
      setPositions([]);
      setAccount(null);
    } catch (err) {
      setError(`Logout failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await webullService.syncAllData();
      setTrades(data.trades);
      setPositions(data.positions);
      setAccount(data.account);
    } catch (err) {
      setError(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMockData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await webullService.generateMockData(5);
      setTrades(data.trades);
      setPositions(data.positions);
      setAccount(data.account);
    } catch (err) {
      setError(`Generate mock data failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If not in a browser environment, show a message
  if (!isBrowser) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">WebUll Integration Demo</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          This component requires a browser environment to run. It cannot be server-side rendered.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WebUll Integration Demo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Login to WebUll</h2>
          <div className="mb-4">
            <label className="block mb-2">
              Username:
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              Password:
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              Device ID (optional):
              <input
                type="text"
                name="deviceId"
                value={credentials.deviceId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              MFA Code (if required):
              <input
                type="text"
                name="mfaCode"
                value={credentials.mfaCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleGenerateMockData}
            disabled={isLoading}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
          >
            Generate Mock Data
          </button>
        </form>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">WebUll Data</h2>
            <div>
              <button
                onClick={handleSyncData}
                disabled={isLoading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300 mr-2"
              >
                {isLoading ? 'Syncing...' : 'Sync Data'}
              </button>
              <button
                onClick={handleGenerateMockData}
                disabled={isLoading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300 mr-2"
              >
                Generate Mock Data
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
              >
                Logout
              </button>
            </div>
          </div>

          {account && (
            <div className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Account ID:</strong> {account.accountId}</p>
                  <p><strong>Account Type:</strong> {account.accountType}</p>
                  <p><strong>Currency:</strong> {account.currency}</p>
                  <p><strong>Day Trader:</strong> {account.dayTrader ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p><strong>Net Liquidation:</strong> ${account.netLiquidation.toFixed(2)}</p>
                  <p><strong>Total Cash:</strong> ${account.totalCash.toFixed(2)}</p>
                  <p><strong>Buying Power:</strong> ${account.buyingPower.toFixed(2)}</p>
                  <p><strong>Total Position Value:</strong> ${account.totalPositionValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {positions.length > 0 && (
            <div className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Positions ({positions.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Symbol</th>
                      <th className="py-2 px-4 border-b text-right">Quantity</th>
                      <th className="py-2 px-4 border-b text-right">Avg Cost</th>
                      <th className="py-2 px-4 border-b text-right">Last Price</th>
                      <th className="py-2 px-4 border-b text-right">Market Value</th>
                      <th className="py-2 px-4 border-b text-right">Unrealized P&L</th>
                      <th className="py-2 px-4 border-b text-right">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 border-b">{position.symbol}</td>
                        <td className="py-2 px-4 border-b text-right">{position.quantity}</td>
                        <td className="py-2 px-4 border-b text-right">${position.avgCost.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-right">${position.lastPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-right">${position.marketValue.toFixed(2)}</td>
                        <td className={`py-2 px-4 border-b text-right ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${position.unrealizedPnl.toFixed(2)}
                        </td>
                        <td className={`py-2 px-4 border-b text-right ${position.unrealizedPnlRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(position.unrealizedPnlRate * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trades.length > 0 && (
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Trades ({trades.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Order ID</th>
                      <th className="py-2 px-4 border-b text-left">Symbol</th>
                      <th className="py-2 px-4 border-b text-left">Action</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-right">Quantity</th>
                      <th className="py-2 px-4 border-b text-right">Price</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                      <th className="py-2 px-4 border-b text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 border-b">{trade.orderId.substring(0, 10)}...</td>
                        <td className="py-2 px-4 border-b">{trade.symbol}</td>
                        <td className={`py-2 px-4 border-b ${trade.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.action}
                        </td>
                        <td className="py-2 px-4 border-b">{trade.orderType}</td>
                        <td className="py-2 px-4 border-b text-right">{trade.quantity}</td>
                        <td className="py-2 px-4 border-b text-right">
                          ${(trade.filledPrice || trade.price || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 border-b">{trade.status}</td>
                        <td className="py-2 px-4 border-b">
                          {new Date(trade.createTime).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 