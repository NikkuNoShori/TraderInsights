import React, { useEffect, useState } from "react";
import { snapTradeService } from "../services/snaptradeService";

export const SnapTradeTest: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const apiStatus = await snapTradeService.checkApiStatus();
        setStatus(JSON.stringify(apiStatus, null, 2));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">SnapTrade API Test</h2>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <pre className="bg-gray-100 p-4 rounded">{status || "Loading..."}</pre>
      )}
    </div>
  );
}; 