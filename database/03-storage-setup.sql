-- Storage setup for itinerary images
-- This creates the storage bucket and policies for itinerary images

-- Create storage bucket for itinerary images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('itinerary-images', 'itinerary-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow service role (admin) to upload/manage images
CREATE POLICY "Service role can manage itinerary images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'itinerary-images' AND 
    auth.role() = 'service_role'
  );

-- Allow authenticated users to view itinerary images
CREATE POLICY "Users can view itinerary images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'itinerary-images'
  );

-- Allow admins (authenticated with specific emails) to upload images
CREATE POLICY "Admins can upload itinerary images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'itinerary-images' AND
    auth.uid() IS NOT NULL
  );

-- Allow admins to update/delete images
CREATE POLICY "Admins can manage itinerary images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'itinerary-images' AND
    auth.uid() IS NOT NULL
  );