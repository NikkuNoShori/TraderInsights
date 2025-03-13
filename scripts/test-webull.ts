/**
 * WebUll API Integration Test Script
 * 
 * This script runs tests to verify the WebUll API integration.
 * 
 * Usage:
 *   npm run test:webull -- --mock-only  # Run only mock tests
 *   npm run test:webull -- --real       # Run real API tests (requires credentials)
 */

import { runAllWebullTests, testWebullMockClient, testWebullServiceWithMockData } from '../src/lib/webull/test';
import { WebullCredentials } from '../src/lib/webull/client';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for input
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  console.log('WebUll API Integration Test Script');
  console.log('=================================');
  
  const args = process.argv.slice(2);
  const mockOnly = args.includes('--mock-only');
  const runRealTests = args.includes('--real');
  
  if (mockOnly) {
    console.log('Running mock tests only...');
    await testWebullMockClient();
    await testWebullServiceWithMockData();
    console.log('All mock tests completed successfully');
    rl.close();
    return;
  }
  
  if (runRealTests) {
    console.log('Running real API tests...');
    
    // Try to get credentials from environment variables
    let username = process.env.WEBULL_USERNAME;
    let password = process.env.WEBULL_PASSWORD;
    let deviceId = process.env.WEBULL_DEVICE_ID;
    let deviceName = process.env.WEBULL_DEVICE_NAME || 'TraderInsights';
    let mfaCode = process.env.WEBULL_MFA_CODE;
    
    // Prompt for missing credentials
    if (!username) {
      username = await prompt('Enter WebUll username: ');
    }
    
    if (!password) {
      password = await prompt('Enter WebUll password: ');
    }
    
    if (!deviceId) {
      deviceId = await prompt('Enter WebUll device ID (leave empty to generate): ');
    }
    
    if (!mfaCode) {
      mfaCode = await prompt('Enter WebUll MFA code (if required): ');
    }
    
    const credentials: WebullCredentials = {
      username,
      password,
      deviceId: deviceId || undefined,
      deviceName,
      mfaCode: mfaCode || undefined,
    };
    
    await runAllWebullTests(credentials, true);
    console.log('All tests completed successfully');
  } else {
    console.log('Running mock tests by default...');
    await runAllWebullTests();
    console.log('All mock tests completed successfully');
    console.log('To run real API tests, use the --real flag');
  }
  
  rl.close();
}

main().catch((error) => {
  console.error('Test script failed:', error);
  rl.close();
  process.exit(1);
}); 