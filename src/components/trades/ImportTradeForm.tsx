import { useState, useEffect } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Trade } from "@/types/trade";
import { processTradeFile } from "@/services/fileProcessing";
import { toast } from "react-hot-toast";
import { transformTrade } from "@/utils/brokerTransforms";
import { snapTradeService } from "@/services/snaptradeService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

interface RateLimitError extends Error {
  resetAt: number;
}

interface ImportTradeFormProps {
  onClose: () => void;
  onImportComplete: (trades: Partial<Trade>[]) => Promise<void>;
}

export function ImportTradeForm({
  onClose,
  onImportComplete,
}: ImportTradeFormProps) {
  const { user } = useAuthStore();
  const [selectedBroker, setSelectedBroker] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brokerages, setBrokerages] = useState<any[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; timeUntilReset: number } | null>(null);

  useEffect(() => {
    // Fetch supported brokerages
    const fetchBrokerages = async () => {
      try {
        const brokers = await snapTradeService.getBrokerages();
        setBrokerages(brokers);
      } catch (error) {
        if (error instanceof Error && error.name === 'RateLimitError') {
          const rateLimitError = error as RateLimitError;
          const resetTime = new Date(rateLimitError.resetAt);
          toast.error(`Rate limit exceeded. Try again ${formatDistanceToNow(resetTime)}`);
        } else {
          toast.error('Failed to fetch supported brokers');
        }
      }
    };

    fetchBrokerages();

    // Update rate limit info every minute
    const interval = setInterval(() => {
      const info = snapTradeService.getRateLimitInfo();
      setRateLimitInfo(info);
    }, 60000);

    // Initial rate limit info
    const info = snapTradeService.getRateLimitInfo();
    setRateLimitInfo(info);

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  };

  const handleImport = async () => {
    if (!file || !user || !selectedBroker) return;

    setLoading(true);
    try {
      const result = await processTradeFile(file, (progress: number) => {
        setProgress(progress * 100);
      });

      // Transform trades based on the selected broker
      const processedTrades = result.trades.map((trade: Partial<Trade>) => {
        const transformedTrade = transformTrade(trade, selectedBroker as any);
        return {
          ...transformedTrade,
          user_id: user.id,
          broker_id: selectedBroker,
          created_at: new Date().toISOString(),
        };
      });

      await onImportComplete(processedTrades);
      setFile(null);
      onClose();
      toast.success(
        `Successfully imported ${processedTrades.length} trades from ${selectedBroker}`,
      );
    } catch (error) {
      console.error("Import error:", error);
      if (error instanceof Error && error.name === 'RateLimitError') {
        const rateLimitError = error as RateLimitError;
        const resetTime = new Date(rateLimitError.resetAt);
        toast.error(`Rate limit exceeded. Try again ${formatDistanceToNow(resetTime)}`);
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to import trades",
        );
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {rateLimitInfo && (
        <Alert className={rateLimitInfo.remaining === 0 ? "bg-red-50" : "bg-blue-50"}>
          <AlertDescription>
            {rateLimitInfo.remaining === 0 ? (
              <>
                Rate limit exceeded. Try again {formatDistanceToNow(new Date(Date.now() + rateLimitInfo.timeUntilReset))}
              </>
            ) : (
              <>
                {rateLimitInfo.remaining} imports remaining. Resets in {formatDistanceToNow(new Date(Date.now() + rateLimitInfo.timeUntilReset))}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label className="text-sm font-medium text-text-muted">
          Select Broker
        </label>
        <Select value={selectedBroker} onValueChange={setSelectedBroker}>
          <SelectTrigger className="mt-1.5 bg-background border-border">
            <SelectValue placeholder="Choose a broker" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {brokerages.map((broker) => (
              <SelectItem key={broker.id} value={broker.id}>
                {broker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-muted">
            Upload Trade File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="mt-1.5 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{file.name}</span>
            <Button
              onClick={handleImport}
              disabled={loading || (rateLimitInfo?.remaining === 0)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Importing..." : "Import"}
            </Button>
          </div>
        )}

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
