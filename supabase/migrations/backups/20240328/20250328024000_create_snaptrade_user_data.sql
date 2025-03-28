-- Create table for storing SnapTrade user data
CREATE TABLE IF NOT EXISTS public.snaptrade_user_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snaptrade_user_id VARCHAR(255) NOT NULL,
    snaptrade_user_secret VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(snaptrade_user_id)
);

-- Add RLS policies
ALTER TABLE public.snaptrade_user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SnapTrade data"
    ON public.snaptrade_user_data
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SnapTrade data"
    ON public.snaptrade_user_data
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SnapTrade data"
    ON public.snaptrade_user_data
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SnapTrade data"
    ON public.snaptrade_user_data
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_snaptrade_user_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_snaptrade_user_data_updated_at
    BEFORE UPDATE ON public.snaptrade_user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_snaptrade_user_data_updated_at(); 