-- Create the trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('Long', 'Short')),
  date date NOT NULL,
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  total numeric NOT NULL,
  fees numeric DEFAULT 0,
  status text NOT NULL CHECK (status IN ('open', 'closed')),
  notes text,
  exit_date date,
  exit_price numeric,
  exit_quantity numeric,
  strategy text,
  risk_reward numeric,
  target_price numeric,
  stop_loss numeric,
  tags text[],
  risk_amount numeric,
  reward_amount numeric,
  broker_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  pnl DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN status = 'closed' THEN
        CASE 
          WHEN side = 'Long' THEN (total - (quantity * price)) 
          WHEN side = 'Short' THEN ((quantity * price) - total)
        END
      ELSE NULL
    END
  ) STORED
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
DROP POLICY IF EXISTS "Users can manage their own trades" ON public.trades;
CREATE POLICY "Users can manage their own trades"
  ON public.trades
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for developer mode
DROP POLICY IF EXISTS "Developer mode bypass for trades" ON public.trades;
CREATE POLICY "Developer mode bypass for trades"
  ON public.trades
  USING (public.is_dev_mode() OR auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_trades_updated_at ON public.trades;
CREATE TRIGGER handle_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
DROP INDEX IF EXISTS trades_user_id_idx;
CREATE INDEX trades_user_id_idx ON public.trades(user_id);

DROP INDEX IF EXISTS trades_symbol_idx;
CREATE INDEX trades_symbol_idx ON public.trades(symbol);

DROP INDEX IF EXISTS trades_date_idx;
CREATE INDEX trades_date_idx ON public.trades(date DESC);

DROP INDEX IF EXISTS trades_strategy_idx;
CREATE INDEX trades_strategy_idx ON public.trades(strategy);

DROP INDEX IF EXISTS trades_broker_id_idx;
CREATE INDEX trades_broker_id_idx ON public.trades(broker_id);

DROP INDEX IF EXISTS trades_tags_idx;
CREATE INDEX trades_tags_idx ON public.trades USING GIN(tags); 