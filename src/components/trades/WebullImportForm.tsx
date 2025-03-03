import { useState } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { webullService } from "@/services/webullService";
import { transformWebullTrades } from "@/utils/webullTransforms";
import type { Trade } from "@/types/trade";
import { toast } from "react-hot-toast";
import { useTradeStore } from "@/stores/tradeStore";

interface WebullImportFormProps {
  onClose: () => void;
  onImportComplete: (trades: Partial<Trade>[]) => Promise<void>;
}

export function WebullImportForm({
  onClose,
  onImportComplete,
}: WebullImportFormProps) {
  const { user } = useAuthStore();
  const { fetchTrades } = useTradeStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");

  const handleImport = async () => {
    if (!user || !username || !password) return;

    setLoading(true);
    setImportStatus("Initializing Webull client...");
    try {
      // Initialize and connect to Webull
      await webullService.init();
      setImportStatus("Logging in to Webull...");
      await webullService.login({
        username,
        password,
      });

      // Fetch trades
      setImportStatus("Fetching trades from Webull...");
      const webullTrades = await webullService.fetchTrades();
      console.log("Fetched trades from Webull:", webullTrades);

      // Transform to our trade format
      setImportStatus("Processing trades...");
      const processedTrades = transformWebullTrades(webullTrades).map(
        (trade) => ({
          ...trade,
          user_id: user.id,
          broker_id: "webull",
          created_at: new Date().toISOString(),
        }),
      );
      console.log("Processed trades:", processedTrades);

      // Import trades
      setImportStatus("Saving trades...");
      await onImportComplete(processedTrades);
      console.log("Trades saved successfully");

      // Refresh the trades list
      await fetchTrades(user.id);
      console.log("Trades list refreshed");

      toast.success(
        `Successfully imported ${processedTrades.length} trades from Webull`,
      );
      onClose();
    } catch (error) {
      console.error("Webull import error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to import trades from Webull";
      toast.error(errorMessage);
      setImportStatus(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      // Logout from Webull
      try {
        await webullService.logout();
      } catch (logoutError) {
        console.error("Failed to logout from Webull:", logoutError);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-muted">
            Webull Username
          </label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Webull username"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-muted">
            Webull Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Webull password"
            className="mt-1"
          />
        </div>

        {importStatus && (
          <div className="text-sm text-text-muted mt-2">{importStatus}</div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-border hover:bg-background"
        >
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!username || !password || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Importing..." : "Import from Webull"}
        </Button>
      </div>
    </div>
  );
}
