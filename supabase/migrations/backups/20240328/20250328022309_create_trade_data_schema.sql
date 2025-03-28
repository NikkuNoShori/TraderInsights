-- Create enum types
CREATE TYPE trade_side AS ENUM ('buy', 'sell');
CREATE TYPE trade_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');
CREATE TYPE position_type AS ENUM ('long', 'short');

-- Create broker_connections table
CREATE TABLE broker_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_id VARCHAR(255) NOT NULL,
    connection_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_id)
);

-- Create accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) NOT NULL,
    cash_balance DECIMAL(20, 8) NOT NULL,
    margin_balance DECIMAL(20, 8),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_connection_id, account_id)
);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    broker_trade_id VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side trade_side NOT NULL,
    type trade_type NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    commission DECIMAL(20, 8),
    fees DECIMAL(20, 8),
    total_amount DECIMAL(20, 8) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_id, broker_trade_id)
);

-- Create positions table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    type position_type NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8),
    market_value DECIMAL(20, 8),
    unrealized_pnl DECIMAL(20, 8),
    realized_pnl DECIMAL(20, 8),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_id, symbol)
);

-- Create trade_history table for historical data
CREATE TABLE trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open_price DECIMAL(20, 8),
    high_price DECIMAL(20, 8),
    low_price DECIMAL(20, 8),
    close_price DECIMAL(20, 8),
    volume DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_id, symbol, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_broker_connection_id ON accounts(broker_connection_id);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_account_id ON trades(account_id);
CREATE INDEX idx_trades_executed_at ON trades(executed_at);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_account_id ON positions(account_id);
CREATE INDEX idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX idx_trade_history_account_id ON trade_history(account_id);
CREATE INDEX idx_trade_history_symbol_date ON trade_history(symbol, date);

-- Create RLS (Row Level Security) policies
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;

-- Create policies for broker_connections
CREATE POLICY "Users can view their own broker connections"
    ON broker_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker connections"
    ON broker_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections"
    ON broker_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections"
    ON broker_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for accounts
CREATE POLICY "Users can view their own accounts"
    ON accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
    ON accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for trades
CREATE POLICY "Users can view their own trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
    ON trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
    ON trades FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
    ON trades FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for positions
CREATE POLICY "Users can view their own positions"
    ON positions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions"
    ON positions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
    ON positions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
    ON positions FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for trade_history
CREATE POLICY "Users can view their own trade history"
    ON trade_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade history"
    ON trade_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade history"
    ON trade_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade history"
    ON trade_history FOR DELETE
    USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_broker_connections_updated_at
    BEFORE UPDATE ON broker_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_history_updated_at
    BEFORE UPDATE ON trade_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
