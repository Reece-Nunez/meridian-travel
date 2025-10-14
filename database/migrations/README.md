# Database Migrations

This directory contains SQL migration files for the Meridian Travel database.

## Required Migrations for Latest Features

To enable all features from the latest commit, ensure these migrations are applied:

### 1. Cabin Categories Table
**File:** `create_cabin_categories_table.sql`
**Purpose:** Creates the cabin_categories table for managing cabin pricing, images, and details.

```bash
PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -f database/migrations/create_cabin_categories_table.sql
```

### 2. Diving Ship Type
**File:** `add_diving_ship_type.sql`
**Purpose:** Documents the addition of "Diving Ship" as a valid ship_type (already supported in code).

```bash
PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -f database/migrations/add_diving_ship_type.sql
```

### 3. Cruise Integration
**File:** `add_cruise_integration.sql`
**Purpose:** Adds cruise-related fields to trip_packages table for unified package/cruise management.

```bash
PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -f database/migrations/add_cruise_integration.sql
```

## Apply All Migrations

To apply all required migrations at once:

```bash
# For production (Supabase)
for file in database/migrations/create_cabin_categories_table.sql \
            database/migrations/add_diving_ship_type.sql \
            database/migrations/add_cruise_integration.sql; do
  echo "Applying $file..."
  PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -f "$file"
done
```

```bash
# For local development
for file in database/migrations/create_cabin_categories_table.sql \
            database/migrations/add_diving_ship_type.sql \
            database/migrations/add_cruise_integration.sql; do
  echo "Applying $file..."
  PGPASSWORD=postgres psql -h localhost -U postgres -d meridian_travel -f "$file"
done
```

## Verify Migrations

After applying migrations, verify they were successful:

```bash
# Check cabin_categories table exists
PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -c "\d+ cabin_categories"

# Check trip_packages has cruise integration fields
PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -c "\d+ trip_packages"
```

## Features Enabled by These Migrations

1. **Cabin Categories with Pricing**
   - Admin can manage cabin categories with pricing per person
   - Each cabin can have multiple images, amenities, size, and occupancy info
   - Access via: Admin → Ships → [Select Ship] → Manage Cabins

2. **Diving Ship Category**
   - "Diving Ship" now available in ship type dropdown
   - Dedicated section for diving cruises on the cruise page

3. **Cruise Integration in Custom Quotes**
   - Add cruises directly to custom itineraries
   - Select ship, cabin category, embarkation/disembarkation ports

## Migration Order

Always apply migrations in this order to avoid dependency issues:
1. `create_ships_table.sql` (already applied)
2. `create_cabin_categories_table.sql` (new)
3. `add_cruise_integration.sql` (new)
4. `add_diving_ship_type.sql` (documentation only)
5. RLS policy fixes as needed
