-- Storage setup for itinerary images
-- This creates the storage bucket and policies for itinerary images
-- Note: The bucket will be created automatically by the API if it doesn't exist

-- Create storage bucket for itinerary images (backup - API will create if needed)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('itinerary-images', 'itinerary-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow service role (admin) full access to manage images
CREATE POLICY "Service role can manage itinerary images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'itinerary-images'
  );

-- Allow public read access to itinerary images (since they're for display)
CREATE POLICY "Public read access to itinerary images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'itinerary-images'
  );