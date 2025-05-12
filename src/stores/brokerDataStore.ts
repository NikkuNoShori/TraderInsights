import { create } from "zustand";
import { snapTradeClient, SnapTradeClient } from "@/lib/snaptrade/client";
import { createDebugLogger } from "./debugStore";

const logger = createDebugLogger("broker");

// Helper function to ensure we have a valid SnapTrade client
const getSnapTradeClient = () => {
  // If the global client is already initialized, use it
  if (snapTradeClient && snapTradeClient.accountInformation) {
    return snapTradeClient;
  }

  // Otherwise, check if we can initialize it from environment variables
  try {
    const clientId =
      typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_SNAPTRADE_CLIENT_ID || ""
        : process.env.VITE_SNAPTRADE_CLIENT_ID || "";
    const consumerKey =
      typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY || ""
        : process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";

    if (!clientId || !consumerKey) {
      logger.error("Missing SnapTrade credentials in environment variables");
      return null;
    }

    // Create a new client instance
    return new SnapTradeClient({ clientId, consumerKey });
  } catch (error) {
    logger.error("Error initializing SnapTrade client:", error);
    return null;
  }
};

export type AccountPosition = {
  id: string;
  symbol: string;
  symbolId: string;
  openQuantity: number;
  currentMarketValue: number;
  currentPrice: number;
  averageEntryPrice: number;
  closedPnl: number;
  openPnl: number;
  totalCost: number;
  dayPnl: number;
  dayPnlPercent: number;
  currency: string;
};

export type AccountBalance = {
  currency: string;
  cash: number;
  marketValue: number;
  totalEquity: number;
  buyingPower: number;
};

export type AccountOrder = {
  id: string;
  symbol: string;
  symbolId: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "FILLED"
    | "REJECTED"
    | "CANCELED"
    | "PARTIAL";
  action: string;
  totalQuantity: number;
  openQuantity: number;
  filledQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
  orderType: string;
  timeInForce: string;
  createdAt: string;
  updatedAt: string;
};

export type BrokerAccount = {
  id: string;
  name: string;
  number: string;
  type: string;
  status: string;
  brokerageId: string;
  brokerageName: string;
};

interface BrokerDataState {
  accounts: BrokerAccount[];
  selectedAccountId: string | null;
  positions: Record<string, AccountPosition[]>;
  balances: Record<string, AccountBalance[]>;
  orders: Record<string, AccountOrder[]>;
  isLoading: boolean;
  error: string | null;
}

