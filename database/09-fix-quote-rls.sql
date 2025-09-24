-- Fix the quote to have correct user_id
UPDATE custom_quotes
SET user_id = '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558'
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';

-- Drop and recreate the quotes policy to handle null user_ids
DROP POLICY "Users can view own quotes" ON custom_quotes;

-- New policy: Users can view their quotes OR quotes where user_id is null (admin created)
CREATE POLICY "Users can view accessible quotes" ON custom_quotes FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Also fix payment history policy to work with quotes
DROP POLICY "Users can view own payment history" ON payment_history;

-- New payment history policy: Users can view payments for their quotes or bookings
CREATE POLICY "Users can view own payment history" ON payment_history FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT user_id FROM bookings WHERE id = booking_id) OR
  auth.uid() IN (SELECT user_id FROM custom_quotes WHERE id = quote_id)
);