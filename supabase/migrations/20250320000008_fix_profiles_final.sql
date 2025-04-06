-- Make first_name and last_name nullable if they aren't already
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
  EXCEPTION
    WHEN others THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;
  EXCEPTION
    WHEN others THEN NULL;
  END;
END $$;

-- Create profiles for any users that don't have one
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
AND u.id != '00000000-0000-0000-0000-000000000000'
ON CONFLICT (id) DO NOTHING;

-- Update the developer profile if it exists
UPDATE public.profiles
SET 
  first_name = 'Developer',
  last_name = 'Mode',
  username = 'developer',
  role = 'developer'
WHERE id = '00000000-0000-0000-0000-000000000000'; 