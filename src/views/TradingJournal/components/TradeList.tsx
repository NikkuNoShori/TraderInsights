import { Trade } from "@/types/trade";
import { Button } from "@/components/ui";
import {
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { TRADE_COLUMNS } from "./TradeListColumns";
import { ColumnSelector } from "./ColumnSelector";
import { TradeCell } from "./TradeCell";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortField =
  | "date"
  | "symbol"
  | "side"
  | "quantity"
  | "entry_price"
  | "exit_price"
  | "pnl"
  | "status"
  | "fees"
  | "total"
  | "risk_amount"
  | "take_profit"
  | "stop_loss";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface TradeListProps {
  trades: Trade[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (trade: Trade, orderType: "buy" | "sell") => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (size: number) => void;
  sort: SortState;
  onSort: (field: SortField) => void;
}

export function TradeList({
  trades,
  isLoading,
  onDelete,
  onEdit,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  sort,
  onSort,
}: TradeListProps) {
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    TRADE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.id),
  );

  const toggleTradeExpansion = (tradeId: string) => {
    const newExpanded = new Set(expandedTrades);
    if (newExpanded.has(tradeId)) {
      newExpanded.delete(tradeId);
    } else {
      newExpanded.add(tradeId);
    }
    setExpandedTrades(newExpanded);
  };

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      }
      return [...prev, columnId];
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field)
      return <ArrowUpDown className="h-4 w-4 inline-block ml-1 opacity-50" />;
    return sort.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline-block ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No trades found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" className="w-[70px]">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size === -1 ? "All" : size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-default">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-[40px] px-4 py-3"></th>
              {TRADE_COLUMNS.filter((col) => visibleColumns.includes(col.id)).map(
                (column) => (
                  <th
                    key={column.id}
                    className="px-4 py-3 text-left text-sm font-medium text-muted"
                  >
                    <button
                      className="flex items-center gap-1"
                      onClick={() => onSort(column.id as SortField)}
                    >
                      {column.label}
                      {getSortIcon(column.id as SortField)}
                    </button>
                  </th>
                )
              )}
              <th className="w-[100px] px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <React.Fragment key={trade.id}>
                <tr className="border-b bg-card hover:bg-card-hover">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleTradeExpansion(trade.id)}
                      className="p-1 hover:bg-muted rounded-md"
                    >
                      {expandedTrades.has(trade.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  {TRADE_COLUMNS.filter((col) =>
                    visibleColumns.includes(col.id)
                  ).map((column) => (
                    <td key={column.id} className="px-4 py-3">
                      <TradeCell
                        columnId={column.id}
                        trade={trade}
                        value={
                          typeof column.accessor === "function"
                            ? column.accessor(trade)
                            : trade[column.accessor]
                        }
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(trade, "buy")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(trade.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedTrades.has(trade.id) && (
                  <tr className="border-b bg-muted/30">
                    <td colSpan={visibleColumns.length + 2}>
                      <div className="px-4 py-3 space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium">Entry Details</div>
                            <div className="text-sm">
                              Date: {trade.entry_date} {trade.entry_time}
                              <br />
                              Price: ${trade.entry_price}
                            </div>
                          </div>
                          {trade.exit_date && (
                            <div>
                              <div className="text-sm font-medium">Exit Details</div>
                              <div className="text-sm">
                                Date: {trade.exit_date} {trade.exit_time}
                                <br />
                                Price: ${trade.exit_price}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">Risk Management</div>
                            <div className="text-sm">
                              Stop Loss: ${trade.stop_loss || "N/A"}
                              <br />
                              Take Profit: ${trade.take_profit || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Additional Info</div>
                            <div className="text-sm">
                              Fees: ${trade.fees || "0"}
                              <br />
                              Notes: {trade.notes || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Link
                            to={`/app/journal/${trade.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize !== -1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {trades.length} of {totalPages * pageSize} trades
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || pageSize === -1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || pageSize === -1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
