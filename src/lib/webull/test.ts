/**
 * WebUll API Integration Test
 * 
 * This file contains test functions to verify the WebUll API integration.
 * Run these tests to ensure that the WebUll API client is working correctly.
 */

import { createWebullClient, type WebullCredentials } from './client';
import { webullService } from '@/services/webullService';

// Set up Node.js environment for testing
// This is needed because the tests run in Node.js, not in a browser
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // Mock window object for Node.js environment
  (global as any).window = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  };
}

/**
 * Test the WebUll API client directly.
 * @param credentials WebUll credentials
 */
export async function testWebullClient(credentials: WebullCredentials): Promise<void> {
  console.log('Testing WebUll API client...');
  
  // Create a client
  const client = createWebullClient(false, credentials.deviceId);
  
  try {
    // Login
    console.log('Logging in to WebUll...');
    const authResponse = await client.login(credentials);
    console.log('Login successful:', authResponse);
    
    // Get account information
    console.log('Fetching account information...');
    const account = await client.getAccount();
    console.log('Account information:', account);
    
    // Get positions
    console.log('Fetching positions...');
    const positions = await client.getPositions();
    console.log(`Fetched ${positions.length} positions:`, positions);
    
    // Get orders
    console.log('Fetching orders...');
    const orders = await client.getOrders();
    console.log(`Fetched ${orders.length} orders:`, orders);
    
    // Logout
    console.log('Logging out...');
    await client.logout();
    console.log('Logout successful');
    
    console.log('WebUll API client test completed successfully');
  } catch (error) {
    console.error('WebUll API client test failed:', error);
    throw error;
  }
}

/**
 * Test the WebUll service.
 * @param credentials WebUll credentials
 */
export async function testWebullService(credentials: WebullCredentials): Promise<void> {
  console.log('Testing WebUll service...');
  
  try {
    // Initialize the service
    console.log('Initializing WebUll service...');
    await webullService.init(false); // Use real client, not mock
    
    // Login
    console.log('Logging in to WebUll...');
    const authResponse = await webullService.login(credentials);
    console.log('Login successful:', authResponse);
    
    // Sync all data
    console.log('Syncing all data...');
    const data = await webullService.syncAllData();
    console.log('Data synced successfully:');
    console.log(`- Trades: ${data.trades.length}`);
    console.log(`- Positions: ${data.positions.length}`);
    console.log('- Account:', data.account);
    
    // Logout
    console.log('Logging out...');
    await webullService.logout();
    console.log('Logout successful');
    
    console.log('WebUll service test completed successfully');
  } catch (error) {
    console.error('WebUll service test failed:', error);
    throw error;
  }
}

/**
 * Test the WebUll mock client.
 */
export async function testWebullMockClient(): Promise<void> {
  console.log('Testing WebUll mock client...');
  
  // Create a mock client
  const client = createWebullClient(true);
  
  try {
    // Login
    console.log('Logging in to mock WebUll...');
    const authResponse = await client.login({
      username: 'mock_user',
      password: 'mock_password',
    });
    console.log('Login successful:', authResponse);
    
    // Get account information
    console.log('Fetching account information...');
    const account = await client.getAccount();
    console.log('Account information:', account);
    
    // Get positions
    console.log('Fetching positions...');
    const positions = await client.getPositions();
    console.log(`Fetched ${positions.length} positions:`, positions);
    
    // Get orders
    console.log('Fetching orders...');
    const orders = await client.getOrders();
    console.log(`Fetched ${orders.length} orders:`, orders);
    
    // Logout
    console.log('Logging out...');
    await client.logout();
    console.log('Logout successful');
    
    console.log('WebUll mock client test completed successfully');
  } catch (error) {
    console.error('WebUll mock client test failed:', error);
    throw error;
  }
}

/**
 * Test the WebUll service with mock data.
 */
export async function testWebullServiceWithMockData(): Promise<void> {
  console.log('Testing WebUll service with mock data...');
  
  try {
    // Initialize the service with mock client
    console.log('Initializing WebUll service with mock client...');
    await webullService.init(true); // Use mock client
    
    // Login
    console.log('Logging in to mock WebUll...');
    const authResponse = await webullService.login({
      username: 'mock_user',
      password: 'mock_password',
    });
    console.log('Login successful:', authResponse);
    
    // Generate mock data
    console.log('Generating mock data...');
    const mockData = await webullService.generateMockData(5);
    console.log('Mock data generated successfully:');
    console.log(`- Trades: ${mockData.trades.length}`);
    console.log(`- Positions: ${mockData.positions.length}`);
    console.log('- Account:', mockData.account);
    
    // Logout
    console.log('Logging out...');
    await webullService.logout();
    console.log('Logout successful');
    
    console.log('WebUll service with mock data test completed successfully');
  } catch (error) {
    console.error('WebUll service with mock data test failed:', error);
    throw error;
  }
}

/**
 * Run all WebUll tests.
 * @param credentials WebUll credentials (optional, only needed for real API tests)
 * @param runRealTests Whether to run tests against the real API
 */
export async function runAllWebullTests(
  credentials?: WebullCredentials,
  runRealTests: boolean = false
): Promise<void> {
  console.log('Running all WebUll tests...');
  
  // Always run mock tests
  await testWebullMockClient();
  await testWebullServiceWithMockData();
  
  // Only run real tests if credentials are provided and runRealTests is true
  if (credentials && runRealTests) {
    await testWebullClient(credentials);
    await testWebullService(credentials);
  }
  
  console.log('All WebUll tests completed successfully');
} 