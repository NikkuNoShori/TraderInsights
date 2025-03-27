import { useState } from "@/lib/react";
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
import { processTradeFile } from "@/lib/services/fileProcessing";
import { toast } from "react-hot-toast";
import { transformBrokerTrade } from "@/utils/brokerTransforms";

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
      const result = await processTradeFile(file, (progress) => {
        setProgress(progress * 100);
      });

      // Transform trades based on the selected broker
      const processedTrades = result.trades.map((trade) => {
        const transformedTrade = transformBrokerTrade(trade, selectedBroker);
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
      toast.error(
        error instanceof Error ? error.message : "Failed to import trades",
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-text-muted">
          Select Broker
        </label>
        <Select value={selectedBroker} onValueChange={setSelectedBroker}>
          <SelectTrigger className="mt-1.5 bg-background border-border">
            <SelectValue placeholder="Choose a broker" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="webull">Webull</SelectItem>
            <SelectItem value="schwab">Charles Schwab</SelectItem>
            <SelectItem value="td">TD Ameritrade</SelectItem>
            <SelectItem value="ibkr">Interactive Brokers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedBroker ? (
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
      ) : null}
    </div>
  );
}
