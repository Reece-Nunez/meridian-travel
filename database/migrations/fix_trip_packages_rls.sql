-- Fix trip_packages RLS policies to allow admin updates
-- The issue: The current "Admins can manage trip packages" policy uses USING (true)
-- which doesn't work properly in all contexts. We need separate policies for each operation.

-- Drop existing policies
DROP POLICY IF EXISTS "Trip packages are publicly readable" ON trip_packages;
DROP POLICY IF EXISTS "Admins can manage trip packages" ON trip_packages;

-- Public read access for active packages
CREATE POLICY "Public can view active packages"
ON trip_packages
FOR SELECT
USING (is_active = true);

-- Authenticated users (admins) can view all packages
CREATE POLICY "Authenticated users can view all packages"
ON trip_packages
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users (admins) can insert packages
CREATE POLICY "Authenticated users can insert packages"
ON trip_packages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users (admins) can update packages
CREATE POLICY "Authenticated users can update packages"
ON trip_packages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users (admins) can delete packages
CREATE POLICY "Authenticated users can delete packages"
ON trip_packages
FOR DELETE
TO authenticated
USING (true);
