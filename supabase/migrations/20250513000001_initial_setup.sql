-- Core functions for database maintenance
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create developer mode function in public schema instead of auth schema
CREATE OR REPLACE FUNCTION public.is_dev_mode()
RETURNS boolean AS $$
BEGIN
  RETURN current_setting('request.headers', true)::json->>'x-dev-mode' = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Functions for role-based access
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = required_role OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 