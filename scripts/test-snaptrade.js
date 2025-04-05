/**
 * Test script for SnapTrade integration
 * This script tests the SnapTrade registration endpoint directly
 * 
 * To run:
 * node scripts/test-snaptrade.js
 */

require('dotenv').config();

async function testSnapTradeRegister() {
  const userId = 'test-user-' + Date.now();
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    process.exit(1);
  }

  console.log(`Testing SnapTrade registration for user: ${userId}`);
  console.log(`Using Supabase URL: ${supabaseUrl}`);

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/snaptrade-register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    console.log(`Response status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error testing SnapTrade registration:', error);
  }
}

testSnapTradeRegister().catch(console.error); 