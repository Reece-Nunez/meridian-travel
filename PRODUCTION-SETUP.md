# Production Setup Requirements

## Required Environment Variables

Add these to your `.env.local` file for development or your hosting platform's environment configuration:

### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Payment Processing (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_xxx_or_sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_or_pk_test_xxx
```

### Email Service (Resend)
```bash
RESEND_API_KEY=re_xxx
```

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Database Setup

1. Apply database migrations in order:
   ```bash
   # Core tables and functions
   psql -f database/01-extensions-and-tables.sql
   psql -f database/02-booking-tables.sql
   psql -f database/02-itinerary-tables.sql
   psql -f database/03-security-policies.sql
   psql -f database/04-functions-triggers.sql

   # CMS and content
   psql -f database/05-cms-tables.sql
   psql -f database/05-quote-tokens.sql

   # Payment system
   psql -f database/07-payment-intents.sql
   psql -f database/08-add-booked-status.sql
   ```

2. Set up Row Level Security (RLS) policies as defined in the migration files

## Stripe Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Email Domain Setup (Resend)

1. Add your domain to Resend
2. Set up DNS records for email authentication
3. Verify the domain
4. Update the `from` address in email templates to match your verified domain

## Security Checklist

- [ ] All API keys are stored in environment variables (not hardcoded)
- [ ] Stripe is in live mode for production (not test mode)
- [ ] Database RLS policies are enabled
- [ ] Admin authentication is properly secured
- [ ] HTTPS is enabled for production
- [ ] CORS settings are properly configured

## Workflow Testing

### Quote Request Flow:
1. Client submits quote → Admin receives email notification
2. Admin reviews quote in `/admin/quotes`
3. Admin sets price and approves → Client receives payment link email
4. Client completes payment → Booking is created automatically
5. Webhook updates all statuses correctly

### Admin Access:
- Login: `/admin/login` (only chris@meridianluxury.travel)
- Quotes: `/admin/quotes` and `/admin/quotes/[id]`
- Analytics: `/admin/analytics`
- Content: `/admin/content`

## Performance Optimizations Applied

- Server-side rendering with proper caching
- Image optimization for packages and content
- Database queries optimized with proper indexing
- Error boundaries and loading states implemented

## Monitoring & Logging

- Server logs capture all critical operations
- Payment webhook events are logged
- Email delivery status is tracked
- Database errors are properly handled and logged