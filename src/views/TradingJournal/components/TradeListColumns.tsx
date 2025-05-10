import { Trade } from "@/types/trade";
import { formatTradeValue } from "@/utils/trade";
import React from "react";

export interface TradeColumn {
  id: keyof Trade | string;
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
    label: "Date",
    accessor: "date",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => value,
  },
  {
    id: "time",
    label: "Time",
    accessor: "time",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => value,
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
  },
  {
    id: "quantity",
    label: "Quantity",
    accessor: "quantity",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => value.toLocaleString(),
  },
  {
    id: "entry_price",
    label: "Entry Price",
    accessor: "entry_price",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "exit_price",
    label: "Exit Price",
    accessor: "exit_price",
    sortable: true,
    defaultVisible: true,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "pnl",
    label: "P&L",
    accessor: "pnl",
    sortable: true,
    defaultVisible: true,
    renderCell: (value, trade) => {
      if (trade.status !== "completed" || value === undefined) return "-";
      return (
        <span className={value > 0 ? "text-green-600" : "text-red-600"}>
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
    renderCell: (value) => value.charAt(0).toUpperCase() + value.slice(1),
  },
  {
    id: "fees",
    label: "Fees",
    accessor: "fees",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "total",
    label: "Total",
    accessor: "total",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "notes",
    label: "Notes",
    accessor: "notes",
    sortable: false,
    defaultVisible: false,
    renderCell: (value) => value || "-",
  },
  {
    id: "risk_amount",
    label: "Risk Amount",
    accessor: "risk_amount",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "take_profit",
    label: "Take Profit",
    accessor: "take_profit",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
  {
    id: "stop_loss",
    label: "Stop Loss",
    accessor: "stop_loss",
    sortable: true,
    defaultVisible: false,
    renderCell: (value) => (value ? formatTradeValue(value) : "-"),
  },
];
