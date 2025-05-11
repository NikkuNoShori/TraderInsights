-- Fix RLS policies for snaptrade_credentials table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SnapTrade credentials" ON snaptrade_credentials;
DROP POLICY IF EXISTS "Users can insert their own SnapTrade credentials" ON snaptrade_credentials;
DROP POLICY IF EXISTS "Users can update their own SnapTrade credentials" ON snaptrade_credentials;
DROP POLICY IF EXISTS "Users can delete their own SnapTrade credentials" ON snaptrade_credentials;

-- Create updated policies with explicit auth.uid() comparison
CREATE POLICY "Users can view their own SnapTrade credentials"
ON snaptrade_credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SnapTrade credentials"
ON snaptrade_credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SnapTrade credentials"
ON snaptrade_credentials FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SnapTrade credentials"
ON snaptrade_credentials FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON TABLE snaptrade_credentials TO authenticated;

-- Verify the table exists and has the correct structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'snaptrade_credentials'
) AS table_exists; 