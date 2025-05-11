# Required Environment Variables

To run the application with `npm run dev:all`, you need to create a `.env` file in the root of the project with the following variables:

```env
# Client-side environment variables (with VITE_ prefix)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
VITE_SNAPTRADE_CLIENT_ID=your-snaptrade-client-id
VITE_SNAPTRADE_CONSUMER_KEY=your-snaptrade-consumer-key
VITE_SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback

# Server Configuration
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
API_RATE_LIMIT=100
```

## Quick Fix Instructions

1. Create a new `.env` file in the root directory (C:\dev\TraderInsights)
2. Copy the template above and replace with your actual credentials
3. For local development testing, you can use the following approach:

### Using Dummy Values for Local Testing

If you're just testing the application locally and don't have all credentials yet, you can use dummy values:

```env
# Client-side environment variables (with VITE_ prefix)
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_ANON_KEY=dummy_anon_key
VITE_APP_ENV=development
VITE_SNAPTRADE_CLIENT_ID=dummy_client_id
VITE_SNAPTRADE_CONSUMER_KEY=dummy_consumer_key
VITE_SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback

# Server Configuration
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
API_RATE_LIMIT=100
```

This will allow the server to start, though actual API functionality will be limited until you use real credentials.

## Starting the Application

To properly start the application with both the frontend and backend servers:

```bash
npm run dev:all
```

## Checking Your Environment Variables

After setting up your `.env` file, you can verify your SnapTrade configuration with:

```bash
npm run test:snaptrade
```

This will show if your SnapTrade credentials are working correctly. 