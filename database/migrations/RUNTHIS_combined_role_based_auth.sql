-- =====================================================
-- Combined Migration: Role-Based Authentication System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create user_role enum type (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Step 3: Update existing admin users to have admin role
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('chris@meridianluxury.travel', 'reece@nunezdev.com')
);

-- Step 4: Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 5: Drop all existing RLS policies on profiles (to fix infinite recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Step 6: Create simple, non-recursive RLS policies
-- Users can always view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: We don't add "admin can view/update all profiles" policies
-- because they cause infinite recursion when checking if user is admin.
-- Admins use service role key via API routes for admin operations.

-- Step 7: Function to automatically create profile with role when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.email IN ('chris@meridianluxury.travel', 'reece@nunezdev.com')
      THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to run function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Done! You should see output like:
-- DO
-- ALTER TABLE
-- UPDATE X (where X is the number of admin users updated)
-- CREATE INDEX
-- DROP POLICY (multiple times)
-- CREATE POLICY (3 times)
-- CREATE FUNCTION
-- DROP TRIGGER
-- CREATE TRIGGER
-- ALTER TABLE
