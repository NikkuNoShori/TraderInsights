import React, { useEffect, useState } from "react";
import { snaptradeService } from "@/services/snaptradeService";

export const SnapTradeTest: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const apiStatus = await snaptradeService.initialize();
        setStatus(JSON.stringify(apiStatus, null, 2));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h2>SnapTrade API Status</h2>
      {status && <pre>{status}</pre>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}; 