# Webull API Integration Technical Document

## Overview
This document outlines the technical approach for integrating Webull's trading data with TraderInsights, enabling users to import their trade history and store it in Supabase tables. The integration supports multiple import methods: direct API connection, Excel/CSV uploads, and manual entry, all tied to a unified broker profile.

## Existing Solutions & Dependencies

### Third-Party Packages
1. **webull-api-node** (https://github.com/tedchou12/webull-api-node)
   - Handles authentication flows
   - Provides trade data fetching
   - Manages session tokens
   - Limitations: May need updates for latest Webull API changes

2. **webull-client-python** (https://github.com/tedchou12/webull-client-python)
   - Python implementation if we need server-side processing
   - More extensive features than Node version

3. **OAuth Libraries**
   - `@supabase/supabase-js`: Native OAuth handling
   - `@auth/supabase-adapter`: NextAuth.js integration if needed
   - `jose`: JWT handling and verification

### Supabase Native Features to Leverage
1. **Edge Functions**
   - Secure environment for handling Webull API calls
   - Keeps sensitive operations server-side
   - Built-in rate limiting capabilities

2. **Row Level Security (RLS)**
   - Enforce user-specific trade data access
   - Prevent unauthorized data access
   - Automatic policy enforcement

3. **Vault Extension**
   - Secure storage for Webull API tokens
   - Encryption at rest for sensitive data
   - Key rotation management

4. **Real-time Subscriptions**
   - Live updates for trade imports
   - Progress monitoring
   - Error notifications

## Authentication Flow (Updated)
1. **OAuth Integration**
   - Implement OAuth 2.0 flow if supported by Webull
   - Use Supabase OAuth providers management
   - Store tokens in Supabase Vault

2. **Fallback Authentication**
   - Use Edge Functions for credential handling
   - Never expose credentials to client
   - Implement MFA through secure channels

3. **Token Management**
   - Leverage Supabase session management
   - Store refresh tokens in Vault
   - Automatic token rotation

## Security Architecture

### Sensitive Data Handling
1. **Edge Functions**
   ```typescript
   // Example Edge Function structure
   export async function webullAuth(req: Request) {
     const { email, password } = await req.json();
     // Handle auth in secure environment
     const tokens = await webullClient.authenticate({
       email,
       password,
       deviceId: generateSecureDeviceId(),
     });
     // Store in Vault
     await supabase.vault.store('webull_tokens', tokens);
   }
   ```

2. **Vault Storage**
   ```sql
   -- Example Vault table structure
   create table vault.webull_credentials (
     id uuid default uuid_generate_v4(),
     user_id uuid references auth.users,
     encrypted_data jsonb,
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```

3. **RLS Policies**
   ```sql
   -- Example RLS policy
   create policy "Users can only access their own trade data"
   on trades
   for all
   using (auth.uid() = user_id);
   ```

## Broker Profile Management

### Database Structure
```sql
-- Broker profiles table
create table public.broker_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  broker_type text not null check (broker_type in ('webull', 'other_future_brokers')),
  nickname text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Broker connection methods
create table public.broker_connections (
  id uuid default uuid_generate_v4() primary key,
  broker_profile_id uuid references public.broker_profiles not null,
  connection_type text not null check (connection_type in ('api', 'manual', 'file_import')),
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add broker_profile_id to trades table
alter table public.trades 
add column broker_profile_id uuid references public.broker_profiles;
```

### RLS Policies
```sql
-- Broker profiles access
create policy "Users can only access their own broker profiles"
on broker_profiles
for all
using (auth.uid() = user_id);

-- Trades linked to broker profiles
create policy "Users can only access trades from their broker profiles"
on trades
for all
using (
  exists (
    select 1 from broker_profiles
    where id = trades.broker_profile_id
    and user_id = auth.uid()
  )
);
```

## Import Methods

### 1. Direct API Integration
- Uses Webull API through Edge Functions
- Real-time data synchronization
- Automatic trade updates

### 2. Excel/CSV Import
```typescript
interface ExcelImportConfig {
  // Column mappings for Webull export format
  columnMappings: {
    symbol: string;
    quantity: string;
    price: string;
    orderType: string;
    timestamp: string;
    // ... other fields
  };
  // Supported file types
  allowedTypes: ['.xlsx', '.csv'];
  // Maximum file size (5MB)
  maxSize: 5 * 1024 * 1024;
}

// Example Edge Function for file processing
export async function processTradeFile(req: Request) {
  const { file, brokerProfileId } = await req.json();
  
  // Process file using xlsx or papa parse
  const trades = await processFileToTrades(file);
  
  // Validate and transform data
  const validatedTrades = await validateTrades(trades);
  
  // Store in database with broker profile association
  await storeTrades(validatedTrades, brokerProfileId);
}
```

### 3. Manual Entry
- UI form for manual trade entry
- Validation against broker-specific rules
- Association with broker profile

## Dependencies (Updated)
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "webull-api-node": "^1.x",
    "xlsx": "^0.18.x",
    "papaparse": "^5.x",
    "jose": "^4.x",
    "@tsndr/cloudflare-worker-jwt": "^2.x",
    "zod": "^3.x",
    "@upstash/redis": "^1.x"
  }
}
```

## Environment Variables (Updated)
```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Webull
WEBULL_CLIENT_ID=
WEBULL_CLIENT_SECRET=

