import { useState } from "@/lib/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import type {
  Trade,
  TradeType,
  TradeSide,
  CreateTradeData,
} from "@/types/trade";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: CreateTradeData) => void;
  initialData?: Partial<Trade>;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const [symbol, setSymbol] = useState(initialData?.symbol || "");
  const [type, setType] = useState<TradeType>(initialData?.type || "stock");
  const [side, setSide] = useState<TradeSide>(initialData?.side || "Long");
  const [quantity, setQuantity] = useState(
    initialData?.quantity?.toString() || "",
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState(
    initialData?.time || new Date().toTimeString().split(" ")[0],
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Option specific fields
  const [strike, setStrike] = useState(
    initialData?.option_details?.strike?.toString() || "",
  );
  const [expiration, setExpiration] = useState(
    initialData?.option_details?.expiration || "",
  );
  const [optionType, setOptionType] = useState<"call" | "put">(
    initialData?.option_details?.option_type || "call",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const transaction: CreateTradeData = {
        symbol: symbol.toUpperCase(),
        type,
        side,
        quantity: Number(quantity),
        price: Number(price),
        date,
        time,
        notes,
        status: "open",
        ...(type === "option" && {
          option_details: {
            strike: Number(strike),
            expiration,
            option_type: optionType,
          },
        }),
      };

      await onSubmit(transaction);
      toast.addToast("Transaction added successfully", "success");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
      toast.addToast("Failed to add transaction", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="symbol" className="text-sm font-medium">
                Symbol
              </label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(value: TradeType) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="option">Option</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="side" className="text-sm font-medium">
                Side
              </label>
              <Select
                value={side}
                onValueChange={(value: TradeSide) => setSide(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {type === "option" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="strike" className="text-sm font-medium">
                  Strike Price
                </label>
                <Input
                  id="strike"
                  type="number"
                  step="0.01"
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="expiration" className="text-sm font-medium">
                  Expiration Date
                </label>
                <Input
                  id="expiration"
                  type="date"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="optionType" className="text-sm font-medium">
                  Option Type
                </label>
                <Select
                  value={optionType}
                  onValueChange={(value: "call" | "put") =>
                    setOptionType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="put">Put</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
