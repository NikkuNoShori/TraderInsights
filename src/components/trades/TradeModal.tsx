import { useState } from "@/lib/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { ManualTradeForm } from "./ManualTradeForm";
import { ImportTradeForm } from "./ImportTradeForm";
import type { Trade, CreateTradeData } from "@/types/trade";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trade: CreateTradeData) => void;
  initialData?: Partial<Trade>;
  mode?: "add" | "edit";
}

export function TradeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}: TradeModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual");

  const handleSubmitSuccess = (trade: CreateTradeData) => {
    onSubmit(trade);
    onClose();
  };

  const handleImportComplete = (trades: Partial<Trade>[]) => {
    // For now, we'll just submit the first trade
    // TODO: Add support for multiple trade submission
    if (trades.length > 0) {
      onSubmit(trades[0] as CreateTradeData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background dark:bg-dark-paper border-border dark:border-dark-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground dark:text-dark-text">
              {mode === "add" ? "Add Trade" : "Edit Trade"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground dark:text-dark-muted dark:hover:text-dark-text"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {mode === "add" ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "import")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted dark:bg-dark-muted">
              <TabsTrigger
                value="manual"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
              >
                Manual Entry
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
              >
                Import Trades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ManualTradeForm onSuccess={handleSubmitSuccess} initialData={initialData} />
            </TabsContent>

            <TabsContent value="import">
              <ImportTradeForm onImportComplete={handleImportComplete} />
            </TabsContent>
          </Tabs>
        ) : (
          <ManualTradeForm onSuccess={handleSubmitSuccess} initialData={initialData} />
        )}
      </DialogContent>
    </Dialog>
  );
} 