import { BrokerConfig } from "@/types/broker";

// Core configuration for broker connections through SnapTrade
export const brokerConfig: BrokerConfig = {
  defaultRefreshInterval: 5 * 60 * 1000, // 5 minutes
  maxRefreshInterval: 30 * 60 * 1000, // 30 minutes
  minRefreshInterval: 60 * 1000, // 1 minute
  connectionTimeout: 30 * 1000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// These brokers are supported through SnapTrade's OAuth integration
export const SUPPORTED_BROKERS = [
  {
    name: "TD Ameritrade",
    id: "td_ameritrade",
    logo: "/broker-logos/td-ameritrade.png",
  },
  {
    name: "E*TRADE",
    id: "etrade",
    logo: "/broker-logos/etrade.png",
  },
  {
    name: "Robinhood",
    id: "robinhood",
    logo: "/broker-logos/robinhood.png",
  },
  {
    name: "Webull",
    id: "webull",
    logo: "/broker-logos/webull.png",
  },
  {
    name: "Interactive Brokers",
    id: "interactive_brokers",
    logo: "/broker-logos/interactive-brokers.png",
  },
] as const;

// Broker display information (used for UI)
export const BROKER_METADATA = {
  td_ameritrade: {
    name: "TD Ameritrade",
    logo: "/broker-logos/td-ameritrade.png",
  },
  etrade: {
    name: "E*TRADE",
    logo: "/broker-logos/etrade.png",
  },
  robinhood: {
    name: "Robinhood",
    logo: "/broker-logos/robinhood.png",
  },
  webull: {
    name: "Webull",
    logo: "/broker-logos/webull.png",
  },
  interactive_brokers: {
    name: "Interactive Brokers",
    logo: "/broker-logos/interactive-brokers.png",
  },
} as const;

// Broker list is now dynamically fetched from SnapTrade
// No hardcoded broker configurations needed
