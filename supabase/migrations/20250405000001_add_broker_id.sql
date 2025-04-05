-- Migration for adding broker_id to trades table
-- Timestamp: 20250405000001

-- Add broker_id column to trades table if it doesn't exist
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS broker_id text;

-- Create index for broker_id for faster queries
CREATE INDEX IF NOT EXISTS trades_broker_id_idx ON public.trades(broker_id); 