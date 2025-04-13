import { useState, useEffect } from 'react';
import { snapTradeService } from '@/services/snaptradeService';
import { SnapTradeConnection, SnapTradeAccount, SnapTradePosition, SnapTradeBalance, SnapTradeOrder } from '@/lib/snaptrade/types';
import { SnapTradeService } from '@/lib/snaptrade/client';

// Configuration for SnapTrade
const SNAPTRADE_CONFIG = {
  clientId: import.meta.env.VITE_SNAPTRADE_CLIENT_ID || '',
  consumerKey: import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY || '',
  redirectUri: import.meta.env.VITE_SNAPTRADE_REDIRECT_URI || `${window.location.origin}/broker-callback`,
};

// Log the configuration (without sensitive values)
console.log('SnapTrade Configuration:', {
  hasClientId: !!SNAPTRADE_CONFIG.clientId,
  hasConsumerKey: !!SNAPTRADE_CONFIG.consumerKey,
  redirectUri: SNAPTRADE_CONFIG.redirectUri,
});

export default function SnapTradeDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState('');
  const [brokerages, setBrokerages] = useState<any[]>([]);
  const [connections, setConnections] = useState<SnapTradeConnection[]>([]);
  const [accounts, setAccounts] = useState<SnapTradeAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<SnapTradePosition[]>([]);
  const [balances, setBalances] = useState<SnapTradeBalance[]>([]);
  const [orders, setOrders] = useState<SnapTradeOrder[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if we're in a browser environment
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  // Initialize the SnapTrade service
  useEffect(() => {
    if (!isBrowser) return;

    const initService = async () => {
      try {
        // Create a new instance of SnapTradeService with the config
        const service = new SnapTradeService(SNAPTRADE_CONFIG);
        setIsInitialized(true);

        // Load brokerages immediately
        const brokerageList = await service.getBrokerages();
        console.log('Loaded brokerages:', brokerageList);
        setBrokerages(brokerageList);
      } catch (error) {
        console.error('Failed to initialize SnapTrade service:', error);
        setError(`Failed to initialize SnapTrade service: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    initService();
  }, [isBrowser]);

  // Load brokerages
  useEffect(() => {
    if (!isInitialized) return;

    const loadBrokerages = async () => {
      try {
        setIsLoading(true);
        const brokerageList = await snapTradeService.getBrokerages();
        setBrokerages(brokerageList);
      } catch (error) {
        console.error('Failed to load brokerages:', error);
        setError(`Failed to load brokerages: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrokerages();
  }, [isInitialized]);

  // Load user data (connections and accounts)
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await snapTradeService.syncAllData();
      setConnections(data.connections);
      setAccounts(data.accounts);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(`Failed to load user data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Register a user
  const handleRegister = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await snapTradeService.registerUser(userId);
      setIsRegistered(true);
    } catch (error) {
      console.error('Failed to register user:', error);
      setError(`Failed to register user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = snapTradeService.getUser();
      if (!user) {
        setError('No user registered');
        return;
      }
      await snapTradeService.deleteUser(user.userId);
      setIsRegistered(false);
      setConnections([]);
      setAccounts([]);
      setHoldings([]);
      setBalances([]);
      setOrders([]);
      setSelectedAccountId(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a connection link
  const handleCreateConnectionLink = async (brokerageId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = snapTradeService.getUser();
      if (!user) {
        setError('No user registered');
        return;
      }
      const connectionUrl = await snapTradeService.createConnectionLink(user.userId, user.userSecret);
      window.open(connectionUrl, '_blank');
    } catch (error) {
      console.error('Failed to create connection link:', error);
      setError(`Failed to create connection link: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a connection
  const handleDeleteConnection = async (connectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await snapTradeService.deleteConnection(connectionId);
      // Refresh connections
      await loadUserData();
    } catch (error) {
      console.error('Failed to delete connection:', error);
      setError(`Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load account details
  const handleLoadAccountDetails = async (accountId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedAccountId(accountId);

      // Load holdings, balances, and orders in parallel
      const [holdingsData, balancesData, ordersData] = await Promise.all([
        snapTradeService.getAccountHoldings(accountId),
        snapTradeService.getAccountBalances(accountId),
        snapTradeService.getAccountOrders(accountId),
      ]);

      setHoldings(holdingsData);
      setBalances(balancesData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load account details:', error);
      setError(`Failed to load account details: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loadUserData();
      if (selectedAccountId) {
        await handleLoadAccountDetails(selectedAccountId);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setError(`Failed to refresh data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If not in a browser environment, show a message
  if (!isBrowser) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">SnapTrade Integration Demo</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          This component requires a browser environment to run. It cannot be server-side rendered.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SnapTrade Integration Demo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}

      {!isRegistered ? (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Register with SnapTrade</h2>
          <div className="mb-4">
            <label className="block mb-2">
              User ID:
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter a unique user ID"
                required
              />
            </label>
          </div>
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Register
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">SnapTrade User</h2>
            <div>
              <button
                onClick={handleRefreshData}
                disabled={isLoading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300 mr-2"
              >
                Refresh Data
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
              >
                Delete User
              </button>
            </div>
          </div>

          {/* Brokerages */}
          <div className="mb-6 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Available Brokerages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokerages
                .filter(brokerage => brokerage.isOAuthSupported)
                .map((brokerage) => (
                  <div key={brokerage.id} className="p-4 border rounded">
                    <div className="flex items-center mb-2">
                      {brokerage.logo && (
                        <img
                          src={brokerage.logo}
                          alt={brokerage.name}
                          className="w-8 h-8 mr-2"
                        />
                      )}
                      <h4 className="font-semibold">{brokerage.name}</h4>
                    </div>
                    <p className="text-sm mb-2">Status: {brokerage.status}</p>
                    <button
                      onClick={() => handleCreateConnectionLink(brokerage.id)}
                      disabled={isLoading}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      Connect
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Connections */}
          {connections.length > 0 && (
            <div className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Your Connections ({connections.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Brokerage</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                      <th className="py-2 px-4 border-b text-left">Created</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((connection) => (
                      <tr key={connection.id}>
                        <td className="py-2 px-4 border-b">{connection.brokerageName}</td>
                        <td className="py-2 px-4 border-b">{connection.status}</td>
                        <td className="py-2 px-4 border-b">
                          {new Date(connection.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => handleDeleteConnection(connection.id)}
                            disabled={isLoading}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:bg-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accounts */}
          {accounts.length > 0 && (
            <div className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Your Accounts ({accounts.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Number</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className={selectedAccountId === account.id ? 'bg-blue-50' : ''}>
                        <td className="py-2 px-4 border-b">{account.name}</td>
                        <td className="py-2 px-4 border-b">{account.number}</td>
                        <td className="py-2 px-4 border-b">{account.type}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => handleLoadAccountDetails(account.id)}
                            disabled={isLoading}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Account Details */}
          {selectedAccountId && (
            <div>
              {/* Balances */}
              {balances.length > 0 && (
                <div className="mb-6 p-4 border rounded">
                  <h3 className="text-lg font-semibold mb-2">Account Balances</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Currency</th>
                          <th className="py-2 px-4 border-b text-right">Cash</th>
                          <th className="py-2 px-4 border-b text-right">Market Value</th>
                          <th className="py-2 px-4 border-b text-right">Total Value</th>
                          <th className="py-2 px-4 border-b text-right">Buying Power</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balances.map((balance, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-b">{balance.currency}</td>
                            <td className="py-2 px-4 border-b text-right">${balance.cash.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-right">${balance.marketValue.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-right">${balance.totalValue.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-right">${balance.buyingPower.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Holdings */}
              {holdings.length > 0 && (
                <div className="mb-6 p-4 border rounded">
                  <h3 className="text-lg font-semibold mb-2">Holdings ({holdings.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Symbol</th>
                          <th className="py-2 px-4 border-b text-right">Quantity</th>
                          <th className="py-2 px-4 border-b text-right">Price</th>
                          <th className="py-2 px-4 border-b text-right">Avg Entry</th>
                          <th className="py-2 px-4 border-b text-right">Market Value</th>
                          <th className="py-2 px-4 border-b text-right">Open P&L</th>
                          <th className="py-2 px-4 border-b text-right">Day P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((position) => (
                          <tr key={position.id}>
                            <td className="py-2 px-4 border-b">{position.symbol}</td>
                            <td className="py-2 px-4 border-b text-right">{position.quantity}</td>
                            <td className="py-2 px-4 border-b text-right">${position.price.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-right">${position.averageEntryPrice.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-right">${position.marketValue.toFixed(2)}</td>
                            <td className={`py-2 px-4 border-b text-right ${position.openPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${position.openPnl.toFixed(2)}
                            </td>
                            <td className={`py-2 px-4 border-b text-right ${position.dayPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${position.dayPnl.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders */}
              {orders.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="text-lg font-semibold mb-2">Orders ({orders.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Symbol</th>
                          <th className="py-2 px-4 border-b text-left">Action</th>
                          <th className="py-2 px-4 border-b text-left">Type</th>
                          <th className="py-2 px-4 border-b text-right">Quantity</th>
                          <th className="py-2 px-4 border-b text-right">Price</th>
                          <th className="py-2 px-4 border-b text-left">Status</th>
                          <th className="py-2 px-4 border-b text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="py-2 px-4 border-b">{order.symbol}</td>
                            <td className={`py-2 px-4 border-b ${order.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                              {order.action}
                            </td>
                            <td className="py-2 px-4 border-b">{order.type}</td>
                            <td className="py-2 px-4 border-b text-right">{order.quantity}</td>
                            <td className="py-2 px-4 border-b text-right">
                              ${order.price.toFixed(2)}
                            </td>
                            <td className="py-2 px-4 border-b">{order.status}</td>
                            <td className="py-2 px-4 border-b">
                              {new Date(order.createdAt).toLocaleDateString()}
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
      )}
    </div>
  );
} 