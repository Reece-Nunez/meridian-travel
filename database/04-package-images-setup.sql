-- Storage setup for package images
-- This creates the storage bucket and policies for package images
-- Run this in your Supabase SQL editor

-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first (in case they exist)
DROP POLICY IF EXISTS "Public read access to package images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete package images" ON storage.objects;

-- Allow public read access to package images (since they're for display)
CREATE POLICY "Public read access to package images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'package-images'
  );

-- Allow service role (admin) full access to manage images
CREATE POLICY "Service role can manage package images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'package-images'
  );

-- Allow authenticated users to upload package images
CREATE POLICY "Authenticated users can upload package images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'package-images' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update package images
CREATE POLICY "Authenticated users can update package images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'package-images' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete package images
CREATE POLICY "Authenticated users can delete package images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'package-images' AND
    auth.role() = 'authenticated'
  );

-- Verify the setup
SELECT
  'Bucket Configuration' as check_type,
  b.id as bucket_id,
  b.name as bucket_name,
  b.public::text as is_public
FROM storage.buckets b
WHERE b.id = 'package-images'

UNION ALL

SELECT
  'Policy Check' as check_type,
  'storage.objects' as bucket_id,
  policyname as bucket_name,
  'true' as is_public
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%package images%';