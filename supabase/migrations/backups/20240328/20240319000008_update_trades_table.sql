-- Rename migration file to: 20240319000008_update_trades_table.sql

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

-- Add PnL calculation
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS pnl DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE 
    WHEN status = 'closed' THEN
      CASE 
        WHEN side = 'Long' THEN (total - (quantity * price)) 
        WHEN side = 'Short' THEN ((quantity * price) - total)
      END
    ELSE NULL
  END
) STORED;

-- Add index for faster recent trades query if not exists
CREATE INDEX IF NOT EXISTS trades_date_idx ON trades(date DESC); 