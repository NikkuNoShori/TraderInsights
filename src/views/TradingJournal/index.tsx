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
import { useFilteredTrades } from "@/hooks/useFilteredTrades";

const TRADES_PER_PAGE = 10;

export default function TradingJournal() {
  const { user } = useAuthStore();
  const { trades, isLoading, fetchTrades, addTrade, updateTrade, deleteTrade } =
    useTradeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<"buy" | "sell" | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
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
      const now = new Date().toISOString();
      const completeTradeData = {
        ...tradeData,
        created_at: selectedTrade?.created_at || now,
        updated_at: now,
      };

      if (selectedTrade) {
        await updateTrade(selectedTrade.id, completeTradeData);
        toast.success("Trade updated successfully");
      } else {
        await addTrade(completeTradeData);
        toast.success("Trade added successfully");
      }
      if (user) {
        await fetchTrades(user.id);
      }
      setIsModalOpen(false);
      setSelectedTrade(null);
      setSelectedOrderType(undefined);
    } catch (error) {
      console.error("Error submitting trade:", error);
      toast.error(
        selectedTrade ? "Failed to update trade" : "Failed to add trade",
      );
    }
  };

  const handleEditTrade = (trade: Trade, orderType: "buy" | "sell") => {
    setSelectedTrade(trade);
    setSelectedOrderType(orderType);
    setIsModalOpen(true);
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
      toast.error("Failed to delete trade");
    }
  };

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
          setSelectedOrderType(undefined);
        }}
        onSubmit={handleTradeSubmit}
        initialData={selectedTrade || undefined}
        mode={selectedTrade ? "edit" : "add"}
        orderType={selectedOrderType}
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
