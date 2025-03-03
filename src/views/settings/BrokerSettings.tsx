import { useState } from "react";
import { webullService } from "@/services/webullService";
import { useTradeStore } from "@/stores/tradeStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function BrokerSettings() {
  const { user } = useAuthStore();
  const { fetchTrades, deleteTrade, trades } = useTradeStore();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearBrokerTrades = async (brokerId: string) => {
    setIsClearing(true);
    try {
      // Get all trades for this broker
      const brokerTrades = trades.filter(
        (trade) => trade.broker_id === brokerId,
      );

      // Delete each trade
      for (const trade of brokerTrades) {
        await deleteTrade(trade.id);
      }

      // Clear from webull service if it's webull
      if (brokerId === "webull") {
        webullService.clearTrades();
      }

      // Refresh the trades list
      if (user) {
        await fetchTrades(user.id);
      }
      toast.success(`Successfully cleared all ${brokerId} trades`);
    } catch (error) {
      console.error(`Failed to clear ${brokerId} trades:`, error);
      toast.error(`Failed to clear ${brokerId} trades`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllTrades = async () => {
    setIsClearing(true);
    try {
      // Delete all trades
      for (const trade of trades) {
        await deleteTrade(trade.id);
      }

      // Clear webull service data
      webullService.clearAllData();

      // Refresh the trades list
      if (user) {
        await fetchTrades(user.id);
      }
      toast.success("Successfully cleared all trades");
    } catch (error) {
      console.error("Failed to clear all trades:", error);
      toast.error("Failed to clear all trades");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
      <div className="divide-y divide-border dark:divide-border">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-foreground dark:text-dark-text">
            Connected Brokers
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-dark-muted">
            Manage your connected trading accounts and data
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-4">
            {/* Webull Section */}
            <div className="p-4 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-bg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground dark:text-dark-text">
                    Webull
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-dark-muted">
                    Clear all imported Webull trade data
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isClearing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isClearing ? "Clearing..." : "Clear Trades"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Webull Trades</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all imported Webull trades.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleClearBrokerTrades("webull")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear Trades
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* All Trades Section */}
            <div className="p-4 border border-border dark:border-dark-border rounded-lg bg-muted/50 dark:bg-dark-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground dark:text-dark-text">
                    All Trades
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-dark-muted">
                    Clear all trade data from all brokers
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isClearing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isClearing ? "Clearing..." : "Clear All Trades"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Trades</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all trades from all
                        brokers. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllTrades}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All Trades
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
