# Development Guide

## Current Progress (March 28, 2024)

### SnapTrade Integration
We have completed the migration of the SnapTrade API integration to use Supabase Edge Functions to avoid CORS issues. Here's what has been completed:

1. Set up Supabase project and configuration
2. Created Edge Function structure for SnapTrade operations:
   ```
   supabase/functions/
   ├── snaptrade-register/     # User registration
   ├── snaptrade-auth/        # User authentication
   ├── snaptrade-brokers/     # Broker connections
   ├── snaptrade-accounts/    # Account management
   └── snaptrade-trading/     # Trading operations
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
1. Deploy Edge Functions
   ```bash
   npx supabase functions deploy snaptrade-register
   npx supabase functions deploy snaptrade-auth
   npx supabase functions deploy snaptrade-brokers
   npx supabase functions deploy snaptrade-accounts
   npx supabase functions deploy snaptrade-trading
   ```

2. Test each Edge Function:
   - User registration flow
   - Authentication flow
   - Broker connection management
   - Account management
   - Trading operations

3. Update frontend to use new Edge Functions:
   - Replace direct SnapTrade API calls with Edge Function calls
   - Update error handling and response processing
   - Implement proper loading states and error messages

### Future Tasks
1. Implement rate limiting and security measures
2. Add request validation and sanitization
3. Set up proper error logging and monitoring
4. Implement caching for frequently accessed data
5. Add automated testing for Edge Functions

### Data Storage Strategy
- Currently keeping trade data in local storage
- Future migration to Supabase database planned
- Will implement data persistence after core functionality is working

## Development Environment

### Required Tools
- Node.js and npm
- Docker Desktop (installed and running)
- Supabase CLI (installed via npx)

### Local Development
1. Start the development server:
   ```bash
   npm run dev
   ```
2. For Edge Functions development:
   ```bash
   npx supabase functions serve
   ```

## Notes
- CORS issues with direct SnapTrade API calls are resolved through Edge Functions
- Local storage is temporary; will migrate to Supabase database in future
- Edge Functions provide better security for API keys and sensitive operations
- Each Edge Function is designed to handle specific SnapTrade operations
- Proper error handling and validation implemented in all functions 