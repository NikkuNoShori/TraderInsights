# Environment Variables Cheat Sheet

## Quick Setup

1. Create a `.env` file in the project root with these variables:

```env
# REQUIRED VARIABLES - Server expects these with VITE_ prefix
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
VITE_SNAPTRADE_CLIENT_ID=your_snaptrade_client_id
VITE_SNAPTRADE_CONSUMER_KEY=your_snaptrade_consumer_key
VITE_SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback

# Server configuration
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
API_RATE_LIMIT=100
```

2. Use dummy values for local development if needed:

```env
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_ANON_KEY=dummy_anon_key
VITE_APP_ENV=development
VITE_SNAPTRADE_CLIENT_ID=dummy_client_id
VITE_SNAPTRADE_CONSUMER_KEY=dummy_consumer_key
VITE_SNAPTRADE_REDIRECT_URI=http://localhost:5173/broker-callback
```

## Starting the Application

```bash
# Start both frontend and backend servers
npm run dev:all
```

## Testing SnapTrade Configuration

```bash
# Test SnapTrade API connectivity
npm run test:snaptrade
```

## Troubleshooting

If you see server errors about missing environment variables:

1. Check that all VITE_ prefixed variables are present in your .env file
2. Make sure the server can access these variables (VITE_ prefixed)
3. Restart both servers after changing environment variables
4. Use the exact variable names shown above (including VITE_ prefix) 