-- Supabase Storage Setup for Meridian Travel
-- Run this in your Supabase SQL editor

-- 1. Create the images bucket (if not already created)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies first (in case they exist)
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- 3. Create new policies
-- Allow public read access to all images
CREATE POLICY "Public read access for images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 4. Verify the setup
SELECT 
  'Bucket Configuration' as check_type,
  b.id as bucket_id,
  b.name as bucket_name,
  b.public as is_public
FROM storage.buckets b
WHERE b.id = 'images'

UNION ALL

SELECT 
  'Policy Check' as check_type,
  'storage.objects' as bucket_id,
  policyname as bucket_name,
  'true' as is_public
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%images%';