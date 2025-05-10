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
import { processFile } from "@/utils/fileProcessing";
import { toast } from "react-hot-toast";
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setLoading(true);
    try {
      const result = await processFile(file);

      // Transform trades based on the selected broker
      const processedTrades = result.trades.map((trade: Partial<Trade>) => {
        const transformedTrade = trade;
        return {
          ...transformedTrade,
          user_id: user.id,
          created_at: new Date().toISOString(),
        };
      });

      await onImportComplete(processedTrades);
      setFile(null);
      onClose();
      toast.success(
        `Successfully imported ${processedTrades.length} trades`,
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
              disabled={loading}
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
