# Meridian Luxury Travel

Marketing and operations site for Meridian Luxury Travel. It showcases destinations/packages, collects custom trip quote requests, and supports admin workflows to manage quotes, content, and payments leading to confirmed bookings.

## Tech Stack

- Next.js 15 (App Router, TypeScript, Turbopack)
- React 19
- Tailwind CSS v4
- Framer Motion (UI motion)
- Supabase (Postgres, Auth, Storage)
- Stripe (payments + webhooks)

## Quick Start

Prerequisites: Node 20+, npm. A Supabase project and a Stripe account.

1) Install dependencies

```bash
npm install
```

2) Configure environment variables in `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only

# Stripe (server-side)
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Notes:
- The service role key is used server-side by API routes. Never expose it to the client.
- If you later add client-side Stripe Elements, you’ll also need `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

3) Start the dev server

```bash
npm run dev
```

Visit http://localhost:3000.

## Database & Content

All SQL definitions and helper migrations live in `database/`. Core tables include:

- CMS: `content_sections`, `site_settings`
- Quotes & Bookings: `custom_quotes`, `bookings`, `payment_history`, `itinerary_days`, `itinerary_activities`, `itinerary_images`
- Packages: `trip_packages`
- Payments: created by migrations (e.g. `07-payment-intents.sql`) for Stripe intent tracking

Suggested setup (run in Supabase SQL editor):

1) Apply `database/schema.sql`
2) Apply additional migrations in numeric order (e.g., `03-storage-setup.sql`, `05-cms-tables.sql`, etc.)

### Seed/Sync Content

Scripts pull the current fallback text from the app into Supabase so the CMS mirrors what’s visible on the site.

```bash
# Populate base CMS content (content_sections)
npm run populate-cms

# Clear and repopulate CMS content
npm run reset-cms

# Populate broader content (see scripts/ for details)
npm run populate-all-cms

# Seed the blog with cornerstone SEO articles (upserts by slug; idempotent)
npm run seed-blog
```

## Blog / SEO Content Engine

A CMS-backed blog for organic search traffic. See `docs/GROWTH-PLAYBOOK.md` for
the full strategy.

- **Public:** `/blog` (index) and `/blog/<slug>` — server-rendered with per-post
  metadata, Article + Breadcrumb JSON-LD, an RSS feed at `/blog/rss.xml`, and
  automatic `sitemap.xml` inclusion. Each post has an email lead-capture and a
  quote CTA.
- **Admin:** `/admin/blog` — create/edit/publish posts with the shared
  `RichTextEditor` and a live SEO helper. Writes go through
  `/api/admin/blog` (service role, `requireAdmin`).
- **Data:** `blog_posts` table — run `database/15-blog-posts.sql` once against
  Supabase, then `npm run seed-blog` to load the starter articles.
- **Note:** unlike the permissive `content_sections` RLS, `blog_posts` only
  allows public reads of published rows; all writes go through the admin API.

## Key App Areas

- Public site: Home, Destinations, Packages, Guides (blog), About, Contact, Quote form.
  - Content reads from Supabase via `src/lib/content.ts` with robust fallbacks + caching for local/dev.
- Admin: `/admin` dashboard for quotes, content, packages, blog, settings.
  - Temporary auth uses hardcoded credentials (see below). Replace before production.
- Payments: Stripe intent creation and webhook handling update DB and create bookings.

## Admin Access (Temporary)

The current demo uses a simple localStorage session with hardcoded credentials:

- Email: `chris@meridianluxury.travel`
- Password: `MeridianAdmin2024!`

Files:
- `src/hooks/useSimpleAdminAuth.ts`
- `src/app/admin/login/page.tsx`

Important:
- Replace this with proper authentication (e.g., Supabase Auth) before any production deployment.
- Sessions currently expire after ~8 hours; access is limited to the configured email.

## API Endpoints (Server Routes)

- POST `/api/quotes`
  - Validates and stores a custom quote request in `custom_quotes`.
- POST `/api/payments/create-intent`
  - Creates a Stripe Payment Intent for an approved quote and stores intent in the payments table.
- POST `/api/payments/webhook`
  - Verifies Stripe webhook signature; updates payment status and creates a booking on successful payment.
- POST `/api/admin/upload-image`
  - Auth-checks a small allowlist of emails; uploads itinerary images to Supabase Storage (`itinerary-images` bucket) and returns a public URL.

All endpoints rely on environment variables; if missing, they fail safely with clear error messages.

## Directory Structure

- `src/app` – App Router routes (public pages, admin, API routes)
- `src/lib` – Supabase client setup, content helpers
- `src/types` – TypeScript definitions for database tables
- `database` – SQL schema and migrations
- `scripts` – Node scripts to seed/reset CMS content
- `public` – Static assets (images, videos)

## Development Notes

- Content fallbacks: If Supabase env vars are missing, the app renders from static fallbacks and logs warnings.
- Image upload: The API auto-creates the `itinerary-images` bucket if missing, then retries the upload.
- Stripe: Ensure webhook forwarding in dev (e.g., `stripe listen --forward-to localhost:3000/api/payments/webhook`).

## Deployment

- Provide the same environment variables in your hosting provider.
- Ensure Stripe webhook endpoint and secret are configured per environment.
- Replace temporary admin auth with a real auth flow before production.

## Troubleshooting

- “Supabase env missing” warnings
  - Verify `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Quote submission returns 500
  - Check server logs for missing Supabase envs or RLS issues; confirm `custom_quotes` exists and RLS allows server inserts.
- Stripe webhook 400/500
  - Confirm `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; check signature verification and event payloads.
