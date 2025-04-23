/**
 * SnapTrade API Test Script
 * 
 * This script tests the SnapTrade integration by:
 * 1. Initializing the SnapTrade service
 * 2. Registering a test user
 * 3. Generating mock data for testing
 * 4. Testing the API endpoints
 * 
 * Usage:
 * - Run with mock data: npm run test:snaptrade -- --mock-only
 * - Run with real API: npm run test:snaptrade
 */

import { SnapTradeClient } from "./client";
import { getSnapTradeConfig } from "./config";
import {
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
  OrderStatus,
} from "./types";

// Check if we're in a Node.js environment and mock the window object if needed
if (typeof window === "undefined") {
  // Mock window object for Node.js environment
  global.window = {
    location: {
      origin: "http://localhost:3000",
    },
    open: (url: string) => {
      console.log(`[Mock] Opening URL: ${url}`);
    },
  } as any;
}

// Configuration for testing
const TEST_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || "test-client-id",
  consumerKey:
    process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || "test-consumer-key",
  redirectUri:
    process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI ||
    "http://localhost:3000/snaptrade-callback",
};

// Test user ID
const TEST_USER_ID = `test-user-${Date.now()}`;

// Mock data generators
const generateMockConnections = (): SnapTradeConnection[] => {
  return [
    {
      id: "conn-1",
      brokerageId: "webull",
      brokerageName: "Webull",
      status: "CONNECTED" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "conn-2",
      brokerageId: "alpaca",
      brokerageName: "Alpaca",
      status: "CONNECTED" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockAccounts = (): SnapTradeAccount[] => {
  return [
    {
      id: "acc-1",
      number: "123456789",
      name: "Test Account 1",
      type: "INDIVIDUAL",
      currency: "USD",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "acc-2",
      number: "987654321",
      name: "Test Account 2",
      type: "INDIVIDUAL",
      currency: "USD",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockPositions = (): SnapTradePosition[] => {
  return [
    {
      symbol: "AAPL",
      units: 100,
      price: 150.0,
      value: 15000.0,
      currency: "USD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: "MSFT",
      units: 50,
      price: 300.0,
      value: 15000.0,
      currency: "USD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockBalances = (): SnapTradeBalance[] => {
  return [
    {
      currency: "USD",
      cash: 10000.0,
      marketValue: 30000.0,
      totalEquity: 40000.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockOrders = (): SnapTradeOrder[] => {
  return [
    {
      id: "order-1",
      symbol: "AAPL",
      side: "BUY",
      quantity: 100,
      price: 150.0,
      status: OrderStatus.FILLED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "order-2",
      symbol: "MSFT",
      side: "SELL",
      quantity: 50,
      price: 300.0,
      status: OrderStatus.FILLED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

// Mock SnapTrade API
const mockSnapTradeAPI = {
  initialize: async () => true,
  registerUser: async (userId: string) => ({
    userId,
    userSecret: "test-user-secret",
  }),
  getUser: () => ({
    userId: TEST_USER_ID,
    userSecret: "test-user-secret",
  }),
  getBrokerages: async () => [
    { id: "webull", name: "Webull" },
    { id: "alpaca", name: "Alpaca" },
  ],
  getConnections: async () => generateMockConnections(),
  getAccounts: async () => generateMockAccounts(),
  getAccountPositions: async () => generateMockPositions(),
  getAccountBalances: async () => generateMockBalances(),
  getAccountOrders: async () => generateMockOrders(),
};

// Run tests
async function runTests() {
  try {
    console.log("Starting SnapTrade integration tests...");

    // Initialize SnapTrade client
    const snapTradeClient = new SnapTradeClient(TEST_CONFIG);
    await snapTradeClient.initialize();
    console.log("SnapTrade client initialized successfully");

    // Register test user
    const user = await snapTradeClient.registerUser(TEST_USER_ID);
    console.log("Test user registered successfully:", user);

    // Get brokerages
    const brokerages = await snapTradeClient.getBrokerages();
    console.log("Available brokerages:", brokerages);

    // Get connections
    const connections = await snapTradeClient.getConnections();
    console.log("User connections:", connections);

    // Get accounts
    const accounts = await snapTradeClient.getAccounts({
      userId: user.userId,
      userSecret: user.userSecret,
    });
    console.log("User accounts:", accounts);

    // Get account data
    for (const account of accounts) {
      const holdings = await snapTradeClient.getAccountPositions({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId: account.id,
      });
      console.log(`Holdings for account ${account.id}:`, holdings);

      const balances = await snapTradeClient.getAccountBalances({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId: account.id,
      });
      console.log(`Balances for account ${account.id}:`, balances);

      const orders = await snapTradeClient.getAccountOrders({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId: account.id,
      });
      console.log(`Orders for account ${account.id}:`, orders);
    }

    console.log("All tests completed successfully");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
} 