-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'custom_quotes';

-- Fix the quote to have correct user_id first
UPDATE custom_quotes
SET user_id = '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558'
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';

-- Drop all existing policies for custom_quotes (safe approach)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'custom_quotes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_record.policyname) || ' ON custom_quotes';
    END LOOP;
END $$;

-- Create new policy: Users can view their quotes OR quotes where user_id is null (admin created)
CREATE POLICY "Users can view accessible quotes" ON custom_quotes FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Recreate insert policy
CREATE POLICY "Users can create quotes" ON custom_quotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also fix payment history policy
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'payment_history' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_record.policyname) || ' ON payment_history';
    END LOOP;
END $$;

-- New payment history policy: Users can view payments for their quotes or bookings
CREATE POLICY "Users can view own payment history" ON payment_history FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT user_id FROM bookings WHERE id = booking_id) OR
  auth.uid() IN (SELECT user_id FROM custom_quotes WHERE id = quote_id)
);