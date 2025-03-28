# Development Guide

## Current Progress (March 28, 2024)

### SnapTrade Integration
We are in the process of migrating the SnapTrade API integration to use Supabase Edge Functions to avoid CORS issues. Here's what has been completed:

1. Set up Supabase project and configuration
2. Created Edge Function structure for SnapTrade user registration:
   ```
   supabase/functions/snaptrade-register/
   ├── deno.json
   ├── index.ts
   └── package.json
   ```
3. Updated environment variables to support both frontend and Edge Functions:
   - Frontend variables with `VITE_` prefix
   - Edge Function variables without prefix
   - Added necessary Supabase configuration

### Environment Setup
The following environment variables have been configured:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# SnapTrade Configuration - Frontend
VITE_SNAPTRADE_CLIENT_ID=your_client_id
VITE_SNAPTRADE_CONSUMER_SECRET=your_secret
VITE_SNAPTRADE_REDIRECT_URI=your_redirect_uri

# SnapTrade Configuration - Edge Functions
SNAPTRADE_CLIENT_ID=your_client_id
SNAPTRADE_CONSUMER_KEY=your_secret
SNAPTRADE_REDIRECT_URI=your_redirect_uri
```

## Next Steps

### Immediate Tasks
1. Install Docker Desktop (required for Supabase Edge Functions development)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart computer
   - Verify installation with `docker --version`

2. Configure Supabase Edge Function Environment Variables
   - Add `SNAPTRADE_CLIENT_ID` and `SNAPTRADE_CONSUMER_KEY` in Supabase Dashboard
   - Path: Project Settings > Edge Functions > Environment Variables

3. Deploy Edge Functions
   ```bash
   npx supabase functions deploy snaptrade-register
   ```

### Future Tasks
1. Test the SnapTrade registration Edge Function
2. Migrate other SnapTrade operations to Edge Functions:
   - User authentication
   - Broker connections
   - Account management
   - Trading operations
3. Set up proper error handling and logging
4. Implement rate limiting and security measures

### Data Storage Strategy
- Currently keeping trade data in local storage
- Future migration to Supabase database planned
- Will implement data persistence after core functionality is working

## Development Environment

### Required Tools
- Node.js and npm
- Docker Desktop (pending installation)
- Supabase CLI (installed via npx)

### Local Development
1. Start the development server:
   ```bash
   npm run dev
   ```
2. For Edge Functions development (after Docker installation):
   ```bash
   npx supabase functions serve
   ```

## Notes
- CORS issues with direct SnapTrade API calls are being resolved through Edge Functions
- Local storage is temporary; will migrate to Supabase database in future
- Edge Functions provide better security for API keys and sensitive operations 