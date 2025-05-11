/**
 * A helper script to print the current environment variables
 * and help debug environment variable issues
 * 
 * Run with: node print_env.js
 */

import 'dotenv/config';

// Variables we expect to have
const expectedVars = [
  // Node/App config
  'NODE_ENV',
  'PORT',
  'APP_URL',
  'API_RATE_LIMIT',
  
  // SnapTrade
  'SNAPTRADE_CLIENT_ID',
  'SNAPTRADE_CONSUMER_KEY',
  'SNAPTRADE_REDIRECT_URI',
  
  // Supabase
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  
  // Legacy VITE_ prefixed vars (should be migrated)
  'VITE_SNAPTRADE_CLIENT_ID',
  'VITE_SNAPTRADE_CONSUMER_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_ENV',
  'VITE_APP_URL'
];

console.log('='.repeat(50));
console.log('ENVIRONMENT VARIABLES STATUS');
console.log('='.repeat(50));

let hasAllRequired = true;

// Print status of all expected variables
for (const varName of expectedVars) {
  const value = process.env[varName];
  const isSet = !!value;
  
  // Mask sensitive values
  let displayValue = 'NOT SET';
  if (isSet) {
    if (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('ID')) {
      if (value.length > 8) {
        displayValue = value.substring(0, 5) + '...' + value.substring(value.length - 3);
      } else {
        displayValue = '***MASKED***';
      }
    } else {
      displayValue = value;
    }
  }
  
  const status = isSet ? '✅' : '❌';
  const isLegacy = varName.startsWith('VITE_');
  
  // Mark required variables that are missing
  if (!isSet && !isLegacy && 
      (varName.includes('SNAPTRADE') || 
       varName.includes('SUPABASE') || 
       varName === 'NODE_ENV')) {
    hasAllRequired = false;
  }
  
  // Display the variable
  console.log(`${status} ${varName.padEnd(30)} ${displayValue}${isLegacy ? ' (legacy)' : ''}`);
}

console.log('\n');

// Print migration status
if (hasAllRequired) {
  console.log('✅ All required environment variables are set');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('   See ENV_SETUP.md for instructions');
}

// Check for migration status
const hasLegacyVars = expectedVars
  .filter(v => v.startsWith('VITE_'))
  .some(v => !!process.env[v]);

if (hasLegacyVars) {
  console.log('\n⚠️  You still have some legacy VITE_ variables set');
  console.log('   Consider migrating to the unified naming approach');
}

console.log('\n='.repeat(50)); 