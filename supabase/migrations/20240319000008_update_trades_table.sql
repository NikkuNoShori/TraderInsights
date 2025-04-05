-- Rename migration file to: 20240319000008_update_trades_table.sql

-- Check if trades table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trades') THEN
        CREATE TABLE public.trades (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            symbol text NOT NULL,
            entry_price numeric NOT NULL,
            exit_price numeric,
            quantity numeric NOT NULL,
            entry_date timestamptz NOT NULL,
            exit_date timestamptz,
            trade_type text NOT NULL,
            notes text,
            broker_id text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        -- Add RLS policies
        ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own trades"
            ON public.trades
            FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert their own trades"
            ON public.trades
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own trades"
            ON public.trades
            FOR UPDATE
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own trades"
            ON public.trades
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Update trades table structure
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS strategy text,
  ADD COLUMN IF NOT EXISTS risk_reward numeric,
  ADD COLUMN IF NOT EXISTS target_price numeric,
  ADD COLUMN IF NOT EXISTS stop_loss numeric,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS risk_amount numeric,
  ADD COLUMN IF NOT EXISTS reward_amount numeric;

-- Create index for strategy searches
CREATE INDEX IF NOT EXISTS trades_strategy_idx ON public.trades(strategy);

-- Create index for tags searches using GIN index type for array columns
CREATE INDEX IF NOT EXISTS trades_tags_idx ON public.trades USING GIN(tags);

-- Add simple PnL calculation based on existing columns
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS pnl DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE 
    WHEN exit_price IS NOT NULL THEN
      (exit_price - entry_price) * quantity
    ELSE NULL
  END
) STORED;

-- Add index for faster trades queries
CREATE INDEX IF NOT EXISTS trades_entry_date_idx ON public.trades(entry_date DESC); 