# Edge Function
EDGE_FUNCTION_JWT_SECRET=

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

## Security Considerations (Updated)
1. **Zero Trust Architecture**
   - All operations verified through Edge Functions
   - No sensitive data on client
   - All access tokenized

2. **Monitoring & Alerts**
   - Set up Supabase monitoring
   - Configure error alerting
   - Track unusual activity

## Next Steps (Updated)
1. Set up broker profile infrastructure
2. Implement Excel/CSV import
3. Create unified trade storage
4. Add Webull API integration
5. Build broker management UI

---
Note: This document outlines a unified approach to managing trades from multiple import sources while maintaining data consistency and security through broker profiles.

## API Endpoints
### Required Endpoints
1. **Authentication**
   ```
   POST /api/auth/login
   POST /api/auth/mfa/verify
   POST /api/auth/refresh
   ```

2. **Trade Data**
   ```
   GET /api/trading/history
   GET /api/trading/positions
   GET /api/trading/orders
   ```

### Rate Limiting
- Research needed on Webull's rate limiting policies
- Implement rate limiting middleware
- Cache frequently accessed data

## Data Model Mapping
### Webull Trade Data Structure
```typescript
interface WebullTrade {
  orderId: string;
  symbol: string;
  quantity: number;
  price: number;
  orderType: string;
  status: string;
  timestamp: string;
  // Additional fields to be confirmed
}
```

### TraderInsights Trade Structure
```typescript
interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  type: 'stock' | 'option';
  side: 'Long' | 'Short';
  quantity: number;
  entry_price: number;
  exit_price: number;
  status: 'open' | 'closed';
  notes: string;
  created_at: string;
  updated_at: string;
}
```

## Testing Strategy (Updated)
1. **Unit Tests**
   - File processing
   - Data transformation
   - Validation logic

2. **Integration Tests**
   - File imports
   - API synchronization
   - Broker profile management

3. **Security Tests**
   - File upload security
   - Data validation
   - Profile access control

## Risks and Mitigation
1. **API Changes**
   - Regular monitoring
   - Version checking
   - Fallback mechanisms

2. **Rate Limiting**
   - Implement backoff strategy
   - Queue system for bulk imports
   - Cache frequently accessed data

3. **Data Integrity**
   - Validation before storage
   - Transaction handling
   - Backup mechanisms

## Future Enhancements
1. Real-time data sync
2. Automated trade importing
3. Advanced filtering options
4. Custom data mapping options

## Resources Needed
1. Webull API documentation
2. API access credentials
3. Test account for development
4. Production API keys

## Questions to Resolve
1. Webull API rate limits?
2. Authentication token lifespan?
3. Available historical data range?
4. Real-time data availability?
5. API versioning strategy?

## Next Steps (Updated)
1. Set up broker profile infrastructure
2. Implement Excel/CSV import
3. Create unified trade storage
4. Add Webull API integration
5. Build broker management UI

---
Note: This document outlines a unified approach to managing trades from multiple import sources while maintaining data consistency and security through broker profiles. 