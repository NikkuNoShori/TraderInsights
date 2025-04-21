export const UNSUPPORTED_BROKERS = [
  "alpaca",
  "fidelity",
  "questrade",
  "tradestation",
  "tradier",
] as const;

export const BROKER_LIMITATIONS = {
  dataFrequency: "daily",
  dataTypes: ["positions", "orders", "transactions", "balances"],
  isReadOnly: true,
} as const;

export interface BrokerSupport {
  name: string;
  id: string;
  isSupported: boolean;
  reasonIfUnsupported?: string;
  logo?: string;
}

export const SUPPORTED_BROKERS: BrokerSupport[] = [
  {
    name: "TD Ameritrade",
    id: "td_ameritrade",
    isSupported: true,
    logo: "/broker-logos/td-ameritrade.png",
  },
  {
    name: "E*TRADE",
    id: "etrade",
    isSupported: true,
    logo: "/broker-logos/etrade.png",
  },
  {
    name: "Robinhood",
    id: "robinhood",
    isSupported: true,
    logo: "/broker-logos/robinhood.png",
  },
  {
    name: "Webull",
    id: "webull",
    isSupported: true,
    logo: "/broker-logos/webull.png",
  },
  {
    name: "Interactive Brokers",
    id: "interactive_brokers",
    isSupported: true,
    logo: "/broker-logos/interactive-brokers.png",
  },
  {
    name: "Alpaca",
    id: "alpaca",
    isSupported: false,
    reasonIfUnsupported: "Not supported in current plan",
    logo: "/broker-logos/alpaca.png",
  },
  {
    name: "Fidelity",
    id: "fidelity",
    isSupported: false,
    reasonIfUnsupported: "Not supported in current plan",
    logo: "/broker-logos/fidelity.png",
  },
  {
    name: "Questrade",
    id: "questrade",
    isSupported: false,
    reasonIfUnsupported: "Not supported in current plan",
    logo: "/broker-logos/questrade.png",
  },
  {
    name: "TradeStation",
    id: "tradestation",
    isSupported: false,
    reasonIfUnsupported: "Not supported in current plan",
    logo: "/broker-logos/tradestation.png",
  },
  {
    name: "Tradier",
    id: "tradier",
    isSupported: false,
    reasonIfUnsupported: "Not supported in current plan",
    logo: "/broker-logos/tradier.png",
  },
];
