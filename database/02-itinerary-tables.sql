-- Itinerary system tables for custom quotes
-- This allows admins to create beautiful, detailed itineraries

-- Main itinerary days table
CREATE TABLE itinerary_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES custom_quotes(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL, -- e.g., "Days 1 & 2", "Day 3", "Days 5-7"
  start_date DATE NOT NULL, -- Actual calendar date
  end_date DATE, -- NULL for single days, set for ranges
  city TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activities within each day
CREATE TABLE itinerary_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('flight', 'tour', 'excursion', 'activity', 'custom')),
  custom_type TEXT, -- Only used when activity_type = 'custom'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Images for each day (multiple images per day)
CREATE TABLE itinerary_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Supabase storage URL
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX itinerary_days_quote_id_idx ON itinerary_days(quote_id);
CREATE INDEX itinerary_days_display_order_idx ON itinerary_days(display_order);
CREATE INDEX itinerary_activities_day_id_idx ON itinerary_activities(day_id);
CREATE INDEX itinerary_activities_display_order_idx ON itinerary_activities(display_order);
CREATE INDEX itinerary_images_day_id_idx ON itinerary_images(day_id);
CREATE INDEX itinerary_images_display_order_idx ON itinerary_images(display_order);

-- RLS (Row Level Security) policies
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_images ENABLE ROW LEVEL SECURITY;

-- Allow service role (admin) full access
CREATE POLICY "Service role can manage itinerary_days" ON itinerary_days
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage itinerary_activities" ON itinerary_activities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage itinerary_images" ON itinerary_images
  FOR ALL USING (auth.role() = 'service_role');

-- Allow users to view itineraries for their own quotes
CREATE POLICY "Users can view their quote itineraries" ON itinerary_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_quotes 
      WHERE custom_quotes.id = itinerary_days.quote_id 
      AND custom_quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view activities for their quote itineraries" ON itinerary_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itinerary_days 
      JOIN custom_quotes ON custom_quotes.id = itinerary_days.quote_id
      WHERE itinerary_days.id = itinerary_activities.day_id 
      AND custom_quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view images for their quote itineraries" ON itinerary_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itinerary_days 
      JOIN custom_quotes ON custom_quotes.id = itinerary_days.quote_id
      WHERE itinerary_days.id = itinerary_images.day_id 
      AND custom_quotes.user_id = auth.uid()
    )
  );