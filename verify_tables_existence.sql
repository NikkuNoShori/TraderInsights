-- SQL script to verify which tables from migrations exist in the database
-- Run this against your Supabase database to confirm current state

-- Verify essential tables used in the codebase
SELECT table_name, 'EXISTS' as status FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  -- Core user data
  'profiles',
  
  -- Trading data
  'trades',
  'transactions',
  'transaction_orders',
  
  -- SnapTrade integration
  'snaptrade_credentials',
  
  -- Watchlists
  'symbols_watched',
  'user_watchlists',
  
  -- Security
  'auth_attempts',
  'error_logs',
  'error_logs_maintenance',
  
  -- Storage
  'sessions',
  'user_data',
  
  -- Dashboards
  'dashboards',
  'dashboard_profiles',
  
  -- Other tables seen in codebase
  'portfolios',
  'stock_data',
  'stock_quotes',
  'screener_presets'
) 
ORDER BY table_name;

-- List all existing public tables for reference
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify types used in transactions
SELECT typname, typtype, typcategory 
FROM pg_type 
WHERE typname IN (
  'transaction_type',
  'transaction_side',
  'option_type',
  'option_details'
); 