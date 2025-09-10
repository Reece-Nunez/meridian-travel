-- Add accommodation field to itinerary days
-- This allows tracking accommodation for each day/night of the itinerary

ALTER TABLE itinerary_days 
ADD COLUMN accommodation TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN itinerary_days.accommodation IS 'Accommodation/hotel information for this day/night';