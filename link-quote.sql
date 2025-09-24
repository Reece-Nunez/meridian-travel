-- Insert quote token to link the Peru quote to your user account
INSERT INTO quote_tokens (quote_id, user_id, token, email, created_at)
VALUES (
  'b380df37-da01-4f9b-8b44-348800ea40e7',
  '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558',
  'manual_link_token_' || extract(epoch from now())::text,
  'reecenunez20@gmail.com',
  now()
);

-- Verify the insertion
SELECT
  qt.*,
  cq.destination,
  cq.status,
  cq.quoted_price
FROM quote_tokens qt
JOIN custom_quotes cq ON qt.quote_id = cq.id
WHERE qt.user_id = '6cd8e5f4-79d6-4c76-8805-9d0f6fc7d558';