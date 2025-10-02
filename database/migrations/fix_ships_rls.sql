-- Fix RLS policies for ships table to allow admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active ships" ON ships;
DROP POLICY IF EXISTS "Authenticated users can manage ships" ON ships;

-- Create new policies
-- Policy 1: Anyone can view active ships (for public pages)
CREATE POLICY "Public can view active ships" ON ships
    FOR SELECT
    USING (is_active = true);

-- Policy 2: Authenticated users can view all ships (for admin)
CREATE POLICY "Authenticated users can view all ships" ON ships
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy 3: Authenticated users can insert ships
CREATE POLICY "Authenticated users can insert ships" ON ships
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Authenticated users can update ships
CREATE POLICY "Authenticated users can update ships" ON ships
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Policy 5: Authenticated users can delete ships
CREATE POLICY "Authenticated users can delete ships" ON ships
    FOR DELETE
    USING (auth.role() = 'authenticated');
