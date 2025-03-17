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

import { snapTradeService } from '@/services/snaptradeService';
import { SnapTradeConnection, SnapTradeAccount, SnapTradePosition, SnapTradeBalance, SnapTradeOrder, OrderStatus } from './types';

// Check if we're in a Node.js environment and mock the window object if needed
if (typeof window === 'undefined') {
  // Mock window object for Node.js environment
  global.window = {
    location: {
      origin: 'http://localhost:3000'
    },
    open: (url: string) => {
      console.log(`[Mock] Opening URL: ${url}`);
    }
  } as any;
}

// Configuration for testing
const TEST_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || 'test-client-id',
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || 'test-consumer-key',
  redirectUri: process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI || 'http://localhost:3000/snaptrade-callback',
};

// Test user ID
const TEST_USER_ID = `test-user-${Date.now()}`;

// Mock data generators
const generateMockConnections = (): SnapTradeConnection[] => {
  return [
    {
      id: 'conn-1',
      brokerageId: 'webull',
      brokerageName: 'Webull',
      status: 'CONNECTED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'conn-2',
      brokerageId: 'alpaca',
      brokerageName: 'Alpaca',
      status: 'CONNECTED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockAccounts = (): SnapTradeAccount[] => {
  return [
    {
      id: 'acc-1',
      connectionId: 'conn-1',
      brokerageId: 'webull',
      name: 'Webull Individual Account',
      number: '12345678',
      type: 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-2',
      connectionId: 'conn-2',
      brokerageId: 'alpaca',
      name: 'Alpaca Trading Account',
      number: '87654321',
      type: 'MARGIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockPositions = (): SnapTradePosition[] => {
  return [
    {
      id: 'pos-1',
      accountId: 'acc-1',
      symbol: 'AAPL',
      symbolId: 'AAPL',
      quantity: 10,
      price: 175.25,
      averageEntryPrice: 150.75,
      marketValue: 1752.50,
      openPnl: 245.00,
      dayPnl: 15.50,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pos-2',
      accountId: 'acc-1',
      symbol: 'MSFT',
      symbolId: 'MSFT',
      quantity: 5,
      price: 325.50,
      averageEntryPrice: 300.25,
      marketValue: 1627.50,
      openPnl: 126.25,
      dayPnl: 8.75,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pos-3',
      accountId: 'acc-1',
      symbol: 'TSLA',
      symbolId: 'TSLA',
      quantity: 3,
      price: 245.75,
      averageEntryPrice: 260.50,
      marketValue: 737.25,
      openPnl: -44.25,
      dayPnl: -12.75,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const generateMockBalances = (): SnapTradeBalance[] => {
  return [
    {
      currency: 'USD',
      cash: 5250.75,
      marketValue: 4117.25,
      totalValue: 9368.00,
      buyingPower: 10501.50,
      maintenanceExcess: 8294.25,
    },
  ];
};

const generateMockOrders = (): SnapTradeOrder[] => {
  return [
    {
      id: 'order-1',
      accountId: 'acc-1',
      symbol: 'AAPL',
      symbolId: 'AAPL',
      quantity: 2,
      price: 175.25,
      status: OrderStatus.FILLED,
      action: 'BUY',
      type: 'MARKET',
      timeInForce: 'DAY',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86000000).toISOString(),
      filledAt: new Date(Date.now() - 86000000).toISOString(),
      filledQuantity: 2,
      filledPrice: 175.25,
    },
    {
      id: 'order-2',
      accountId: 'acc-1',
      symbol: 'MSFT',
      symbolId: 'MSFT',
      quantity: 1,
      price: 325.50,
      status: OrderStatus.FILLED,
      action: 'BUY',
      type: 'LIMIT',
      timeInForce: 'GTC',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 172000000).toISOString(),
      filledAt: new Date(Date.now() - 172000000).toISOString(),
      filledQuantity: 1,
      filledPrice: 325.50,
    },
    {
      id: 'order-3',
      accountId: 'acc-1',
      symbol: 'TSLA',
      symbolId: 'TSLA',
      quantity: 1,
      price: 250.00,
      status: OrderStatus.PENDING,
      action: 'SELL',
      type: 'LIMIT',
      timeInForce: 'GTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

// Mock API implementation
const mockSnapTradeAPI = {
  init: async () => {
    console.log('Initializing mock SnapTrade service...');
    return Promise.resolve();
  },
  registerUser: async (userId: string) => {
    console.log(`Registering mock user: ${userId}`);
    return Promise.resolve('mock-user-secret');
  },
  getBrokerages: async () => {
    console.log('Getting mock brokerages...');
    return Promise.resolve([
      {
        id: 'webull',
        name: 'Webull',
        slug: 'webull',
        logo: 'https://example.com/webull-logo.png',
        url: 'https://www.webull.com',
        status: 'ACTIVE',
        authTypes: ['OAUTH'],
        isOAuthSupported: true,
        isCredentialsSupported: false,
      },
      {
        id: 'alpaca',
        name: 'Alpaca',
        slug: 'alpaca',
        logo: 'https://example.com/alpaca-logo.png',
        url: 'https://alpaca.markets',
        status: 'ACTIVE',
        authTypes: ['OAUTH'],
        isOAuthSupported: true,
        isCredentialsSupported: false,
      },
    ]);
  },
  getUserConnections: async () => {
    console.log('Getting mock user connections...');
    return Promise.resolve(generateMockConnections());
  },
  getUserAccounts: async () => {
    console.log('Getting mock user accounts...');
    return Promise.resolve(generateMockAccounts());
  },
  getAccountHoldings: async (accountId: string) => {
    console.log(`Getting mock account holdings for account: ${accountId}`);
    return Promise.resolve(generateMockPositions());
  },
  getAccountBalances: async (accountId: string) => {
    console.log(`Getting mock account balances for account: ${accountId}`);
    return Promise.resolve(generateMockBalances());
  },
  getAccountOrders: async (accountId: string) => {
    console.log(`Getting mock account orders for account: ${accountId}`);
    return Promise.resolve(generateMockOrders());
  },
};

// Main test function
async function runTest() {
  console.log('Starting SnapTrade API test...');
  
  // Check if we should use mock data
  const useMockData = process.argv.includes('--mock-only');
  
  if (useMockData) {
    console.log('Using mock data for testing...');
    
    // Override the snapTradeService methods with mock implementations
    Object.keys(mockSnapTradeAPI).forEach((key) => {
      (snapTradeService as any)[key] = (mockSnapTradeAPI as any)[key];
    });
  }
  
  try {
    // Initialize the SnapTrade service
    console.log('Initializing SnapTrade service...');
    await snapTradeService.init(TEST_CONFIG);
    
    // Register a test user
    console.log(`Registering test user: ${TEST_USER_ID}`);
    await snapTradeService.registerUser(TEST_USER_ID);
    
    // Get user information
    const user = snapTradeService.getUser();
    console.log('User information:', user);
    
    // Get brokerages
    console.log('Getting brokerages...');
    const brokerages = await snapTradeService.getBrokerages();
    console.log(`Found ${brokerages.length} brokerages`);
    
    // Get user connections
    console.log('Getting user connections...');
    const connections = await snapTradeService.getUserConnections();
    console.log(`Found ${connections.length} connections`);
    
    // Get user accounts
    console.log('Getting user accounts...');
    const accounts = await snapTradeService.getUserAccounts();
    console.log(`Found ${accounts.length} accounts`);
    
    // Get account details for the first account
    if (accounts.length > 0) {
      const accountId = accounts[0].id;
      
      // Get account holdings
      console.log(`Getting holdings for account: ${accountId}`);
      const holdings = await snapTradeService.getAccountHoldings(accountId);
      console.log(`Found ${holdings.length} holdings`);
      
      // Get account balances
      console.log(`Getting balances for account: ${accountId}`);
      const balances = await snapTradeService.getAccountBalances(accountId);
      console.log(`Found ${balances.length} balances`);
      
      // Get account orders
      console.log(`Getting orders for account: ${accountId}`);
      const orders = await snapTradeService.getAccountOrders(accountId);
      console.log(`Found ${orders.length} orders`);
    }
    
    console.log('SnapTrade API test completed successfully!');
  } catch (error) {
    console.error('Error during SnapTrade API test:', error);
    process.exit(1);
  }
}

// Run the test
runTest(); 