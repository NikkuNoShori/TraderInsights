import { useState } from "@/lib/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { ManualTradeForm } from "./ManualTradeForm";
import { ImportTradeForm } from "./ImportTradeForm";
import type { Trade, CreateTradeData } from "@/types/trade";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trade: CreateTradeData) => void;
  initialData?: Partial<Trade>;
  mode?: "add" | "edit";
  orderType?: "buy" | "sell";
}

export function TradeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  orderType,
}: TradeModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual");
  const { importTrades, fetchTrades } = useTradeStore();
  const { user } = useAuthStore();

  const handleSubmitSuccess = (trade: CreateTradeData) => {
    onSubmit(trade);
    onClose();
  };

  const handleImportComplete = async (trades: Partial<Trade>[]) => {
    try {
      await importTrades(trades);
      // Refresh the trades list after import
      if (user) {
        await fetchTrades(user.id);
      }
      onClose();
    } catch (error) {
      console.error("Failed to import trades:", error);
    }
  };

  const getModalTitle = () => {
    if (mode === "add") return "Add Trade";
    if (orderType === "buy") return "Edit Buy Order";
    if (orderType === "sell") return "Edit Sell Order";
    return "Edit Trade";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background dark:bg-dark-paper border-border dark:border-dark-border max-w-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground dark:text-dark-text">
              {getModalTitle()}
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
          <DialogDescription className="sr-only">
            {mode === "add"
              ? "Add a new trade manually or import trades"
              : `Edit ${orderType} order details`}
          </DialogDescription>
        </DialogHeader>

        {mode === "add" ? (
          <div className="py-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "manual" | "import")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted dark:bg-dark-muted">
                <TabsTrigger
                  value="manual"
                  className="py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
                >
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger
                  value="import"
                  className="py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-dark-paper data-[state=active]:text-foreground dark:data-[state=active]:text-dark-text"
                >
                  Import Trades
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="manual">
                  <ManualTradeForm
                    onSuccess={handleSubmitSuccess}
                    initialData={initialData}
                    onCancel={onClose}
                    orderType={orderType}
                  />
                </TabsContent>

                <TabsContent value="import">
                  <ImportTradeForm
                    onClose={onClose}
                    onImportComplete={handleImportComplete}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="py-4">
            <ManualTradeForm
              onSuccess={handleSubmitSuccess}
              initialData={initialData}
              onCancel={onClose}
              orderType={orderType}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
