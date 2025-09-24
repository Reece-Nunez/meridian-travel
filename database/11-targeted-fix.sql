-- Fix the quote to have correct user_id
UPDATE custom_quotes
SET user_id = '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558'
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';

-- Update the existing policy to also allow null user_id quotes
DROP POLICY "Users can view own quotes or linked quotes" ON custom_quotes;

CREATE POLICY "Users can view own quotes or linked quotes" ON custom_quotes FOR SELECT
USING (
  auth.uid() = user_id OR
  user_id IS NULL OR
  id IN (
    SELECT quote_tokens.quote_id
    FROM quote_tokens
    WHERE quote_tokens.user_id = auth.uid()
  )
);