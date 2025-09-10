-- Package enhancements: Add luxury highlights and itinerary images
-- Update trip_packages table to include luxury highlights

ALTER TABLE trip_packages 
ADD COLUMN IF NOT EXISTS luxury_highlights TEXT[]; -- Array of luxury highlight items

-- The itinerary column is already JSONB, so we can add images within the day objects
-- This migration will update existing itinerary data to include an images array for each day
-- The structure will be: { day: 1, title: "...", activities: [...], accommodation: "...", images: [...] }

-- Note: Existing itinerary data will work as-is, new images field will be added as needed
-- when admins update package itineraries through the admin interface