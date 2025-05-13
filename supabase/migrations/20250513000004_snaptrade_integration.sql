-- Create snaptrade_credentials table
CREATE TABLE IF NOT EXISTS snaptrade_credentials (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    snaptrade_user_id text not null,
    snaptrade_user_secret text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id)
);

-- Create index for quick lookup
DROP INDEX IF EXISTS idx_snaptrade_credentials_user_id;
CREATE INDEX idx_snaptrade_credentials_user_id ON snaptrade_credentials(user_id);

-- Enable Row Level Security
ALTER TABLE snaptrade_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
DROP POLICY IF EXISTS "Users can view their own SnapTrade credentials" ON snaptrade_credentials;
CREATE POLICY "Users can view their own SnapTrade credentials"
ON snaptrade_credentials FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own SnapTrade credentials" ON snaptrade_credentials;
CREATE POLICY "Users can insert their own SnapTrade credentials"
ON snaptrade_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own SnapTrade credentials" ON snaptrade_credentials;
CREATE POLICY "Users can update their own SnapTrade credentials"
ON snaptrade_credentials FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own SnapTrade credentials" ON snaptrade_credentials;
CREATE POLICY "Users can delete their own SnapTrade credentials"
ON snaptrade_credentials FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_snaptrade_credentials_updated_at ON snaptrade_credentials;
CREATE TRIGGER handle_snaptrade_credentials_updated_at
  BEFORE UPDATE ON snaptrade_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT usage ON schema public TO authenticated;
GRANT all privileges ON table snaptrade_credentials TO authenticated; 