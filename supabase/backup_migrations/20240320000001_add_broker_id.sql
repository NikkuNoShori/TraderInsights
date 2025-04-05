-- Add broker_id column to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS broker_id text;

-- Create index for broker_id
CREATE INDEX IF NOT EXISTS trades_broker_id_idx ON public.trades(broker_id); 