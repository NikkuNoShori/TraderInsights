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

const TRADE_DETAILS_COLUMNS = [
  { id: 'order_type', label: 'Order Type', defaultVisible: true },
  { id: 'date', label: 'Date', defaultVisible: true },
  { id: 'time', label: 'Time', defaultVisible: true },
  { id: 'symbol', label: 'Symbol', defaultVisible: true },
  { id: 'side', label: 'Side', defaultVisible: true },
  { id: 'price', label: 'Price', defaultVisible: true },
  { id: 'quantity', label: 'Quantity', defaultVisible: true },
  { id: 'total', label: 'Total', defaultVisible: true },
  { id: 'stop_loss', label: 'Stop Loss', defaultVisible: true },
  { id: 'take_profit', label: 'Take Profit', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true },
] as const;

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
  const [visibleDetailColumns, setVisibleDetailColumns] = useState<string[]>(
    TRADE_DETAILS_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.id),
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

  const handleDetailColumnToggle = (columnId: string) => {
    setVisibleDetailColumns((prev) => {
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
      <div className="flex justify-end">
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>

      <div className="rounded-lg border border-border/40 overflow-hidden bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="w-[40px] px-4 py-3"></th>
                {TRADE_COLUMNS.filter((col) => visibleColumns.includes(col.id)).map(
                  (column) => (
                    <th
                      key={column.id}
                      className="px-2 py-3 text-center text-sm font-medium text-muted-foreground/70"
                    >
                      <button
                        className="flex items-center justify-center w-full gap-1 hover:text-foreground transition-colors"
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
                  <tr className="border-b border-border/40 bg-transparent hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleTradeExpansion(trade.id)}
                        className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        {expandedTrades.has(trade.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground/70" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                        )}
                      </button>
                    </td>
                    {TRADE_COLUMNS.filter((col) =>
                      visibleColumns.includes(col.id)
                    ).map((column) => (
                      <td key={column.id} className={`px-2 py-3 text-center ${column.id === 'date' ? 'whitespace-nowrap min-w-[120px]' : ''}`}>
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
                          className="text-muted-foreground/70 hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(trade.id)}
                          className="text-muted-foreground/70 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedTrades.has(trade.id) && (
                    <tr className="border-b border-border/40 bg-muted/10">
                      <td colSpan={visibleColumns.length + 2}>
                        <div className="px-4 py-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-foreground/90">Trade Details</h3>
                            <ColumnSelector
                              visibleColumns={visibleDetailColumns}
                              onColumnToggle={handleDetailColumnToggle}
                              columns={TRADE_DETAILS_COLUMNS}
                              buttonText="Detail Columns"
                              iconOnly
                            />
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm table-fixed">
                              <thead>
                                <tr className="bg-muted/20 border-y border-border/40">
                                  {TRADE_DETAILS_COLUMNS.filter((col) => 
                                    visibleDetailColumns.includes(col.id)
                                  ).map((column) => (
                                    <th
                                      key={column.id}
                                      className="text-center py-2 px-2 font-medium text-muted-foreground whitespace-nowrap"
                                    >
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                <tr className="border-b border-border/30 bg-card/30">
                                  {TRADE_DETAILS_COLUMNS.filter((col) => 
                                    visibleDetailColumns.includes(col.id)
                                  ).map((column) => {
                                    switch (column.id) {
                                      case 'order_type':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                            <span className="text-emerald-500 font-medium">Buy</span>
                                          </td>
                                        );
                                      case 'date':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.entry_date}
                                          </td>
                                        );
                                      case 'time':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.entry_time}
                                          </td>
                                        );
                                      case 'symbol':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.symbol}
                                          </td>
                                        );
                                      case 'side':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                            <span className={`${trade.side === "Long" ? "text-emerald-500" : "text-rose-500"} font-medium`}>
                                              {trade.side}
                                            </span>
                                          </td>
                                        );
                                      case 'price':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            ${Number(trade.entry_price).toFixed(2)}
                                          </td>
                                        );
                                      case 'quantity':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.quantity}
                                          </td>
                                        );
                                      case 'total':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            ${Number(trade.entry_price * trade.quantity).toLocaleString(undefined, {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2
                                            })}
                                          </td>
                                        );
                                      case 'stop_loss':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.stop_loss ? `$${Number(trade.stop_loss).toFixed(2)}` : "N/A"}
                                          </td>
                                        );
                                      case 'take_profit':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center text-muted-foreground font-normal whitespace-nowrap">
                                            {trade.take_profit ? `$${Number(trade.take_profit).toFixed(2)}` : "N/A"}
                                          </td>
                                        );
                                      case 'actions':
                                        return (
                                          <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(trade, "buy")}
                                                className="text-muted-foreground/70 hover:text-foreground"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(trade.id)}
                                                className="text-muted-foreground/70 hover:text-destructive"
                                              >
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </td>
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                </tr>
                                {trade.exit_price && (
                                  <tr className="bg-transparent">
                                    {TRADE_DETAILS_COLUMNS.filter((col) => 
                                      visibleDetailColumns.includes(col.id)
                                    ).map((column) => {
                                      switch (column.id) {
                                        case 'order_type':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                              <span className="text-rose-500 font-semibold">Sell</span>
                                            </td>
                                          );
                                        case 'date':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.exit_date}
                                            </td>
                                          );
                                        case 'time':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.exit_time}
                                            </td>
                                          );
                                        case 'symbol':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.symbol}
                                            </td>
                                          );
                                        case 'side':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                              <span className={trade.side === "Long" ? "text-emerald-500" : "text-rose-500"}>
                                                {trade.side}
                                              </span>
                                            </td>
                                          );
                                        case 'price':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              ${Number(trade.exit_price).toFixed(2)}
                                            </td>
                                          );
                                        case 'quantity':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.quantity}
                                            </td>
                                          );
                                        case 'total':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              ${(trade.exit_price ? Number(trade.exit_price * trade.quantity) : 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                              })}
                                            </td>
                                          );
                                        case 'stop_loss':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.stop_loss ? `$${Number(trade.stop_loss).toFixed(2)}` : "N/A"}
                                            </td>
                                          );
                                        case 'take_profit':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                              {trade.take_profit ? `$${Number(trade.take_profit).toFixed(2)}` : "N/A"}
                                            </td>
                                          );
                                        case 'actions':
                                          return (
                                            <td key={column.id} className="py-2 px-2 text-center whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => onEdit(trade, "sell")}
                                                  className="text-muted-foreground/70 hover:text-foreground"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => onDelete(trade.id)}
                                                  className="text-muted-foreground/70 hover:text-destructive"
                                                >
                                                  <Trash className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </td>
                                          );
                                        default:
                                          return null;
                                      }
                                    })}
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex justify-end">
                            <Link
                              to={`/app/journal/${trade.id}`}
                              className="text-sm text-primary hover:text-primary/90 transition-colors hover:underline"
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
      </div>

      <div className="flex items-center justify-between">
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
