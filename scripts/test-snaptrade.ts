#!/usr/bin/env node

/**
 * SnapTrade Integration Test Script
 * 
 * This script tests the SnapTrade integration by:
 * 1. Initializing the SnapTrade service
 * 2. Registering a test user
 * 3. Getting brokerages
 * 4. Getting user connections (or creating mock connections)
 * 5. Getting user accounts (or creating mock accounts)
 * 6. Getting account holdings, balances, and orders
 * 
 * Usage:
 *   npm run test:snaptrade -- --mock    # Run with mock data
 *   npm run test:snaptrade               # Run with real data (requires environment variables)
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { SnapTradeService } from '../src/lib/snaptrade/service';
import { 
  SnapTradeConnection, 
  SnapTradeAccount, 
  SnapTradePosition, 
  SnapTradeBalance, 
  SnapTradeOrder,
  ConnectionStatus,
  OrderStatus
} from '../src/lib/snaptrade/types';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Parse command line arguments
const args = process.argv.slice(2);
const useMockData = args.includes('--mock');

// Logs array to collect output
const logs: string[] = [];

// Log function that both logs to console and collects logs
function log(message: string) {
  console.log(message);
  logs.push(message);
}

// Mock data generators
function generateMockConnections(): SnapTradeConnection[] {
  return [
    {
      id: 'conn-1',
      brokerageId: 'broker-1',
      brokerageName: 'WebUll',
      status: ConnectionStatus.CONNECTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'conn-2',
      brokerageId: 'broker-2',
      brokerageName: 'Alpaca',
      status: ConnectionStatus.CONNECTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function generateMockAccounts(): SnapTradeAccount[] {
  return [
    {
      id: 'account-1',
      connectionId: 'conn-1',
      brokerageId: 'broker-1',
      name: 'WebUll Trading Account',
      number: '12345678',
      type: 'MARGIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'account-2',
      connectionId: 'conn-2',
      brokerageId: 'broker-2',
      name: 'Alpaca Trading Account',
      number: '87654321',
      type: 'CASH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function generateMockPositions(): SnapTradePosition[] {
  return [
    {
      id: 'position-1',
      accountId: 'account-1',
      symbol: 'AAPL',
      quantity: 10,
      price: 150.25,
      averageCost: 145.75,
      marketValue: 1502.50,
      openPnl: 45.00,
      dayPnl: 12.50,
      percentChange: 3.09,
    },
    {
      id: 'position-2',
      accountId: 'account-1',
      symbol: 'MSFT',
      quantity: 5,
      price: 280.50,
      averageCost: 275.25,
      marketValue: 1402.50,
      openPnl: 26.25,
      dayPnl: 8.75,
      percentChange: 1.91,
    },
  ];
}

function generateMockBalances(): SnapTradeBalance[] {
  return [
    {
      currency: 'USD',
      cash: 5000.75,
      marketValue: 2905.00,
      totalValue: 7905.75,
      buyingPower: 10000.00,
      maintenanceExcess: 7000.00,
    },
  ];
}

function generateMockOrders(): SnapTradeOrder[] {
  return [
    {
      id: 'order-1',
      accountId: 'account-1',
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 5,
      filledQuantity: 5,
      price: 145.75,
      status: OrderStatus.FILLED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-2',
      accountId: 'account-1',
      symbol: 'MSFT',
      side: 'BUY',
      quantity: 5,
      filledQuantity: 5,
      price: 275.25,
      status: OrderStatus.FILLED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-3',
      accountId: 'account-1',
      symbol: 'GOOGL',
      side: 'BUY',
      quantity: 2,
      filledQuantity: 0,
      price: 2500.00,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Mock API implementation
const mockApi = {
  init: async () => {
    log('Initializing mock SnapTrade service');
    return true;
  },
  registerUser: async (userId: string) => {
    log(`Registering mock user: ${userId}`);
    return { userId, userSecret: 'mock-secret' };
  },
  getBrokerages: async () => {
    log('Getting mock brokerages');
    return [
      { id: 'broker-1', name: 'WebUll', logo: 'webull.png' },
      { id: 'broker-2', name: 'Alpaca', logo: 'alpaca.png' },
      { id: 'broker-3', name: 'Interactive Brokers', logo: 'ibkr.png' },
    ];
  },
  getUserConnections: async () => {
    log('Getting mock user connections');
    return generateMockConnections();
  },
  getUserAccounts: async () => {
    log('Getting mock user accounts');
    return generateMockAccounts();
  },
  getAccountHoldings: async (accountId: string) => {
    log(`Getting mock account holdings for account: ${accountId}`);
    return generateMockPositions();
  },
  getAccountBalances: async (accountId: string) => {
    log(`Getting mock account balances for account: ${accountId}`);
    return generateMockBalances();
  },
  getAccountOrders: async (accountId: string) => {
    log(`Getting mock account orders for account: ${accountId}`);
    return generateMockOrders();
  },
};

// Main function
async function main() {
  try {
    log('Starting SnapTrade integration test');
    log(`Mode: ${useMockData ? 'Mock Data' : 'Real Data'}`);

    // Create SnapTrade service
    const snapTradeService = new SnapTradeService();

    // Use mock API if requested
    if (useMockData) {
      // @ts-ignore - Override methods with mock implementations
      snapTradeService.init = mockApi.init;
      // @ts-ignore
      snapTradeService.registerUser = mockApi.registerUser;
      // @ts-ignore
      snapTradeService.getBrokerages = mockApi.getBrokerages;
      // @ts-ignore
      snapTradeService.getUserConnections = mockApi.getUserConnections;
      // @ts-ignore
      snapTradeService.getUserAccounts = mockApi.getUserAccounts;
      // @ts-ignore
      snapTradeService.getAccountHoldings = mockApi.getAccountHoldings;
      // @ts-ignore
      snapTradeService.getAccountBalances = mockApi.getAccountBalances;
      // @ts-ignore
      snapTradeService.getAccountOrders = mockApi.getAccountOrders;
    }

    // Initialize the service
    log('Initializing SnapTrade service');
    await snapTradeService.init({
      clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || 'test-client-id',
      consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || 'test-consumer-key',
      redirectUri: process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI || 'http://localhost:3000/snaptrade-callback',
    });

    // Register a test user
    const testUserId = `test-user-${Date.now()}`;
    log(`Registering test user: ${testUserId}`);
    const user = await snapTradeService.registerUser(testUserId);
    log(`User registered: ${JSON.stringify(user)}`);

    // Get brokerages
    log('Getting brokerages');
    const brokerages = await snapTradeService.getBrokerages();
    log(`Found ${brokerages.length} brokerages`);
    brokerages.forEach((brokerage, index) => {
      log(`  ${index + 1}. ${brokerage.name} (${brokerage.id})`);
    });

    // Get user connections
    log('Getting user connections');
    const connections = await snapTradeService.getUserConnections();
    log(`Found ${connections.length} connections`);
    connections.forEach((connection, index) => {
      log(`  ${index + 1}. ${connection.brokerageName} (${connection.status})`);
    });

    // If no connections and using real data, show connection link
    if (connections.length === 0 && !useMockData) {
      if (brokerages.length > 0) {
        const brokerageId = brokerages[0].id;
        log(`No connections found. To connect a brokerage, use this link:`);
        const connectionUrl = await snapTradeService.createConnectionLink(brokerageId);
        log(`  ${connectionUrl}`);
        log(`After connecting, run this test again.`);
        return;
      }
    }

    // Get user accounts
    log('Getting user accounts');
    const accounts = await snapTradeService.getUserAccounts();
    log(`Found ${accounts.length} accounts`);
    accounts.forEach((account, index) => {
      log(`  ${index + 1}. ${account.name} (${account.type})`);
    });

    // If no accounts, exit
    if (accounts.length === 0) {
      log('No accounts found. Exiting.');
      return;
    }

    // Get account details for the first account
    const accountId = accounts[0].id;
    log(`Getting details for account: ${accounts[0].name} (${accountId})`);

    // Get account holdings
    log('Getting account holdings');
    const holdings = await snapTradeService.getAccountHoldings(accountId);
    log(`Found ${holdings.length} holdings`);
    holdings.forEach((holding, index) => {
      log(`  ${index + 1}. ${holding.symbol}: ${holding.quantity} shares @ $${holding.price} (P&L: $${holding.openPnl})`);
    });

    // Get account balances
    log('Getting account balances');
    const balances = await snapTradeService.getAccountBalances(accountId);
    log(`Found ${balances.length} balances`);
    balances.forEach((balance, index) => {
      log(`  ${index + 1}. ${balance.currency}: Cash: $${balance.cash}, Market Value: $${balance.marketValue}, Total: $${balance.totalValue}`);
    });

    // Get account orders
    log('Getting account orders');
    const orders = await snapTradeService.getAccountOrders(accountId);
    log(`Found ${orders.length} orders`);
    orders.forEach((order, index) => {
      log(`  ${index + 1}. ${order.symbol}: ${order.side} ${order.quantity} @ $${order.price} (Status: ${order.status})`);
    });

    log('SnapTrade integration test completed successfully');
  } catch (error) {
    log(`Error: ${(error as Error).message}`);
    log(`Stack: ${(error as Error).stack}`);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Export logs for API usage
export { logs }; 