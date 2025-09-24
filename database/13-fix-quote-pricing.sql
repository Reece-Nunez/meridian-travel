-- Update the quote to have proper pricing breakdown
-- Assuming $14000 is the total for 6 people (4 adults + 2 children)
-- Let's set reasonable pricing: $2800/adult, $1400/child
UPDATE custom_quotes
SET pricing_breakdown = '{
  "adults": {"count": 4, "price": 2800},
  "children": {"count": 2, "price": 1400}
}',
quoted_price = 14000
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';

-- Verify the update
SELECT id, pricing_breakdown, quoted_price, participants
FROM custom_quotes
WHERE id = 'b380df37-da01-4f9b-8b44-348800ea40e7';