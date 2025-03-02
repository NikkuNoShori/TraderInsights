import { Trade } from "@/types/trade";
import { Button } from "@/components/ui";
import { Edit, Trash, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { TRADE_COLUMNS, TradeColumn } from "./TradeListColumns";
import { ColumnSelector } from "./ColumnSelector";

export type SortField = 'date' | 'symbol' | 'side' | 'quantity' | 'entry_price' | 'exit_price' | 'pnl' | 'status' | 'fees' | 'total' | 'risk_amount' | 'take_profit' | 'stop_loss';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface TradeListProps {
  trades: Trade[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
  sort,
  onSort,
}: TradeListProps) {
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    TRADE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
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
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      }
      return [...prev, columnId];
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4 inline-block ml-1 opacity-50" />;
    return sort.direction === 'asc' ? (
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

  const visibleColumnConfigs = TRADE_COLUMNS.filter(col => visibleColumns.includes(col.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnSelector visibleColumns={visibleColumns} onColumnToggle={handleColumnToggle} />
      </div>
      
      <div className="rounded-lg border border-border dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted dark:bg-dark-muted border-b-2 border-border dark:border-dark-border">
                <th className="text-center py-4 px-2 font-medium w-8"></th>
                {visibleColumnConfigs.map(column => (
                  <th
                    key={column.id}
                    className="text-center py-4 px-4 font-medium cursor-pointer hover:bg-muted/50 dark:hover:bg-dark-muted/50 transition-colors"
                    onClick={() => column.sortable && onSort(column.id as SortField)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {column.sortable && getSortIcon(column.id as SortField)}
                    </span>
                  </th>
                ))}
                <th className="text-center py-4 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {trades.map((trade) => (
                <>
                  <tr
                    key={trade.id}
                    className="bg-card dark:bg-dark-card hover:bg-muted dark:hover:bg-dark-muted transition-colors"
                  >
                    <td className="py-4 px-2 text-center">
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
                    {visibleColumnConfigs.map(column => {
                      const value = typeof column.accessor === 'function' 
                        ? column.accessor(trade)
                        : trade[column.accessor];
                      
                      return (
                        <td key={column.id} className="py-4 px-4 text-center">
                          {column.id === 'symbol' ? (
                            <Link
                              to={`/app/journal/${trade.id}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {value}
                            </Link>
                          ) : column.renderCell ? (
                            column.renderCell(value, trade)
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(trade)}
                          className="h-8 w-8 p-0 hover:bg-muted dark:hover:bg-dark-muted"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
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
                      <td colSpan={visibleColumnConfigs.length + 2} className="py-4 px-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Trade Details</h4>
                            <span className="text-xs text-muted-foreground">
                              {trade.notes ? 'Has Notes' : 'No Notes'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div className="bg-card dark:bg-dark-card rounded-lg p-3 border border-border dark:border-dark-border">
                              <p className="text-muted-foreground font-medium mb-2">Entry</p>
                              <p>Date: {trade.entry_date || trade.date}</p>
                              <p>Price: ${trade.entry_price?.toFixed(2)}</p>
                            </div>
                            <div className="bg-card dark:bg-dark-card rounded-lg p-3 border border-border dark:border-dark-border">
                              <p className="text-muted-foreground font-medium mb-2">Exit</p>
                              <p>Date: {trade.exit_date || '-'}</p>
                              <p>Price: {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}</p>
                            </div>
                            <div className="bg-card dark:bg-dark-card rounded-lg p-3 border border-border dark:border-dark-border">
                              <p className="text-muted-foreground font-medium mb-2">Performance</p>
                              <p>Total: ${trade.total?.toFixed(2)}</p>
                              <p>Fees: ${trade.fees?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          {trade.notes && (
                            <div className="bg-card dark:bg-dark-card rounded-lg p-3 border border-border dark:border-dark-border mt-4">
                              <p className="text-muted-foreground font-medium mb-2">Notes</p>
                              <p className="text-sm">{trade.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center py-4 gap-2 border-t border-border dark:border-dark-border bg-card dark:bg-dark-card">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="py-2 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
        </div>
      )}
      </div>
    </div>
  );
}
