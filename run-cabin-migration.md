# Run Cabin Categories Migration

Please run this SQL file on your Supabase production database:

**File:** `database/migrations/create_cabin_categories_table.sql`

## Steps:
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database/migrations/create_cabin_categories_table.sql`
4. Paste and execute it

This will create the `cabin_categories` table with:
- pricing_per_person field
- multiple images support (as an array)
- detailed cabin information (description, amenities, size, etc.)

Once you've run this, let me know and I'll continue with the implementation!
