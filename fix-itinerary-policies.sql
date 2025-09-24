-- Fix itinerary RLS policies to support quote_tokens linking
-- This allows users to see itineraries for quotes linked via quote_tokens

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their quote itineraries" ON itinerary_days;
DROP POLICY IF EXISTS "Users can view activities for their quote itineraries" ON itinerary_activities;
DROP POLICY IF EXISTS "Users can view images for their quote itineraries" ON itinerary_images;

-- Create new policies that support both direct user_id and quote_tokens linking

-- Allow users to view itinerary days for quotes either:
-- 1. Directly assigned to them (user_id = auth.uid())
-- 2. Linked to them via quote_tokens table
CREATE POLICY "Users can view their quote itineraries or linked itineraries" ON itinerary_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_quotes
      WHERE custom_quotes.id = itinerary_days.quote_id
      AND (
        custom_quotes.user_id = auth.uid()
        OR custom_quotes.id IN (
          SELECT quote_id FROM quote_tokens
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Allow users to view activities for itinerary days they have access to
CREATE POLICY "Users can view activities for accessible quote itineraries" ON itinerary_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN custom_quotes ON custom_quotes.id = itinerary_days.quote_id
      WHERE itinerary_days.id = itinerary_activities.day_id
      AND (
        custom_quotes.user_id = auth.uid()
        OR custom_quotes.id IN (
          SELECT quote_id FROM quote_tokens
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Allow users to view images for itinerary days they have access to
CREATE POLICY "Users can view images for accessible quote itineraries" ON itinerary_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN custom_quotes ON custom_quotes.id = itinerary_days.quote_id
      WHERE itinerary_days.id = itinerary_images.day_id
      AND (
        custom_quotes.user_id = auth.uid()
        OR custom_quotes.id IN (
          SELECT quote_id FROM quote_tokens
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Verify the policies work by checking if data is accessible
SELECT
  'Testing itinerary policies...' as test,
  id.id as day_id,
  id.day_label,
  id.city,
  cq.id as quote_id,
  cq.destination,
  cq.user_id,
  qt.user_id as token_user_id,
  qt.email as token_email
FROM itinerary_days id
JOIN custom_quotes cq ON cq.id = id.quote_id
LEFT JOIN quote_tokens qt ON cq.id = qt.quote_id
WHERE cq.id = 'b380df37-da01-4f9b-8b44-348800ea40e7'
ORDER BY id.display_order;