interface BrokerDataActions {
  setAccounts: (accounts: BrokerAccount[]) => void;
  selectAccount: (accountId: string) => void;
  setPositions: (accountId: string, positions: AccountPosition[]) => void;
  setBalances: (accountId: string, balances: AccountBalance[]) => void;
  setOrders: (accountId: string, orders: AccountOrder[]) => void;
  fetchAccounts: (userId: string, userSecret: string) => Promise<void>;
  fetchAccountData: (
    accountId: string,
    userId: string,
    userSecret: string
  ) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type BrokerDataStore = BrokerDataState & BrokerDataActions;

const initialState: BrokerDataState = {
  accounts: [],
  selectedAccountId: null,
  positions: {},
  balances: {},
  orders: {},
  isLoading: false,
  error: null,
};

export const useBrokerDataStore = create<BrokerDataStore>((set, get) => ({
  ...initialState,

  setAccounts: (accounts) => set({ accounts }),

  selectAccount: (accountId) => set({ selectedAccountId: accountId }),

  setPositions: (accountId, positions) =>
    set((state) => ({
      positions: { ...state.positions, [accountId]: positions },
    })),

  setBalances: (accountId, balances) =>
    set((state) => ({
      balances: { ...state.balances, [accountId]: balances },
    })),

  setOrders: (accountId, orders) =>
    set((state) => ({ orders: { ...state.orders, [accountId]: orders } })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  fetchAccounts: async (userId, userSecret) => {
    const { setLoading, setError, setAccounts, selectAccount } = get();

    if (get().isLoading) return;

    try {
      setLoading(true);
      setError(null);

      logger.info("Fetching accounts for user");

      // Use our server proxy instead of direct SDK for consistency
      try {
        // Use GET request with credentials in query parameters - aligned with proxy handling
        const clientId =
          typeof import.meta !== "undefined" && import.meta.env
            ? import.meta.env.VITE_SNAPTRADE_CLIENT_ID || ""
            : process.env.VITE_SNAPTRADE_CLIENT_ID || "";

        if (!clientId) {
          logger.warn("Missing clientId for accounts request");
        }

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const queryParams = new URLSearchParams({
          userId,
          userSecret,
          clientId,
          timestamp,
        });

        logger.info(
          "Making GET request to accounts endpoint with credentials in query params"
        );

        // Use the direct endpoint we registered in the router
        const apiUrl = `/api/snaptrade/accounts?${queryParams.toString()}`;
        logger.info(`Accounts request URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          // If GET fails, try alternative approach with SDK
          throw new Error(`Failed to fetch accounts: ${response.status}`);
        }

        const accountsData = await response.json();

        const accounts = accountsData.map((account: any) => ({
          id: account.id || "",
          name: account.name || "",
          number: account.number || "",
          type: account.type || "",
          status: account.status || "",
          brokerageId: account.brokerage?.id || "",
          brokerageName: account.brokerage?.name || "",
        }));

        setAccounts(accounts);

        if (accounts.length > 0 && !get().selectedAccountId) {
          selectAccount(accounts[0].id);
        }

        logger.info(`Found ${accounts.length} accounts`);
      } catch (proxyError) {
        // If the proxy fails, try a different approach
        logger.error(
          "Proxy account fetch failed, trying direct SDK",
          proxyError
        );

        try {
          // Get a valid client
          const client = getSnapTradeClient();

          // Check if client is available
          if (!client || !client.accountInformation) {
            logger.error(
              "SnapTrade client not initialized or accountInformation not available"
            );
            throw new Error("SnapTrade client initialization failed");
          }

          const response = await client.accountInformation.listUserAccounts({
            userId,
            userSecret,
          });

          const accounts = response.data.map((account) => ({
            id: account.id || "",
            name: account.name || "",
            number: account.number || "",
            type: account.type || "",
            status: account.status || "",
            brokerageId: account.brokerage?.id || "",
            brokerageName: account.brokerage?.name || "",
          }));

          setAccounts(accounts);

          if (accounts.length > 0 && !get().selectedAccountId) {
            selectAccount(accounts[0].id);
          }

          logger.info(`Found ${accounts.length} accounts via SDK`);
        } catch (sdkError) {
          logger.error("SDK account fetch also failed", sdkError);
          throw new Error(
            "Failed to fetch accounts via SDK: " +
              (sdkError instanceof Error ? sdkError.message : String(sdkError))
          );
        }
      }
    } catch (error) {
      logger.error("Error fetching accounts:", error);
      setError(
        "Failed to fetch accounts. Please try connecting your broker again."
      );
    } finally {
      setLoading(false);
    }
  },

  fetchAccountData: async (accountId, userId, userSecret) => {
    const { setLoading, setError, setPositions, setBalances, setOrders } =
      get();

    if (get().isLoading) return;

    try {
      setLoading(true);
      setError(null);

      logger.info(`Fetching data for account ${accountId}`);

      try {
        // Get client ID and prepare common query parameters
        const clientId =
          typeof import.meta !== "undefined" && import.meta.env
            ? import.meta.env.VITE_SNAPTRADE_CLIENT_ID || ""
            : process.env.VITE_SNAPTRADE_CLIENT_ID || "";

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const queryParams = new URLSearchParams({
          userId,
          userSecret,
          clientId,
          timestamp
        });

        // Fetch positions using GET with query parameters
        logger.info("Fetching positions via direct endpoint");
        const positionsUrl = `/api/snaptrade/accounts/${accountId}/positions?${queryParams.toString()}`;
        
        const positionsResponse = await fetch(positionsUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!positionsResponse.ok) {
          throw new Error(
            `Failed to fetch positions: ${positionsResponse.status}`
          );
        }

        const positionsData = await positionsResponse.json();

        // Process positions data
        const positions: AccountPosition[] = [];
        for (const position of positionsData || []) {
          const symbolStr =
            typeof position.symbol === "object" &&
            position.symbol &&
            typeof position.symbol.symbol === "string"
              ? position.symbol.symbol
              : "";

          const symbolId =
            typeof position.symbol === "object" &&
            position.symbol &&
            typeof position.symbol.id === "string"
              ? position.symbol.id
              : "";

          const currency =
            typeof position.symbol === "object" &&
            position.symbol &&
            typeof position.symbol.currency === "object" &&
            position.symbol.currency &&
            typeof position.symbol.currency.code === "string"
              ? position.symbol.currency.code
              : "";

          positions.push({
            id: position.id || "",
            symbol: symbolStr,
            symbolId,
            openQuantity: parseFloat(position.units || "0"),
            currentMarketValue: parseFloat(position.currentMarketValue || "0"),
            currentPrice: parseFloat(position.currentPrice || "0"),
            averageEntryPrice: parseFloat(position.averageEntryPrice || "0"),
            closedPnl: parseFloat(position.closedPnl || "0"),
            openPnl: parseFloat(position.openPnl || "0"),
            totalCost: parseFloat(position.totalCost || "0"),
            dayPnl: parseFloat(position.dayPnl || "0"),
            dayPnlPercent: parseFloat(position.dayPnlPercent || "0"),
            currency,
          });
        }

        setPositions(accountId, positions);
        logger.info(
          `Found ${positions.length} positions for account ${accountId}`
        );

        // Now fetch balances with the same approach
        logger.info("Fetching balances");
        const balancesUrl = `/api/snaptrade/accounts/${accountId}/balances?${queryParams.toString()}`;

        const balancesResponse = await fetch(balancesUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!balancesResponse.ok) {
          throw new Error(
            `Failed to fetch balances: ${balancesResponse.status}`
          );
        }

        const balancesData = await balancesResponse.json();

        // Process balances
        const balances: AccountBalance[] = balancesData.map((balance: any) => ({
          currency: balance.currency?.code || "USD",
          cash: parseFloat(balance.cash || "0"),
          marketValue: parseFloat(balance.marketValue || "0"),
          totalEquity: parseFloat(balance.totalEquity || "0"),
          buyingPower: parseFloat(balance.buyingPower || "0"),
        }));

        setBalances(accountId, balances);
        logger.info(
          `Found ${balances.length} balance records for account ${accountId}`
        );

        // Finally fetch orders
        logger.info("Fetching orders");
        const ordersUrl = `/api/snaptrade/accounts/${accountId}/orders?${queryParams.toString()}`;

        const ordersResponse = await fetch(ordersUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!ordersResponse.ok) {
          throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
        }

        const ordersData = await ordersResponse.json();

        // Process orders
        const orders: AccountOrder[] = [];
        for (const order of ordersData || []) {
          const symbolStr =
            typeof order.symbol === "object" &&
            order.symbol &&
            typeof order.symbol.symbol === "string"
              ? order.symbol.symbol
              : "";

          const symbolId =
            typeof order.symbol === "object" &&
            order.symbol &&
            typeof order.symbol.id === "string"
              ? order.symbol.id
              : "";

          orders.push({
            id: order.id || "",
            symbol: symbolStr,
            symbolId,
            status: order.status || "PENDING",
            action: order.action || "",
            totalQuantity: parseFloat(order.totalQuantity || "0"),
            openQuantity: parseFloat(order.openQuantity || "0"),
            filledQuantity: parseFloat(order.filledQuantity || "0"),
            limitPrice: order.limitPrice
              ? parseFloat(order.limitPrice)
              : undefined,
            stopPrice: order.stopPrice
              ? parseFloat(order.stopPrice)
              : undefined,
            orderType: order.orderType || "",
            timeInForce: order.timeInForce || "",
            createdAt: order.createdAt || "",
            updatedAt: order.updatedAt || "",
          });
        }

        setOrders(accountId, orders);
        logger.info(`Found ${orders.length} orders for account ${accountId}`);
      } catch (error) {
        logger.error("Error fetching account data:", error);
        setError(`Failed to fetch account data: ${error instanceof Error ? error.message : String(error)}`);
        
        // Try SDK fallback or fail
      }
    } catch (error) {
      logger.error(`Error fetching data for account ${accountId}:`, error);
      setError(
        `Failed to fetch data for account ${accountId}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  },
}));
