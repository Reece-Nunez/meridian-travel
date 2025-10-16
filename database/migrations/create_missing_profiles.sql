-- Create profiles for existing auth.users who don't have a profile yet
-- This handles users created before the trigger was added

INSERT INTO public.profiles (id, role, created_at, updated_at)
SELECT
  au.id,
  CASE
    WHEN au.email IN ('chris@meridianluxury.travel', 'reece@nunezdev.com')
    THEN 'admin'::user_role
    ELSE 'user'::user_role
  END as role,
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the profiles were created
SELECT
  au.email,
  p.role,
  p.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at;
