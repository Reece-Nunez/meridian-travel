-- This migration adds 'Diving Ship' as a valid ship_type option
-- No table alteration needed since ship_type is already a VARCHAR field
-- This is just for documentation purposes

-- You can now use 'Diving Ship' as a ship_type value
-- Valid ship_types include:
-- - 'Expedition vessel'
-- - 'Luxury yacht'
-- - 'Cruise ship'
-- - 'River cruise'
-- - 'Yacht'
-- - 'Diving Ship' (NEW)

-- Example update (if you want to set an existing ship to Diving Ship):
-- UPDATE ships SET ship_type = 'Diving Ship' WHERE id = 'your-ship-id';

COMMENT ON COLUMN ships.ship_type IS 'Type of ship: Expedition vessel, Luxury yacht, Cruise ship, River cruise, Yacht, Diving Ship, etc.';
