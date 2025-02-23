# Database Migrations Documentation

This document provides a comprehensive overview of all database migrations in chronological order.

## Migration Timeline and Dependencies

### 1. Initial Setup (20240319000001_initial_setup.sql)
- Sets up initial database configuration
- Enables necessary extensions (uuid-ossp, pgcrypto)
- Configures basic security settings
Dependencies: None

### 2. Profiles Table (20240319000002_create_profiles.sql)
- Creates the core user profiles table
- Implements Row Level Security (RLS)
- Defines user roles and permissions
- Sets up profile management policies
Dependencies: 20240319000001_initial_setup.sql

### 3. Transactions Table (20240319000003_create_transactions.sql)
- Creates transaction_type and transaction_side enums
- Implements option_details composite type
- Creates transactions and transaction_orders tables
- Sets up automatic status and average calculations
- Implements RLS policies for transactions
- Creates indexes for performance optimization
Dependencies: 20240319000002_create_profiles.sql (for user_id foreign key)

### 4. Watchlists (20240319000004_create_watchlists.sql)
- Creates watchlists table for tracking symbols
- Implements watchlist sharing functionality
- Sets up RLS policies for watchlist access
- Creates necessary indexes
Dependencies: 20240319000002_create_profiles.sql (for user_id foreign key)

### 5. Screeners (20240319000005_create_screeners.sql)
- Creates screeners table for custom stock filters
- Implements screener criteria storage
- Sets up sharing and access controls
- Creates performance indexes
Dependencies: 20240319000002_create_profiles.sql (for user_id foreign key)

### 6. Final Setup (20240319000006_final_setup.sql)
- Implements additional security measures
- Creates utility functions
- Sets up scheduled maintenance tasks
- Configures backup procedures
Dependencies: All previous migrations

### 7. Auth Attempts (20240319000007_create_auth_attempts.sql)
- Creates auth_attempts table for login tracking
- Implements rate limiting support
- Sets up automatic cleanup of old attempts
- Creates security policies for access control
- Implements monitoring indexes
Dependencies: 20240319000002_create_profiles.sql (for role checks in policies)

### 8. Trades Table Update (20240319000008_update_trades_table.sql)
- Updates existing trades table structure
- Adds new fields for enhanced tracking (strategy, risk/reward, etc.)
- Creates indexes for new fields (strategy, tags)
- Implements PnL calculations
Dependencies: 20240319000003_create_transactions.sql

### 9. Dashboards (20240101000000_add_dashboards_table.sql)
- Creates dashboards table for user customization
- Implements layout storage
- Sets up dashboard sharing functionality
- Creates necessary indexes
Dependencies: 20240319000002_create_profiles.sql (for user_id foreign key)

## Security Features

All tables implement Row Level Security (RLS) with specific policies for:
- Read access (SELECT)
- Write access (INSERT)
- Update permissions (UPDATE)
- Delete permissions (DELETE)

Each policy is carefully designed to:
- Ensure users can only access their own data
- Allow admins appropriate oversight capabilities
- Prevent unauthorized modifications
- Maintain data integrity

## Performance Optimizations

The following indexes are maintained:
- User ID indexes on all relevant tables (for quick user data access)
- Timestamp indexes for temporal queries (created_at, updated_at)
- Symbol indexes for market data (for quick symbol lookups)
- Composite indexes for common query patterns
- GIN indexes for array fields (tags)

## Maintenance

Automated maintenance tasks include:
- Cleanup of old auth attempts (daily at midnight)
- Transaction status updates (real-time triggers)
- Average price calculations (real-time triggers)
- Data archival procedures (configured in final setup)

## Backup Procedures

Backup procedures are configured in the final setup migration, including:
- Daily full backups (configured via pg_dump)
- Point-in-time recovery capability (WAL archiving)
- Automated cleanup of old backups (retention policy)
- Verification procedures

## Development Guidelines

When creating new migrations:
1. Follow the timestamp naming convention: YYYYMMDD000000_descriptive_name.sql
2. Always implement RLS policies for security
3. Include rollback procedures (DOWN migrations)
4. Document all changes and dependencies
5. Create necessary indexes for performance
6. Test migrations in development before deploying
7. Ensure unique timestamps to maintain correct ordering
8. Consider impact on existing data
9. Include data validation where necessary

## Rollback Procedures

Each migration should include a corresponding rollback procedure in case of issues:
1. Document the exact steps to rollback each change
2. Test rollback procedures in development
3. Keep backup points before major migrations
4. Have a recovery plan for each migration 