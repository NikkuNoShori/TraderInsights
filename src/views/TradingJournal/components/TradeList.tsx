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
import { useState, useEffect } from "react";
import { TRADE_COLUMNS, TradeColumn } from "./TradeListColumns";
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

  const visibleColumnConfigs = TRADE_COLUMNS.filter((col) =>
    visibleColumns.includes(col.id),
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size === -1 ? "View All" : `${size} per page`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>

      <div className="relative border border-border dark:border-dark-border rounded-lg">
        <div className="w-full overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border">
                    <th className="py-4 px-4 text-center font-medium text-muted-foreground whitespace-nowrap sticky left-0 z-20 bg-inherit">
                      <span className="sr-only">Expand</span>
                    </th>
                    {visibleColumnConfigs.map((column) => (
                      <th
                        key={column.id}
                        className="py-4 px-4 text-center font-medium text-muted-foreground whitespace-nowrap"
                        style={{ minWidth: column.width }}
                      >
                        <button
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() =>
                            column.sortable && onSort(column.id as SortField)
                          }
                          disabled={!column.sortable}
                        >
                          {column.label}
                          {column.sortable && (
                            <span className="relative z-10">
                              {getSortIcon(column.id as SortField)}
                            </span>
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="py-4 px-4 text-center font-medium text-muted-foreground whitespace-nowrap sticky right-0 z-20 bg-inherit">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-dark-border">
                  {trades.map((trade) => (
                    <React.Fragment key={trade.id}>
                      <tr className="bg-card dark:bg-dark-card hover:bg-muted/50 dark:hover:bg-dark-muted/50 transition-colors group">
                        <td className="py-4 px-2 text-center sticky left-0 z-20 bg-card dark:bg-card group-hover:bg-muted/50 dark:group-hover:bg-dark-muted/50 transition-colors">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTradeExpansion(trade.id)}
                            className="h-6 w-6 p-0 mx-auto"
                          >
                            {expandedTrades.has(trade.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        {visibleColumnConfigs.map((column) => {
                          const value =
                            typeof column.accessor === "function"
                              ? column.accessor(trade)
                              : trade[column.accessor];

                          return (
                            <td
                              key={`${trade.id}-${column.id}`}
                              className="py-4 px-4 text-center whitespace-nowrap"
                            >
                              {column.id === "symbol" ? (
                                <Link
                                  to={`/app/journal/${trade.id}`}
                                  className="text-primary hover:underline font-medium"
                                >
                                  {value}
                                </Link>
                              ) : (
                                <TradeCell
                                  columnId={column.id}
                                  trade={trade}
                                  value={value}
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className="py-4 px-4 text-center sticky right-0 z-20 bg-card dark:bg-dark-card group-hover:bg-muted/50 dark:group-hover:bg-dark-muted/50 transition-colors">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(trade.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedTrades.has(trade.id) && (
                        <tr className="border-t border-border dark:border-dark-border bg-muted/50 dark:bg-dark-muted/50">
                          <td
                            colSpan={visibleColumnConfigs.length + 2}
                            className="py-4 px-8"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">
                                  Trade Details
                                </h4>
                                {trade.notes && (
                                  <span className="text-xs text-muted-foreground">
                                    Has Notes
                                  </span>
                                )}
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border dark:border-dark-border">
                                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                                        Order Type
                                      </th>
                                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                                        Date
                                      </th>
                                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                                        Time
                                      </th>
                                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                                        Price
                                      </th>
                                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                                        Quantity
                                      </th>
                                      <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                                        Total
                                      </th>
                                      <th className="text-center py-2 px-4 font-medium text-muted-foreground">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border dark:divide-dark-border">
                                    {/* Buy Order Row */}
                                    <tr>
                                      <td className="py-3 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                          Buy
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        {trade.entry_date || trade.date}
                                      </td>
                                      <td className="py-3 px-4">
                                        {new Date(
                                          trade.entry_date || trade.date,
                                        ).toLocaleTimeString()}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        ${trade.entry_price?.toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        {trade.quantity}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        $
                                        {(
                                          trade.entry_price * trade.quantity
                                        ).toFixed(2)}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onEdit(trade, "buy")}
                                          className="h-6 w-6 p-0 hover:bg-muted dark:hover:bg-dark-muted"
                                        >
                                          <Edit className="h-3 w-3" />
                                          <span className="sr-only">
                                            Edit Buy Order
                                          </span>
                                        </Button>
                                      </td>
                                    </tr>

                                    {/* Sell Order Row */}
                                    {trade.exit_price && (
                                      <tr>
                                        <td className="py-3 px-4">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                            Sell
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          {trade.exit_date || "-"}
                                        </td>
                                        <td className="py-3 px-4">
                                          {trade.exit_date
                                            ? new Date(
                                                trade.exit_date,
                                              ).toLocaleTimeString()
                                            : "-"}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          ${trade.exit_price.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          {trade.quantity}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          $
                                          {(
                                            trade.exit_price * trade.quantity
                                          ).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              onEdit(trade, "sell")
                                            }
                                            className="h-6 w-6 p-0 hover:bg-muted dark:hover:bg-dark-muted"
                                          >
                                            <Edit className="h-3 w-3" />
                                            <span className="sr-only">
                                              Edit Sell Order
                                            </span>
                                          </Button>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot className="border-t border-border dark:border-dark-border">
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="py-3 px-4 font-medium"
                                      >
                                        Performance Summary
                                      </td>
                                      <td
                                        colSpan={4}
                                        className="py-3 px-4 text-right"
                                      >
                                        <div className="space-y-1">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              P/L:
                                            </span>
                                            <span
                                              className={
                                                trade.total >= 0
                                                  ? "text-green-600 dark:text-green-400"
                                                  : "text-red-600 dark:text-red-400"
                                              }
                                            >
                                              ${trade.total?.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              Return:
                                            </span>
                                            <span
                                              className={
                                                trade.total >= 0
                                                  ? "text-green-600 dark:text-green-400"
                                                  : "text-red-600 dark:text-red-400"
                                              }
                                            >
                                              {trade.exit_price
                                                ? `${(((trade.exit_price - trade.entry_price) / trade.entry_price) * 100).toFixed(2)}%`
                                                : "-"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              Fees:
                                            </span>
                                            <span>
                                              $
                                              {trade.fees?.toFixed(2) || "0.00"}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>

                              {trade.notes && (
                                <div className="mt-4 bg-card dark:bg-dark-card rounded-lg p-3 border border-border dark:border-dark-border">
                                  <p className="text-muted-foreground font-medium mb-2">
                                    Notes
                                  </p>
                                  <p className="text-sm">{trade.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {trades.length} out of {trades.length} trades
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
