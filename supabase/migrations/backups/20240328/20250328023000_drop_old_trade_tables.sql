-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own transaction orders" ON public.transaction_orders;
DROP POLICY IF EXISTS "Users can insert their own transaction orders" ON public.transaction_orders;
DROP POLICY IF EXISTS "Users can update their own transaction orders" ON public.transaction_orders;
DROP POLICY IF EXISTS "Users can delete their own transaction orders" ON public.transaction_orders;

DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;

-- Create backup tables with existing data
CREATE TABLE IF NOT EXISTS public.backup_transactions AS 
SELECT * FROM public.transactions;

CREATE TABLE IF NOT EXISTS public.backup_transaction_orders AS 
SELECT * FROM public.transaction_orders;

CREATE TABLE IF NOT EXISTS public.backup_trades AS 
SELECT * FROM public.trades;

-- Drop the old tables and their dependencies
DROP TABLE IF EXISTS public.transaction_orders CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.trades CASCADE;

-- Drop the old types that are no longer needed
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_side CASCADE;
DROP TYPE IF EXISTS public.option_type CASCADE;
DROP TYPE IF EXISTS public.option_details CASCADE;

-- Add a comment to the backup tables explaining their purpose
COMMENT ON TABLE public.backup_transactions IS 'Backup of old transactions table from pre-SnapTrade integration. Created on 2025-03-28.';
COMMENT ON TABLE public.backup_transaction_orders IS 'Backup of old transaction_orders table from pre-SnapTrade integration. Created on 2025-03-28.';
COMMENT ON TABLE public.backup_trades IS 'Backup of old trades table from pre-SnapTrade integration. Created on 2025-03-28.';

-- Add RLS policies to ensure only superusers can access backup tables
ALTER TABLE public.backup_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_transaction_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only superusers can access backup tables" ON public.backup_transactions;
DROP POLICY IF EXISTS "Only superusers can access backup tables" ON public.backup_transaction_orders;
DROP POLICY IF EXISTS "Only superusers can access backup tables" ON public.backup_trades;

CREATE POLICY "Only superusers can access backup tables"
    ON public.backup_transactions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only superusers can access backup tables"
    ON public.backup_transaction_orders
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only superusers can access backup tables"
    ON public.backup_trades
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'service_role'); 