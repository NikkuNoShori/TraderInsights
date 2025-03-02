import { Trade } from "@/types/trade";
import { formatTradeValue } from "@/utils/trade";
import { format } from "date-fns";

export interface TradeColumn {
  id: string;
  label: string;
  accessor: keyof Trade | ((trade: Trade) => any);
  sortable: boolean;
  defaultVisible: boolean;
  width?: string;
  renderCell?: (value: any, trade: Trade) => React.ReactNode;
}

export const TRADE_COLUMNS: TradeColumn[] = [
  {
    id: "date",
    label: "Date/Time",
    accessor: "date",
    sortable: true,
    defaultVisible: true,
    renderCell: (value, trade) => {
      const dateObj = new Date(`${trade.date}T${trade.time}`);
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {format(dateObj, "MMM d, yyyy")}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(dateObj, "HH:mm:ss")}
          </span>
        </div>
      );
    },
  },
  {
    id: "symbol",
    label: "Symbol",
    accessor: "symbol",
    sortable: true,
    defaultVisible: true,
  },
  {
    id: "side",
    label: "Side",
    accessor: "side",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (
      <span
        className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
          value === "Long"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    id: "quantity",
    label: "Quantity",
    accessor: "quantity",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (
      <span className="font-medium">{value.toLocaleString()}</span>
    ),
  },
  {
    id: "entry_price",
    label: "Entry Price",
    accessor: "entry_price",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (
      <span className="font-medium">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "exit_price",
    label: "Exit Price",
    accessor: "exit_price",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (
      <span className="font-medium">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "pnl",
    label: "P&L",
    accessor: "pnl",
    sortable: true,
    defaultVisible: true,
    renderCell: (value, trade) => {
      if (trade.status !== "closed" || value === undefined) return "-";
      return (
        <span
          className={`font-medium ${
            value > 0
              ? "text-green-600 dark:text-green-400"
              : value < 0
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
          }`}
        >
          {value > 0 ? "+" : ""}
          {formatTradeValue(value)}
        </span>
      );
    },
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (
      <span
        className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
          value === "closed"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
  {
    id: "fees",
    label: "Fees",
    accessor: "fees",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="font-medium text-muted-foreground">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "total",
    label: "Total",
    accessor: "total",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="font-medium">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "notes",
    label: "Notes",
    accessor: "notes",
    sortable: false,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {value || "-"}
      </span>
    ),
  },
  {
    id: "risk_amount",
    label: "Risk Amount",
    accessor: "risk_amount",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="font-medium text-muted-foreground">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "take_profit",
    label: "Take Profit",
    accessor: "take_profit",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="font-medium">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
  {
    id: "stop_loss",
    label: "Stop Loss",
    accessor: "stop_loss",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (
      <span className="font-medium">
        {value ? formatTradeValue(value) : "-"}
      </span>
    ),
  },
]; 