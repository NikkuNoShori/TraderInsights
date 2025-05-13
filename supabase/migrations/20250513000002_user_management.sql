-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  username text UNIQUE,
  username_changes_remaining INTEGER DEFAULT 2,
  last_username_change TIMESTAMPTZ,
  role user_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies with IF NOT EXISTS
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Developer mode bypass for profiles" ON public.profiles;
CREATE POLICY "Developer mode bypass for profiles"
  ON public.profiles
  USING (public.is_dev_mode() OR auth.uid() = id);

DROP POLICY IF EXISTS "Only admins and developers can change roles" ON public.profiles;
CREATE POLICY "Only admins and developers can change roles"
  ON public.profiles FOR UPDATE
  USING (
      EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'developer')
      )
  )
  WITH CHECK (
      EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'developer')
      )
  );

-- Create profile on signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on signup trigger if it doesn't exist
DO $$
BEGIN
  -- Check if the trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Create the trigger only if it doesn't exist
    EXECUTE 'CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user()';
  END IF;
END
$$;

-- Create username validation function
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Check username format (alphanumeric, underscores, 3-20 chars)
  IF NOT NEW.username ~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create username validation trigger
DROP TRIGGER IF EXISTS validate_username_trigger ON public.profiles;
CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

-- Create username changes tracking function
CREATE OR REPLACE FUNCTION track_username_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    IF NEW.username_changes_remaining <= 0 THEN
      RAISE EXCEPTION 'No username changes remaining';
    END IF;
    NEW.username_changes_remaining := NEW.username_changes_remaining - 1;
    NEW.last_username_change := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create username changes tracking trigger
DROP TRIGGER IF EXISTS track_username_changes_trigger ON public.profiles;
CREATE TRIGGER track_username_changes_trigger
  BEFORE UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION track_username_changes();

-- Create updated_at trigger
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
DROP INDEX IF EXISTS profiles_username_idx;
CREATE INDEX profiles_username_idx ON public.profiles(username);

-- Create auth_attempts table
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  success boolean NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting attempts (allow all authenticated users)
DROP POLICY IF EXISTS "Allow authenticated users to insert auth attempts" ON public.auth_attempts;
CREATE POLICY "Allow authenticated users to insert auth attempts"
  ON public.auth_attempts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for viewing attempts (allow only admins and developers)
DROP POLICY IF EXISTS "Allow admins and developers to view auth attempts" ON public.auth_attempts;
CREATE POLICY "Allow admins and developers to view auth attempts"
  ON public.auth_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'developer')
    )
  );

-- Create indexes for better query performance
DROP INDEX IF EXISTS auth_attempts_ip_address_idx;
CREATE INDEX auth_attempts_ip_address_idx ON public.auth_attempts(ip_address);

DROP INDEX IF EXISTS auth_attempts_timestamp_idx;
CREATE INDEX auth_attempts_timestamp_idx ON public.auth_attempts(timestamp);

DROP INDEX IF EXISTS auth_attempts_success_idx;
CREATE INDEX auth_attempts_success_idx ON public.auth_attempts(success);

-- Create function to clean up old attempts
CREATE OR REPLACE FUNCTION clean_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_attempts
  WHERE timestamp < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old attempts daily
DO $$
BEGIN
  -- Drop the schedule if it exists
  PERFORM cron.unschedule('cleanup-auth-attempts');
  -- Create a new schedule
  PERFORM cron.schedule(
    'cleanup-auth-attempts',
    '0 0 * * *', -- Run at midnight every day
    'SELECT clean_old_auth_attempts();'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors, which might happen if cron extension is not available
    NULL;
END
$$;

-- Insert developer profile
DO $$
DECLARE
  dev_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
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
END $$; 