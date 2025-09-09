-- Add 'booked' status to custom_quotes table
ALTER TABLE custom_quotes DROP CONSTRAINT IF EXISTS custom_quotes_status_check;
ALTER TABLE custom_quotes ADD CONSTRAINT custom_quotes_status_check 
  CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'booked'));