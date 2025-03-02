import { useState, useEffect } from "@/lib/react";
import { toast } from "react-hot-toast";
import { TradeList, SortField, SortDirection, SortState } from "./components/TradeList";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { Trade, CreateTradeData } from "@/types/trade";
import { TradeModal } from "@/components/trades/TradeModal";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { calculatePnL } from "@/utils/trade";
import { TRADE_COLUMNS } from "./components/TradeListColumns";

const TRADES_PER_PAGE = 10;

export default function TradingJournal() {
  const { user } = useAuthStore();
  const { trades, isLoading, error, fetchTrades, deleteTrade } = useTradeStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [sort, setSort] = useState<SortState>({ field: 'date', direction: 'desc' });

  useEffect(() => {
    if (user) {
      fetchTrades(user.id);
    }
  }, [user, fetchTrades]);

  // Calculate derived values for each trade
  const tradesWithCalculatedValues = trades.map(trade => {
    // Calculate total value
    const total = trade.quantity * (trade.entry_price || 0);

    // Calculate PnL
    const pnl = calculatePnL(trade);

    return {
      ...trade,
      total,
      pnl,
    };
  });

  const sortTrades = (unsortedTrades: Trade[]) => {
    return [...unsortedTrades].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;

      // Get the column configuration for the current sort field
      const column = TRADE_COLUMNS.find(col => col.id === sort.field);
      if (!column) return 0;

      // Get the values to compare using the column's accessor
      const aValue = typeof column.accessor === 'function' 
        ? column.accessor(a)
        : a[column.accessor];
      const bValue = typeof column.accessor === 'function'
        ? column.accessor(b)
        : b[column.accessor];

      // Handle different types of values
      if (sort.field === 'date') {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return (dateA - dateB) * direction;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      return 0;
    });
  };

  // Sort all trades first
  const sortedTrades = sortTrades(tradesWithCalculatedValues);

  // Then calculate pagination
  const totalPages = Math.ceil(sortedTrades.length / TRADES_PER_PAGE);
  const startIndex = (currentPage - 1) * TRADES_PER_PAGE;
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + TRADES_PER_PAGE);

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handleTradeSubmit = async (tradeData: CreateTradeData) => {
    try {
      if (selectedTrade) {
        // Handle edit
        await useTradeStore.getState().updateTrade(selectedTrade.id, tradeData);
        toast.success("Trade updated successfully");
      } else {
        // Handle add
        const newTrade = {
          ...tradeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await useTradeStore.getState().addTrade(newTrade);
        toast.success("Trade added successfully");
      }
      setIsModalOpen(false);
      setSelectedTrade(null);
      if (user) {
        await fetchTrades(user.id);
      }
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit trade");
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteTrade(id);
      toast.success("Trade deleted successfully");
      if (user) {
        await fetchTrades(user.id);
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete trade");
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <Button
          onClick={() => {
            setSelectedTrade(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

      <TradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrade(null);
        }}
        onSubmit={handleTradeSubmit}
        initialData={selectedTrade || undefined}
        mode={selectedTrade ? "edit" : "add"}
      />

      <TradeList
        trades={paginatedTrades}
        isLoading={isLoading}
        onDelete={handleDeleteTrade}
        onEdit={handleEditTrade}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sort={sort}
        onSort={handleSort}
      />
    </div>
  );
}
