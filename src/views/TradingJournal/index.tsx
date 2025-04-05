import { useState } from "@/lib/react";
import { toast } from "react-hot-toast";
import { Trade } from "@/types/trade";
import { TradeList } from "./components/TradeList";
import { FilterBar } from "@/components/trades/FilterBar";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import {
  SortField,
  SortState,
} from "./components/TradeList";
import { TradeStats } from "./components/TradeStats";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { CreateTradeData } from "@/types/trade";
import { TradeModal } from "@/components/trades/TradeModal";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { calculatePnL } from "@/utils/trade";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [25, 50, 100, -1] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

export default function TradingJournal() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trades, isLoading, fetchTrades, addTrade, updateTrade, deleteTrade } =
    useTradeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<
    "buy" | "sell" | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState>({
    field: "date",
    direction: "desc",
  });

  // Get filtered trades
  const filteredTrades = useFilteredTrades(trades);

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
  const totalPages =
    pageSize === -1 ? 1 : Math.ceil(sortedTrades.length / pageSize);

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize as PageSize);
    setCurrentPage(1); // Reset to first page when changing page size
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

  // Redirect to Trade Hub with manual entry tab active
  const handleAddTradeClick = () => {
    navigate('/app/trade-hub', { state: { activeTab: 'manual-entry' } });
  };

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Trading Journal</h1>
        <div className="flex items-center gap-2">
          <FilterBar />
          <Button
            onClick={handleAddTradeClick}
            className="bg-primary/90 text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <TradeStats trades={tradesWithCalculatedValues} />
        <TradeList
          trades={sortedTrades}
          isLoading={isLoading}
          onDelete={handleDeleteTrade}
          onEdit={handleEditTrade}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={handlePageSizeChange}
          sort={sort}
          onSort={handleSort}
        />
      </div>

      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTrade || undefined}
        mode={selectedTrade ? "edit" : "add"}
        orderType={selectedOrderType}
        onSubmit={handleTradeSubmit}
      />
    </div>
  );
}
