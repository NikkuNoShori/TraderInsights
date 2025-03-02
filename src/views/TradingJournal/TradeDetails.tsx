import { useState, useEffect } from "@/lib/react";
import { useParams, useNavigate } from "react-router-dom";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { TradeModal } from "@/components/trades/TradeModal";
import { toast } from "react-hot-toast";
import type { Trade } from "@/types/trade";

export default function TradeDetails() {
  const { id: tradeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trades, deleteTrade, fetchTrades } = useTradeStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch trades if not already in store
  useEffect(() => {
    async function loadTrades() {
      if (user && (!trades.length || !trades.find(t => t.id === tradeId))) {
        setIsLoading(true);
        try {
          await fetchTrades(user.id);
        } catch (error) {
          console.error("Error fetching trades:", error);
          toast.error("Failed to load trade details");
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadTrades();
  }, [user, tradeId, trades.length, fetchTrades]);

  // Find the trade in the store
  const trade = trades.find(t => t.id === tradeId);

  const handleDelete = async () => {
    if (!trade) return;
    try {
      await deleteTrade(trade.id);
      toast.success("Trade deleted successfully");
      navigate("/app/journal");
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
    }
  };

  const handleEdit = async (updatedTrade: Partial<Trade>) => {
    if (!trade) return;
    try {
      await useTradeStore.getState().updateTrade(trade.id, updatedTrade);
      await fetchTrades(trade.user_id);
      toast.success("Trade updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating trade:", error);
      toast.error("Failed to update trade");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Trade not found</h3>
          <p>The requested trade could not be found.</p>
          <Button
            variant="ghost"
            onClick={() => navigate("/app/journal")}
            className="mt-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/app/journal")}
            className="flex items-center gap-1 p-2 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Button>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold">{trade.symbol}</h1>
            <span className="text-sm text-muted-foreground">
              {trade.date} {trade.time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1 h-8"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <Trash className="h-4 w-4" />
            <span className="text-sm">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Trade Summary Card */}
        <div className="col-span-12 bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Side</dt>
              <dd className={`text-sm font-medium ${
                trade.side === "Long"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {trade.side}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="text-sm font-medium capitalize">{trade.type}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Quantity</dt>
              <dd className="text-sm font-medium">{trade.quantity}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="text-sm font-medium capitalize">{trade.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Entry Price</dt>
              <dd className="text-sm font-medium">${trade.entry_price?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Exit Price</dt>
              <dd className="text-sm font-medium">
                {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
              </dd>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="col-span-12 md:col-span-6 bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
          <h2 className="text-sm font-semibold mb-3">Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Total Value</dt>
              <dd className="text-sm font-medium">${trade.total?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">P&L</dt>
              <dd className={`text-sm font-medium ${
                trade.pnl && trade.pnl > 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'N/A'}
              </dd>
            </div>
            {trade.fees !== undefined && (
              <div>
                <dt className="text-xs text-muted-foreground">Fees</dt>
                <dd className="text-sm font-medium">${trade.fees.toFixed(2)}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Broker Info Card */}
        <div className="col-span-12 md:col-span-6 bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
          <h2 className="text-sm font-semibold mb-3">Broker Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Broker</dt>
              <dd className="text-sm font-medium capitalize">{trade.broker_id || 'Manual Entry'}</dd>
            </div>
            {trade.orderId && (
              <div>
                <dt className="text-xs text-muted-foreground">Order ID</dt>
                <dd className="text-sm font-medium">{trade.orderId}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Notes Card */}
        {trade.notes && (
          <div className="col-span-12 bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
            <h2 className="text-sm font-semibold mb-2">Notes</h2>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{trade.notes}</p>
          </div>
        )}
      </div>

      <TradeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        initialData={trade}
        mode="edit"
      />
    </div>
  );
} 