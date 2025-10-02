-- Fix RLS policies to allow public read access for public tables
-- while keeping admin write access protected

-- Site Settings - Allow public read access
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings" ON site_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
CREATE POLICY "Authenticated users can manage site settings" ON site_settings
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Content Sections - Allow public read access for active content
DROP POLICY IF EXISTS "Public can view active content" ON content_sections;
CREATE POLICY "Public can view active content" ON content_sections
    FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage content" ON content_sections;
CREATE POLICY "Authenticated users can manage content" ON content_sections
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Ships - Allow public read access for active ships
DROP POLICY IF EXISTS "Public can view active ships" ON ships;
CREATE POLICY "Public can view active ships" ON ships
    FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can view all ships" ON ships;
CREATE POLICY "Authenticated users can view all ships" ON ships
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert ships" ON ships;
CREATE POLICY "Authenticated users can insert ships" ON ships
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update ships" ON ships;
CREATE POLICY "Authenticated users can update ships" ON ships
    FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete ships" ON ships;
CREATE POLICY "Authenticated users can delete ships" ON ships
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Trip Packages - Allow public read access
DROP POLICY IF EXISTS "Public can view trip packages" ON trip_packages;
CREATE POLICY "Public can view trip packages" ON trip_packages
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage trip packages" ON trip_packages;
CREATE POLICY "Authenticated users can manage trip packages" ON trip_packages
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Custom Quotes - Users can only see their own quotes
DROP POLICY IF EXISTS "Users can view own quotes" ON custom_quotes;
CREATE POLICY "Users can view own quotes" ON custom_quotes
    FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage all quotes" ON custom_quotes;
CREATE POLICY "Authenticated users can manage all quotes" ON custom_quotes
    FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can insert quotes" ON custom_quotes;
CREATE POLICY "Anyone can insert quotes" ON custom_quotes
    FOR INSERT
    WITH CHECK (true);

-- Profiles - Users can view their own profile, admins can view all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can manage all profiles" ON profiles;
CREATE POLICY "Authenticated users can manage all profiles" ON profiles
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Quote Tokens - Public read access for validation
DROP POLICY IF EXISTS "Anyone can validate quote tokens" ON quote_tokens;
CREATE POLICY "Anyone can validate quote tokens" ON quote_tokens
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage quote tokens" ON quote_tokens;
CREATE POLICY "Authenticated users can manage quote tokens" ON quote_tokens
    FOR ALL
    USING (auth.role() = 'authenticated');
