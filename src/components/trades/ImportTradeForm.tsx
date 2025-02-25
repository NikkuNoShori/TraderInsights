import { useState } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
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

interface ImportTradeFormProps {
  onClose: () => void;
  onImportComplete: (trades: Partial<Trade>[]) => Promise<void>;
}

export function ImportTradeForm({ onClose, onImportComplete }: ImportTradeFormProps) {
  const { user } = useAuthStore();
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
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
      const result = await processTradeFile(file, (progress) => {
        setProgress(progress * 100);
      });
      
      // Add user_id and broker_id to each trade
      const processedTrades = result.trades.map(trade => ({
        ...trade,
        user_id: user.id,
        broker_id: selectedBrokers[0],
        created_at: new Date().toISOString(),
      }));

      await onImportComplete(processedTrades);
      setFile(null);
      onClose();
      toast.success("Trades imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import trades");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Trades</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">
              Select Broker
            </label>
            <Select
              value={selectedBrokers.join(",")}
              onValueChange={(value) =>
                setSelectedBrokers(value.split(",").filter(Boolean))
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Choose a broker" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="schwab">Charles Schwab</SelectItem>
                <SelectItem value="td">TD Ameritrade</SelectItem>
                <SelectItem value="ibkr">Interactive Brokers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">
              CSV File
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-block"
              >
                <Button
                  variant="outline"
                  disabled={loading}
                  className="border-border hover:bg-background"
                >
                  Choose File
                </Button>
              </label>
              {file && (
                <span className="text-sm text-text-muted">{file.name}</span>
              )}
            </div>
            {loading && progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
              disabled={!file || loading || selectedBrokers.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Importing..." : "Import Trades"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
