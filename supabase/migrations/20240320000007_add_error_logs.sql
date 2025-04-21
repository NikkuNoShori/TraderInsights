-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  component_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users"
  ON public.error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow select for developers and admins
CREATE POLICY "Allow select for developers and admins"
  ON public.error_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('developer', 'admin')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER handle_error_logs_updated_at
  BEFORE UPDATE ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 