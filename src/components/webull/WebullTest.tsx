import { useState } from "react";
import { webullService, type WebullTrade } from "@/services/webullService";
import type { WebullAuthResponse } from "webull-api-node";

export function WebullTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authResponse, setAuthResponse] = useState<WebullAuthResponse | null>(
    null,
  );
  const [trades, setTrades] = useState<WebullTrade[]>([]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize the client
      await webullService.init();

      // Login with credentials from environment variables
      const auth = await webullService.login({
        username: import.meta.env.VITE_WEBULL_USERNAME,
        password: import.meta.env.VITE_WEBULL_PASSWORD,
      });

      setAuthResponse(auth);

      // Fetch trades
      const fetchedTrades = await webullService.fetchTrades();
      setTrades(fetchedTrades);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to Webull",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await webullService.logout();
      setAuthResponse(null);
      setTrades([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect from Webull",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleConnect}
          disabled={isLoading || !!authResponse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Connecting..." : "Connect to Webull"}
        </button>

        <button
          onClick={handleDisconnect}
          disabled={isLoading || !authResponse}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {authResponse && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Connected to Webull</h3>
          <p>
            Token expires in:{" "}
            {new Date(authResponse.tokenExpiry).toLocaleString()}
          </p>
        </div>
      )}

      {trades.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border">Symbol</th>
                  <th className="px-4 py-2 border">Action</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Price</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.orderId}>
                    <td className="px-4 py-2 border">{trade.symbol}</td>
                    <td className="px-4 py-2 border">{trade.action}</td>
                    <td className="px-4 py-2 border">
                      {trade.filledQuantity || trade.quantity}
                    </td>
                    <td className="px-4 py-2 border">
                      ${trade.filledPrice || trade.price}
                    </td>
                    <td className="px-4 py-2 border">{trade.status}</td>
                    <td className="px-4 py-2 border">
                      {new Date(trade.createTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
