import { Trade } from "@/types/trade";
import { TRADE_COLUMNS } from "./TradeListColumns";
import { cn } from "@/lib/utils";

interface TradeCellProps {
  columnId: string;
  trade: Trade;
  value: any;
}

export function TradeCell({ columnId, trade, value }: TradeCellProps) {
  const column = TRADE_COLUMNS.find((col) => col.id === columnId);
  if (!column) return null;

  // If the column has a custom render function, use it
  if (column.renderCell) {
    return <div>{column.renderCell(value, trade)}</div>;
  }

  // Default rendering based on column type
  switch (columnId) {
    case "date":
      return (
        <span className="font-medium">
          {value}
        </span>
      );

    case "time":
      return (
        <span className="font-medium text-muted-foreground">
          {value}
        </span>
      );

    case "broker_id":
      return (
        <span className="inline-block px-2 py-1 rounded-md text-sm font-medium bg-muted/50 text-muted-foreground">
          {value || "-"}
        </span>
      );

    case "side":
      return (
        <span
          className={cn(
            "inline-block px-2 py-1 rounded-md text-sm font-medium",
            value === "Long"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          )}
        >
          {value}
        </span>
      );

    case "quantity":
      return <span className="font-medium">{value?.toLocaleString()}</span>;

    case "entry_price":
    case "exit_price":
    case "take_profit":
    case "stop_loss":
      return <span className="font-medium">{value || "-"}</span>;

    case "pnl":
      if (trade.status !== "closed" || value === undefined) {
        return <span>-</span>;
      }
      return (
        <span
          className={cn(
            "font-medium",
            value > 0
              ? "text-green-600 dark:text-green-400"
              : value < 0
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground",
          )}
        >
          {value > 0 ? "+" : ""}
          {value}
        </span>
      );

    case "status":
      return (
        <span
          className={cn(
            "inline-block px-2 py-1 rounded-md text-sm font-medium",
            value === "closed"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          )}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );

    case "fees":
    case "risk_amount":
      return (
        <span className="font-medium text-muted-foreground">
          {value || "-"}
        </span>
      );

    case "total":
      return <span className="font-medium">{value || "-"}</span>;

    case "notes":
      return (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {value || "-"}
        </span>
      );

    default:
      return <span>{value}</span>;
  }
}
