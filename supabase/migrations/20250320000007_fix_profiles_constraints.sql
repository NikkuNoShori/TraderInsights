-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create missing profiles for existing users
DO $$
BEGIN
  INSERT INTO public.profiles (id, email)
  SELECT id, email 
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.id = u.id
  )
  AND id != '00000000-0000-0000-0000-000000000000'; -- Exclude the developer user
END;
$$; 