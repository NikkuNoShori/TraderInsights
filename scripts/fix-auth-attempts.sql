-- Fix auth_attempts table structure
-- Drop existing indexes
DROP INDEX IF EXISTS auth_attempts_ip_address_idx;
DROP INDEX IF EXISTS auth_attempts_timestamp_idx;
DROP INDEX IF EXISTS auth_attempts_success_idx;

-- Check if timestamp column exists, add it if not
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auth_attempts' 
    AND column_name = 'timestamp'
  ) THEN
    ALTER TABLE public.auth_attempts ADD COLUMN timestamp timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Recreate indexes
CREATE INDEX auth_attempts_ip_address_idx ON public.auth_attempts(ip_address);
CREATE INDEX auth_attempts_timestamp_idx ON public.auth_attempts(timestamp);
CREATE INDEX auth_attempts_success_idx ON public.auth_attempts(success); 