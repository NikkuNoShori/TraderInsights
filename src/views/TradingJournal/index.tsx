import { useState, useEffect } from "@/lib/react";
import { toast } from "react-hot-toast";
import {
  TradeList,
  SortField,
  SortDirection,
  SortState,
} from "./components/TradeList";
import { TradeStats } from "./components/TradeStats";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { Trade, CreateTradeData } from "@/types/trade";
import { TradeModal } from "@/components/trades/TradeModal";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { useFilterStore } from "@/stores/filterStore";
import { calculatePnL } from "@/utils/trade";
import { TRADE_COLUMNS } from "./components/TradeListColumns";
import { FilterBar } from "@/components/trades/FilterBar";
import { useTradesData } from "@/stores/tradeStore";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";

const TRADES_PER_PAGE = 10;

export default function TradingJournal() {
  const { user } = useAuthStore();
  const { trades, isLoading, error } = useTradesData(user?.id || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [sort, setSort] = useState<SortState>({
    field: "date",
    direction: "desc",
  });

  // Get filtered trades
  const filteredTrades = useFilteredTrades(trades, "journal");

  // Calculate derived values for each trade
  const tradesWithCalculatedValues = filteredTrades.map((trade) => ({
    ...trade,
    total: trade.quantity * (trade.entry_price || 0),
    pnl: calculatePnL(trade),
  }));

  // Sort trades
  const sortTrades = (unsortedTrades: Trade[]) => {
    return [...unsortedTrades].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;

      switch (sort.field) {
        case "date":
          return (
            (new Date(a.date).getTime() - new Date(b.date).getTime()) *
            direction
          );
        case "pnl":
          return ((a.pnl || 0) - (b.pnl || 0)) * direction;
        case "quantity":
          return (a.quantity - b.quantity) * direction;
        case "entry_price":
          return (a.entry_price - b.entry_price) * direction;
        case "exit_price":
          return ((a.exit_price || 0) - (b.exit_price || 0)) * direction;
        case "total":
          return ((a.total || 0) - (b.total || 0)) * direction;
        default:
          return (
            String(a[sort.field]).localeCompare(String(b[sort.field])) *
            direction
          );
      }
    });
  };

  const sortedTrades = sortTrades(tradesWithCalculatedValues);
  const totalPages = Math.ceil(sortedTrades.length / TRADES_PER_PAGE);
  const paginatedTrades = sortedTrades.slice(
    (currentPage - 1) * TRADES_PER_PAGE,
    currentPage * TRADES_PER_PAGE,
  );

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleTradeSubmit = async (tradeData: CreateTradeData) => {
    try {
      if (selectedTrade) {
        await useTradeStore.getState().updateTrade(selectedTrade.id, tradeData);
        toast.success("Trade updated successfully");
      } else {
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
      // Force refresh trades
      if (user) {
        await useTradeStore.getState().fetchTrades(user.id, true);
      }
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit trade",
      );
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await useTradeStore.getState().deleteTrade(id);
      toast.success("Trade deleted successfully");
      // Force refresh trades
      if (user) {
        await useTradeStore.getState().fetchTrades(user.id, true);
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete trade",
      );
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

      <div className="space-y-6">
        <FilterBar section="journal" />
        <TradeStats trades={trades} />
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
