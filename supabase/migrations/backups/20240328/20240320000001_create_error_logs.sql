-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  stack text,
  component_name text,
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create maintenance table to track last cleanup
CREATE TABLE IF NOT EXISTS public.error_logs_maintenance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  last_cleanup_at timestamptz NOT NULL DEFAULT now()
);

-- Insert initial record
INSERT INTO public.error_logs_maintenance (last_cleanup_at) VALUES (now());

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting logs (allow all authenticated users)
CREATE POLICY "Allow authenticated users to insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for viewing logs (allow only admins and developers)
CREATE POLICY "Allow admins and developers to view error logs"
  ON public.error_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'developer')
    )
  );

-- Create indexes for better query performance
CREATE INDEX error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX error_logs_severity_idx ON public.error_logs(severity);
CREATE INDEX error_logs_timestamp_idx ON public.error_logs(timestamp);

-- Create function to clean up old logs and update last cleanup time
CREATE OR REPLACE FUNCTION clean_old_error_logs()
RETURNS void AS $$
BEGIN
  -- Delete old logs
  DELETE FROM public.error_logs
  WHERE timestamp < now() - INTERVAL '30 days';
  
  -- Update last cleanup time
  UPDATE public.error_logs_maintenance
  SET last_cleanup_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if cleanup is needed
CREATE OR REPLACE FUNCTION should_cleanup_logs()
RETURNS boolean AS $$
DECLARE
  last_cleanup timestamptz;
BEGIN
  SELECT last_cleanup_at INTO last_cleanup
  FROM public.error_logs_maintenance
  LIMIT 1;
  
  RETURN last_cleanup < now() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function
CREATE OR REPLACE FUNCTION trigger_cleanup_old_logs()
RETURNS trigger AS $$
BEGIN
  IF (SELECT should_cleanup_logs()) THEN
    PERFORM clean_old_error_logs();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER cleanup_old_logs_trigger
  AFTER INSERT ON public.error_logs
  EXECUTE FUNCTION trigger_cleanup_old_logs(); 