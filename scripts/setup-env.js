// Script to create a basic .env file with dummy values for development
const fs = require('fs');
const path = require('path');

const envFilePath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../.env.example');

// Basic template with dummy values
const envTemplate = `# SnapTrade API Credentials (Dummy values for local testing)
SNAPTRADE_CLIENT_ID=dummy_client_id
SNAPTRADE_CONSUMER_KEY=dummy_consumer_key
SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback

# Supabase Configuration (Dummy values for local testing)
SUPABASE_URL=https://example.supabase.co
SUPABASE_ANON_KEY=dummy_anon_key
SUPABASE_SERVICE_ROLE_KEY=dummy_service_key

# Server Configuration
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
API_RATE_LIMIT=100

# Note: These are dummy values for local development.
# Replace with actual values for production/integration testing.
`;

// Check if .env file already exists
if (fs.existsSync(envFilePath)) {
  console.log('\n🛑 .env file already exists at: ' + envFilePath);
  console.log('If you want to reset it, please delete it manually and run this script again.');
} else {
  // Create the .env file with the template
  try {
    fs.writeFileSync(envFilePath, envTemplate);
    console.log('\n✅ Created .env file with dummy values at: ' + envFilePath);
    console.log('You can now run `npm run dev:all` to start the development server.');
    console.log('\n⚠️  WARNING: These are dummy values only suitable for local development.');
    console.log('Replace them with actual credentials for production/integration testing.');
  } catch (error) {
    console.error('\n❌ Failed to create .env file:', error);
  }
}

// Also create/update .env.example if it doesn't exist
if (!fs.existsSync(envExamplePath)) {
  const exampleTemplate = envTemplate.replace(/=.*/g, '=your_value_here');
  try {
    fs.writeFileSync(envExamplePath, exampleTemplate);
    console.log('\n✅ Created .env.example file at: ' + envExamplePath);
  } catch (error) {
    console.error('\n❌ Failed to create .env.example file:', error);
  }
}

console.log('\nNext steps:');
console.log('1. Start the development environment with: npm run dev:all');
console.log('2. For real API functionality, update the .env file with your actual credentials\n'); 