# Meridian Luxury Travel — Growth Playbook

A practical guide to turning the website into a source of leads. The site is
already well-built; the gap is **distribution** (getting found) and **proof**
(getting trusted). This document covers the free, high-leverage moves — the SEO
content engine we just added, a Google Business Profile, and how to measure it.

---

## 1. The honest diagnosis

A great website generates zero business if nobody visits it. Luxury Antarctica /
Galápagos travel is one of the most competitive niches online, and a newer
domain won't rank or get discovered without deliberate effort. Before spending
another dollar on the site, confirm which problem we're solving:

1. **Check Google Analytics** (already installed, ID `G-PQXF6QPH5Y`)
   → Reports → Acquisition → Traffic acquisition → last 12 months.
   Note: total **sessions**, top **sources**, and whether any **quote events** fire.
2. **Check Google Search Console** (set it up if not already — see §3)
   → Are pages indexed? Any impressions/clicks? For which queries?

- **~0 visitors** → it's a traffic problem. The content engine + Google Business
  Profile + (optionally) a small ad budget are the fix. A redesign is not.
- **Visitors but no inquiries** → it's a conversion problem. Strengthen CTAs,
  trust signals, and lead capture (the blog posts already include these).

---

## 2. The SEO content engine (now live)

We added a full blog/guides system so Meridian can rank for the questions
travelers actually search before booking.

### How it works
- **Public guides** live at `/blog` and `/blog/<slug>`, fully server-rendered
  with per-post SEO metadata, Article + Breadcrumb structured data, an RSS feed
  (`/blog/rss.xml`), and automatic inclusion in `sitemap.xml`.
- **Every post converts**: each ends with an email lead-magnet capture (tagged
  `source: 'blog'` in `email_signups`) and a "Request a custom quote" CTA that
  links into the existing quote funnel, plus an internal link to the matching
  destination page.
- **Chris authors posts himself** at `/admin` → **Blog / SEO Guides**. No code,
  no deploys. Draft → publish, with a live SEO helper (title/meta length,
  keyword checks).

### The strategy: answer buyer questions
High-intent searchers are close to booking. Target the questions they type:
- "best time to visit antarctica" ✅ (seeded)
- "how much does an antarctica cruise cost" ✅ (seeded)
- "galápagos cruise vs land based" ✅ (seeded)
- "antarctica vs arctic" ✅ (seeded)
- "what to pack for antarctica" ✅ (seeded)
- Next up: "how many days in the galápagos", "patagonia best time to visit",
  "machu picchu vs rainbow mountain", "is antarctica safe", "drake passage
  seasickness", "galápagos with kids".

### Cadence
Aim for **one solid guide every 1–2 weeks**. Consistency compounds — SEO is a
6–12 month game, not a switch. Interlink new posts to older ones and to
destination/package pages.

### Publishing the starter posts
Five cornerstone drafts ship with the site. To load them:

```bash
npm run seed-blog
```

Then in `/admin/blog`: **verify the facts** (price ranges, seasons), **add real
cover images**, and publish. Prices in the seed content are representative 2026
market figures — update them to match what Meridian actually sells.

---

## 3. Google Business Profile (free, often the fastest leads)

A Google Business Profile (GBP) puts Meridian in Google Maps and the local
"business" panel, and is one of the highest-ROI free channels for a service
business. It also unlocks Google reviews — the single strongest trust signal.

### Setup (Chris does this — it requires his verification)
1. Go to **google.com/business** and sign in with the Meridian Google account.
2. **Business name:** Meridian Luxury Travel.
3. **Category:** "Travel agency" (add "Tour operator" as a secondary category).
4. **Service area:** if there's no walk-in office, set it as a *service-area
   business* (hide the address) and list the regions served — no storefront
   needed.
5. **Verification:** Google will verify by phone, email, or postcard. Complete
   this — the profile won't show publicly until verified.
6. **Fill everything out:** website (`https://meridianluxury.travel`), phone,
   hours, a strong description with keywords ("luxury Antarctica, Galápagos and
   South America expedition travel"), and the service list (Antarctica cruises,
   Galápagos cruises, Peru tours, etc.).
7. **Add 10+ high-quality photos** — destinations, ships, happy travelers.
8. **Link the blog:** post GBP "updates" that link to new guides — it keeps the
   profile active, which Google rewards.

### Reviews — start immediately
After every trip, email past clients a direct link to leave a Google review.
Even 5–10 genuine reviews dramatically improve both trust and local ranking.
Reply to every review.

---

## 4. Search Console + sitemap (do once)

1. Add the property at **search.google.com/search-console** (verify via the
   existing GA tag or a DNS record).
2. Submit the sitemap: `https://meridianluxury.travel/sitemap.xml`.
3. Check **Pages** for indexing errors and **Performance** monthly to see which
   guides gain impressions — then write more on what's working.

---

## 5. Conversion polish (mostly already in place)

- ✅ Email lead capture on every blog post.
- ✅ Quote CTA on every blog post → existing `/quote` funnel.
- **Add trust signals** to the homepage and about page: any industry
  affiliations (IATA / ASTA / CLIA / Virtuoso), real client testimonials, and
  "featured in" logos if any. These meaningfully lift conversion.
- Make sure the **phone number and contact are one tap away** on mobile.

---

## 6. The one thing that costs money (Chris's call)

For a new site, a **small, tightly-targeted Google Ads budget** on
ready-to-book keywords (e.g. "antarctica cruise 2026", "galápagos luxury
cruise") often produces qualified leads faster than organic — because you appear
above the incumbents on day one. Even **$300–500/month** on high-intent terms is
worth testing. This is optional and separate from the free work above.

---

## Summary checklist

- [ ] Pull GA + Search Console numbers to confirm traffic vs conversion.
- [ ] `npm run seed-blog`, then verify facts + add images + publish the 5 guides.
- [ ] Set a cadence: one new guide every 1–2 weeks.
- [ ] Create + verify the Google Business Profile; request reviews from past clients.
- [ ] Submit the sitemap in Search Console.
- [ ] Add trust signals (affiliations, testimonials) to the homepage/about.
- [ ] Decide whether to test a small Google Ads budget.
