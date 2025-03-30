-- Drop existing table if it exists
DROP TABLE IF EXISTS public.trades;

-- Create trades table
CREATE TABLE public.trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    broker_id VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time TIME NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('stock', 'option', 'crypto', 'forex')),
    side VARCHAR(10) NOT NULL CHECK (side IN ('Long', 'Short')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('Long', 'Short')),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_time TIME NOT NULL,
    entry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_price DECIMAL(10, 2) NOT NULL,
    exit_date TIMESTAMP WITH TIME ZONE,
    exit_time TIME,
    exit_timestamp TIMESTAMP WITH TIME ZONE,
    exit_price DECIMAL(10, 2),
    pnl DECIMAL(10, 2),
    status VARCHAR(10) NOT NULL CHECK (status IN ('open', 'closed', 'pending')),
    notes TEXT,
    setup_type VARCHAR(50),
    strategy VARCHAR(50),
    risk_reward DECIMAL(10, 2),
    stop_loss DECIMAL(10, 2),
    take_profit DECIMAL(10, 2),
    risk_amount DECIMAL(10, 2),
    fees DECIMAL(10, 2),
    tags TEXT[],
    option_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX trades_user_id_idx ON public.trades(user_id);
CREATE INDEX trades_symbol_idx ON public.trades(symbol);
CREATE INDEX trades_status_idx ON public.trades(status);
CREATE INDEX trades_entry_date_idx ON public.trades(entry_date);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
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
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
    ON public.trades
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_trades_updated_at ON public.trades;
CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 