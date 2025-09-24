-- First, just fix the user_id issue (this is the critical fix)
UPDATE custom_quotes
SET user_id = '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558'
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';

-- Try to drop the policy using the exact name from the query
DROP POLICY IF EXISTS "Users can view own quotes or linked quotes" ON custom_quotes;

-- If that doesn't work, try without quotes
-- DROP POLICY IF EXISTS Users can view own quotes or linked quotes ON custom_quotes;

-- Create the updated policy
CREATE POLICY "Users can view accessible quotes" ON custom_quotes FOR SELECT
USING (
  auth.uid() = user_id OR
  user_id IS NULL OR
  id IN (
    SELECT quote_tokens.quote_id
    FROM quote_tokens
    WHERE quote_tokens.user_id = auth.uid()
  )
);