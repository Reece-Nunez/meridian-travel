-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own quotes" ON custom_quotes;

-- Create a new policy that allows users to see quotes either:
-- 1. Directly assigned to them (user_id = auth.uid())
-- 2. Linked to them via quote_tokens table
CREATE POLICY "Users can view own quotes or linked quotes" ON custom_quotes FOR SELECT USING (
  auth.uid() = user_id OR
  id IN (
    SELECT quote_id FROM quote_tokens
    WHERE user_id = auth.uid()
  )
);

-- Verify the policy works
SELECT
  'Testing policy...' as test,
  cq.id,
  cq.destination,
  cq.status,
  cq.user_id,
  qt.user_id as token_user_id,
  qt.email as token_email
FROM custom_quotes cq
LEFT JOIN quote_tokens qt ON cq.id = qt.quote_id
WHERE cq.id = 'b380df37-da01-4f9b-8b44-348800ea40e7';