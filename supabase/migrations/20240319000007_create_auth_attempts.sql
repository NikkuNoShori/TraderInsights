-- Create auth_attempts table
DROP TABLE IF EXISTS public.auth_attempts;
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  success boolean NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Allow admins and developers to view auth attempts" ON public.auth_attempts;

-- Create policy for inserting attempts (allow all authenticated users)
CREATE POLICY "Allow authenticated users to insert auth attempts"
  ON public.auth_attempts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for viewing attempts (allow only admins and developers)
CREATE POLICY "Allow admins and developers to view auth attempts"
  ON public.auth_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'developer')
    )
  );

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS auth_attempts_ip_address_idx;
DROP INDEX IF EXISTS auth_attempts_timestamp_idx;
DROP INDEX IF EXISTS auth_attempts_success_idx;

-- Create indexes for better query performance
CREATE INDEX auth_attempts_ip_address_idx ON public.auth_attempts(ip_address);
CREATE INDEX auth_attempts_timestamp_idx ON public.auth_attempts(timestamp);
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
-- Check if cron extension exists to avoid errors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    EXECUTE 'SELECT cron.schedule(
      ''cleanup-auth-attempts'',
      ''0 0 * * *'', -- Run at midnight every day
      ''SELECT clean_old_auth_attempts();''
    )';
  END IF;
END $$;