# Environment Variables Setup Guide

## Current Implementation

This project has inconsistent environment variable handling between client and server:

- **Server-side code** expects variables with `VITE_` prefix (src/server/utils/env.ts)
- **Client-side code** has both direct access and `VITE_` prefixed variables
- **SnapTrade client** tries to access both formats with a fallback mechanism

## Required Environment Variables

Create a `.env` file at the root of the project with the following variables:

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

## Starting the Application

To properly start the application:

1. Create the `.env` file as described above
2. Run the combined development command:
   ```bash
   npm run dev:all
   ```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

## Troubleshooting

If you encounter environment variable issues:

1. Make sure all required variables are present in your `.env` file
2. Check server logs for missing environment variable errors
3. Verify that the variables in your `.env` file match the naming expected by the code
4. Restart both servers after making changes to your `.env` file

## Testing SnapTrade Configuration

To test your SnapTrade API credentials:

```bash
npm run test:snaptrade
```

This will verify connectivity to SnapTrade API and confirm your credentials are working correctly. 