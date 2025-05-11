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
        // Use POST request with credentials in body - more reliable for SnapTrade
        const apiUrl = `/api/snaptrade/proxy/accounts`;
        logger.info("Using server-side proxy for accounts with POST method");

        // Include clientId, userId and userSecret in the request body
        const clientId =
          typeof import.meta !== "undefined" && import.meta.env
            ? import.meta.env.VITE_SNAPTRADE_CLIENT_ID || ""
            : process.env.VITE_SNAPTRADE_CLIENT_ID || "";

        if (!clientId) {
          logger.warn("Missing clientId for accounts request");
        }

        logger.info(
          "Making POST request to accounts endpoint with credentials in body"
        );
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            userSecret,
            clientId,
            timestamp: Date.now(),
          }),
        });

        if (!response.ok) {
          // If POST fails, try alternative approach with SDK
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
        // Fetch positions using POST with proxy
        logger.info("Fetching positions via proxy");
        const positionsResponse = await fetch(
          `/api/snaptrade/proxy/accounts/${accountId}/positions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              userSecret,
              timestamp: Date.now(),
            }),
          }
        );

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
            symbolId: symbolId,
            openQuantity: position.units || 0,
            currentMarketValue: position.marketValue || 0,
            currentPrice: position.price || 0,
            averageEntryPrice: position.averageEntryPrice || 0,
            closedPnl: position.closedPnl || 0,
            openPnl: position.openPnl || 0,
            totalCost: position.totalCost || 0,
            dayPnl: position.dayPnl || 0,
            dayPnlPercent: position.dayPnlPercent || 0,
            currency: currency,
          });
        }

        // Fetch balances using POST with proxy
        logger.info("Fetching balances via proxy");
        const balancesResponse = await fetch(
          `/api/snaptrade/proxy/accounts/${accountId}/balances`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              userSecret,
              timestamp: Date.now(),
            }),
          }
        );

        if (!balancesResponse.ok) {
          throw new Error(
            `Failed to fetch balances: ${balancesResponse.status}`
          );
        }

        const balancesData = await balancesResponse.json();

        // Process balances data
        const balances = (balancesData || []).map((balance: any) => ({
          currency: balance.currency?.code || "",
          cash: balance.cash || 0,
          marketValue: balance.marketValue || 0,
          totalEquity: balance.totalValue || 0,
          buyingPower: balance.buyingPower || 0,
        }));

        // Set the data in the store
        setPositions(accountId, positions);
        setBalances(accountId, balances);

        // For now, we'll skip orders as they might need more complex handling
        setOrders(accountId, []);

        logger.info(
          `Fetched ${positions.length} positions, ${balances.length} balances via proxy`
        );
      } catch (proxyError) {
        // If proxy fails, fall back to SDK
        logger.error(
          "Proxy fetch failed for account data, falling back to SDK",
          proxyError
        );

        // Get a valid client
        const client = getSnapTradeClient();

        // Check if client is available
        if (!client || !client.accountInformation) {
          logger.error(
            "SnapTrade client not initialized or accountInformation not available"
          );
          setError("SnapTrade client not initialized. Please try again later.");
          return;
        }

        // Fetch positions
        const positionsResponse =
          await client.accountInformation.getUserAccountPositions({
            userId,
            userSecret,
            accountId,
          });

        const positions: AccountPosition[] = [];
        for (const position of positionsResponse.data || []) {
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
            symbolId: symbolId,
            openQuantity: position.units || 0,
            currentMarketValue: position.marketValue || 0,
            currentPrice: position.price || 0,
            averageEntryPrice: position.averageEntryPrice || 0,
            closedPnl: position.closedPnl || 0,
            openPnl: position.openPnl || 0,
            totalCost: position.totalCost || 0,
            dayPnl: position.dayPnl || 0,
            dayPnlPercent: position.dayPnlPercent || 0,
            currency: currency,
          });
        }

        // Fetch balances
        const balancesResponse =
          await client.accountInformation.getUserAccountBalance({
            userId,
            userSecret,
            accountId,
          });

        const balances = (balancesResponse.data || []).map((balance) => ({
          currency: balance.currency?.code || "",
          cash: balance.cash || 0,
          marketValue: balance.marketValue || 0,
          totalEquity: balance.totalValue || 0,
          buyingPower: balance.buyingPower || 0,
        }));

        // Fetch orders
        const ordersResponse =
          await client.accountInformation.getUserAccountOrders({
            userId,
            userSecret,
            accountId,
            state: "all",
            days: 30,
          });

        const orders: AccountOrder[] = [];

        // Use careful type checking for each order
        if (Array.isArray(ordersResponse.data)) {
          for (const orderData of ordersResponse.data) {
            // Type assertion for symbol property which might be an object
            let symbolStr = "";
            let symbolId = "";

            // Handle symbol information from the API response
            const orderSymbol = orderData.symbol as unknown as
              | {
                  symbol?: string;
                  id?: string;
                }
              | undefined;

            if (orderSymbol) {
              symbolStr = orderSymbol.symbol || "";
              symbolId = orderSymbol.id || "";
            }

            orders.push({
              id: orderData.id || "",
              symbol: symbolStr,
              symbolId: symbolId,
              status: (orderData.status || "PENDING") as AccountOrder["status"],
              action: orderData.action || "",
              totalQuantity: parseFloat(
                orderData.totalQuantity?.toString() || "0"
              ),
              openQuantity: parseFloat(
                orderData.openQuantity?.toString() || "0"
              ),
              filledQuantity: parseFloat(
                orderData.filledQuantity?.toString() || "0"
              ),
              limitPrice: orderData.limitPrice,
              stopPrice: orderData.stopPrice,
              orderType: orderData.orderType || "",
              timeInForce: orderData.timeInForce || "",
              createdAt: orderData.time || "",
              updatedAt: orderData.updatedAt || "",
            });
          }
        }

        setPositions(accountId, positions);
        setBalances(accountId, balances);
        setOrders(accountId, orders);

        logger.info(
          `Fetched ${positions.length} positions, ${balances.length} balances, ${orders.length} orders via SDK fallback`
        );
      }
    } catch (error) {
      logger.error("Error fetching account data:", error);
      setError("Failed to fetch account data. Please try again.");
    } finally {
      setLoading(false);
    }
  },
}));
