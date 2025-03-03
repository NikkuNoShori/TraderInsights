import { useState } from "@/lib/react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface AddSymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => Promise<void>;
}

export function AddSymbolModal({
  isOpen,
  onClose,
  onAdd,
}: AddSymbolModalProps) {
  const [symbol, setSymbol] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(symbol.toUpperCase());
      setSymbol("");
      onClose();
    } catch (error) {
      console.error("Failed to add symbol:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add symbol",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Symbol to Watchlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!symbol.trim() || isLoading}>
              {isLoading ? "Adding..." : "Add Symbol"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
