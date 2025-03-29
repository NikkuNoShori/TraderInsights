-- Create SnapTrade users table
CREATE TABLE IF NOT EXISTS snap_trade_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snap_trade_user_id TEXT NOT NULL,
  snap_trade_user_secret TEXT NOT NULL,
  connected_brokers TEXT[] DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE snap_trade_users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own SnapTrade data
CREATE POLICY "Users can read their own SnapTrade data"
  ON snap_trade_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own SnapTrade data
CREATE POLICY "Users can insert their own SnapTrade data"
  ON snap_trade_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own SnapTrade data
CREATE POLICY "Users can update their own SnapTrade data"
  ON snap_trade_users
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own SnapTrade data
CREATE POLICY "Users can delete their own SnapTrade data"
  ON snap_trade_users
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_snap_trade_users_updated_at
  BEFORE UPDATE ON snap_trade_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 