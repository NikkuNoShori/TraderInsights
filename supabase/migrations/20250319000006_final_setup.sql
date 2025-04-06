-- Create updated_at triggers for all tables
DO $$
BEGIN
  -- Create triggers only if tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE OR REPLACE TRIGGER handle_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    CREATE OR REPLACE TRIGGER handle_transactions_updated_at
      BEFORE UPDATE ON public.transactions
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_orders') THEN
    CREATE OR REPLACE TRIGGER handle_transaction_orders_updated_at
      BEFORE UPDATE ON public.transaction_orders
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_watchlists') THEN
    CREATE OR REPLACE TRIGGER handle_user_watchlists_updated_at
      BEFORE UPDATE ON public.user_watchlists
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'symbols_watched') THEN
    CREATE OR REPLACE TRIGGER handle_symbols_watched_updated_at
      BEFORE UPDATE ON public.symbols_watched
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'screener_presets') THEN
    CREATE OR REPLACE TRIGGER handle_screener_presets_updated_at
      BEFORE UPDATE ON public.screener_presets
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Create developer mode function
CREATE OR REPLACE FUNCTION auth.is_dev_mode()
RETURNS boolean AS $$
BEGIN
  RETURN current_setting('request.headers', true)::json->>'x-dev-mode' = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add developer mode policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for profiles" ON public.profiles;
    CREATE POLICY "Developer mode bypass for profiles"
      ON public.profiles
      USING (auth.is_dev_mode() OR auth.uid() = id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for transactions" ON public.transactions;
    CREATE POLICY "Developer mode bypass for transactions"
      ON public.transactions
      USING (auth.is_dev_mode() OR auth.uid() = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_orders') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for transaction orders" ON public.transaction_orders;
    CREATE POLICY "Developer mode bypass for transaction orders"
      ON public.transaction_orders
      USING (
        auth.is_dev_mode() OR
        EXISTS (
          SELECT 1 FROM public.transactions t
          WHERE t.id = transaction_orders.transaction_id
          AND t.user_id = auth.uid()
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_watchlists') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for watchlists" ON public.user_watchlists;
    CREATE POLICY "Developer mode bypass for watchlists"
      ON public.user_watchlists
      USING (auth.is_dev_mode() OR auth.uid() = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'symbols_watched') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for symbols" ON public.symbols_watched;
    CREATE POLICY "Developer mode bypass for symbols"
      ON public.symbols_watched
      USING (auth.is_dev_mode() OR auth.uid() = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'screener_presets') THEN
    DROP POLICY IF EXISTS "Developer mode bypass for screener presets" ON public.screener_presets;
    CREATE POLICY "Developer mode bypass for screener presets"
      ON public.screener_presets
      USING (auth.is_dev_mode() OR auth.uid() = user_id);
  END IF;
END $$;

-- Create test users and profiles
DO $$
DECLARE
  dev_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Temporarily disable the profile creation trigger
  DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

  -- Insert developer user if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    dev_user_id,
    'authenticated',
    'authenticated',
    'developer@stackblitz.com',
    crypt('dev123', gen_salt('bf')),
    now(),
    jsonb_build_object(
      'first_name', 'Developer',
      'last_name', 'Mode',
      'username', 'developer',
      'role', 'developer'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert developer profile if not exists
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    username,
    role,
    created_at,
    updated_at
  ) VALUES (
    dev_user_id,
    'developer@stackblitz.com',
    'Developer',
    'Mode',
    'developer',
    'developer',
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert default watchlist for developer if not exists
  INSERT INTO public.user_watchlists (
    user_id,
    name,
    description,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    dev_user_id,
    'Default Watchlist',
    'Your default watchlist',
    true,
    now(),
    now()
  ) ON CONFLICT (user_id, name) DO NOTHING;

  -- Re-enable the profile creation trigger
  CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
END $$;
