#!/usr/bin/env node

/**
 * Seeds the blog_posts table with cornerstone SEO articles for the expedition
 * niche. Idempotent: upserts by slug, so re-running updates existing posts
 * rather than creating duplicates.
 *
 *   node scripts/seed-blog-posts.js
 *
 * ⚠️  FACTS TO VERIFY BEFORE LEANING ON THESE COMMERCIALLY:
 *   - Price ranges are representative 2026 market figures, not Meridian's own
 *     rates. Update them to match what Chris actually sells.
 *   - Sailing seasons / departure ports are accurate as general expedition facts
 *     but confirm they match the specific operators Meridian books.
 *   - Swap the cover_image URLs for real licensed/owned photography.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function readMinutes(html) {
  const words = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
  return Math.max(1, Math.round(words / 200));
}

// Stagger publish dates so the index isn't a wall of identical timestamps.
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const posts = [
  {
    slug: 'best-time-to-visit-antarctica',
    title: 'Best Time to Visit Antarctica: A Month-by-Month Guide',
    category: 'planning',
    related_destination: 'antarctica',
    tags: ['antarctica', 'planning', 'when to go'],
    focus_keyword: 'best time to visit antarctica',
    is_featured: true,
    published_at: daysAgo(2),
    excerpt:
      'Antarctica’s cruise season runs from November to March. Here’s exactly what each month offers — from pristine ice and penguin courtship to whale-filled waters — so you can match the trip to what you most want to see.',
    meta_title: 'Best Time to Visit Antarctica: Month-by-Month Guide (2026)',
    meta_description:
      'The best time to visit Antarctica depends on what you want to see. Our month-by-month guide covers penguins, whales, weather and prices from November to March.',
    cover_image: '',
    cover_image_alt: 'Zodiac cruising past icebergs on the Antarctic Peninsula',
    content: `
<p>There is only one time of year you can visit Antarctica: the austral summer, roughly <strong>late October through March</strong>, when the sea ice retreats enough for expedition ships to reach the peninsula. But within that window, each month offers a genuinely different experience. The "best" time depends entirely on what you most want to see.</p>
<h2>The short answer</h2>
<ul>
<li><strong>Want the most daylight and warmest weather?</strong> Go December–January.</li>
<li><strong>Want pristine, untouched snow and dramatic ice?</strong> Go November.</li>
<li><strong>Want whales and the best value?</strong> Go February–March.</li>
<li><strong>Want penguin chicks?</strong> Go late January onward.</li>
</ul>
<h2>November: pristine ice and courtship</h2>
<p>Early season Antarctica is at its most sculptural — vast, unbroken snowfields and towering pack ice that hasn’t yet been trodden. Penguins are courting and building nests, and the landscape photography is spectacular in the low, golden light. Nights are still crisp and the sea ice can make some landings more adventurous.</p>
<h2>December–January: peak season</h2>
<p>This is the heart of the season. Temperatures on the peninsula hover near freezing, daylight stretches to 20+ hours, and penguin colonies are a frenzy of activity — eggs hatch and the first fluffy chicks appear in January. It’s the most popular (and priciest) time to sail, so book well ahead.</p>
<h2>February–March: whales and value</h2>
<p>By late season the whale watching is superb — humpbacks and minkes feed actively in the peninsula’s bays, often approaching Zodiacs. Penguin chicks are large and comical, though colonies are muddier. Fares often ease as the season winds down, making this a favorite for value-minded travelers who prioritize wildlife over pristine snow.</p>
<h2>Getting there: the Drake Passage</h2>
<p>Most expeditions depart <strong>Ushuaia, Argentina</strong>, and cross the Drake Passage — about two days of open ocean each way. The Drake can be glassy calm ("Drake Lake") or genuinely rough ("Drake Shake"). If seasickness is a real concern, consider a <em>fly-the-Drake</em> itinerary that flies you across to the South Shetland Islands instead, trading a premium for time and comfort.</p>
<blockquote>Whichever month you choose, Antarctica delivers. The differences are between "extraordinary" and "extraordinary in a different way."</blockquote>
<h2>How far ahead to book</h2>
<p>The best ships and cabins for peak-season departures often sell out 12–18 months in advance. If your dates are fixed — a honeymoon, a milestone birthday — start planning early. Flexible travelers can sometimes find late-availability savings, but you give up choice of ship and cabin.</p>
`,
  },
  {
    slug: 'how-much-does-an-antarctica-cruise-cost',
    title: 'How Much Does an Antarctica Cruise Cost? A 2026 Price Breakdown',
    category: 'planning',
    related_destination: 'antarctica',
    tags: ['antarctica', 'planning', 'cost'],
    focus_keyword: 'antarctica cruise cost',
    published_at: daysAgo(5),
    excerpt:
      'Antarctica expeditions typically range from around $8,000 to well over $40,000 per person. Here’s what drives the price — ship, cabin, route and add-ons — and how to get the most for your budget.',
    meta_title: 'How Much Does an Antarctica Cruise Cost? (2026 Breakdown)',
    meta_description:
      'Antarctica cruise costs explained: typical price ranges by ship class, what’s included, hidden extras, and how to save. A practical 2026 planning guide.',
    cover_image: '',
    cover_image_alt: 'Expedition ship anchored among icebergs in Antarctica',
    content: `
<p>An Antarctica expedition is a significant investment, and the range is wide — from roughly <strong>$8,000 per person for an entry-level cabin</strong> to <strong>$40,000 or more for a luxury suite with a private balcony</strong>. Understanding what drives the price helps you spend where it matters and save where it doesn’t.</p>
<h2>Typical price ranges</h2>
<ul>
<li><strong>Entry level (classic expedition ships, lower-deck cabins):</strong> ~$8,000–$15,000 per person.</li>
<li><strong>Mid-range (newer ships, balconies, more inclusions):</strong> ~$15,000–$25,000 per person.</li>
<li><strong>Luxury (premium suites, butler service, all-inclusive):</strong> $30,000–$50,000+ per person.</li>
</ul>
<p><em>These are representative market ranges for 2026 and vary by operator and departure. Ask us for current pricing on specific ships.</em></p>
<h2>What drives the cost</h2>
<h3>1. Cabin category</h3>
<p>This is the single biggest lever. A porthole cabin low in the ship and a top-deck suite can differ by a factor of three or four on the same sailing. If you’re out on deck and ashore most of the day, a modest cabin stretches your budget a long way.</p>
<h3>2. Ship and season</h3>
<p>Brand-new ships with stabilizers, glass-walled lounges and expansive suites command a premium. Peak-season departures (December–January) cost more than shoulder dates in November or March.</p>
<h3>3. Route and duration</h3>
<p>A classic ~10–11 day peninsula voyage is the most affordable. Adding <strong>South Georgia and the Falklands</strong> — spectacular for king penguins and albatross — extends the trip to 18–24 days and raises the price accordingly. Crossing the Antarctic Circle is another premium option.</p>
<h3>4. Fly vs sail the Drake</h3>
<p>Flying across the Drake Passage from Punta Arenas saves four days at sea and reduces seasickness risk — but typically adds several thousand dollars.</p>
<h2>What’s usually included — and what isn’t</h2>
<p>Most expedition fares include your cabin, all meals aboard, guided Zodiac excursions and shore landings, and the expert expedition team. Commonly <strong>extra</strong>: international flights to Ushuaia or Punta Arenas, pre-cruise hotel nights, travel insurance (often mandatory), and optional activities like kayaking, camping or the polar plunge.</p>
<h2>How to get the most for your budget</h2>
<ul>
<li>Choose a lower cabin category on a better ship rather than a top cabin on an older one.</li>
<li>Consider late-season (March) departures for whales and softer pricing.</li>
<li>Book early for peak dates; watch for late-availability deals if you’re flexible.</li>
<li>Factor in the "getting there" costs — flights and a night in Ushuaia — from the start.</li>
</ul>
<p>Because the variables interact, the smartest first step is a short conversation about your priorities. We’ll match you to the right ship and cabin for your budget rather than the most expensive option.</p>
`,
  },
  {
    slug: 'galapagos-cruise-vs-land-based',
    title: 'Galápagos Cruise vs. Land-Based: Which Is Right for You?',
    category: 'galapagos',
    related_destination: 'galapagos',
    tags: ['galapagos', 'planning'],
    focus_keyword: 'galapagos cruise vs land based',
    published_at: daysAgo(9),
    excerpt:
      'A Galápagos cruise reaches remote islands and more wildlife; a land-based trip is more affordable and flexible. Here’s how to decide which suits your travel style, budget and sea legs.',
    meta_title: 'Galápagos Cruise vs Land-Based: How to Choose (2026)',
    meta_description:
      'Should you do a Galápagos cruise or a land-based hotel trip? Compare wildlife access, cost, comfort and flexibility to pick the right way to see the islands.',
    cover_image: '',
    cover_image_alt: 'Sea lions on a beach in the Galápagos Islands',
    content: `
<p>The Galápagos can be experienced two very different ways: on a small ship that sails between islands overnight, or from a hotel base on one of the inhabited islands with day trips out. Both are wonderful. The right choice comes down to how much wildlife you want to see, your budget, and your comfort at sea.</p>
<h2>The case for a cruise</h2>
<p>Roughly 97% of the Galápagos is protected national park, and many of the richest wildlife sites are only reachable by boat. A cruise sails overnight, so you wake up at a new, often uninhabited island each morning — maximizing the number of landing sites and species you’ll encounter. You travel with a certified naturalist guide throughout, and itineraries are fixed by the park to spread visitors and protect the islands.</p>
<ul>
<li><strong>Best for:</strong> serious wildlife and photography, reaching remote northern and western islands, an all-in immersive experience.</li>
<li><strong>Trade-offs:</strong> higher cost, fixed itinerary, and you need reasonable sea legs — crossings are often at night.</li>
</ul>
<h2>The case for land-based</h2>
<p>Staying in a hotel on Santa Cruz, San Cristóbal or Isabela lets you explore at your own pace, mix in beach time and town life, and take day tours to nearby sites and snorkeling spots. It’s generally more affordable and far easier if anyone in your party is prone to seasickness or traveling with young children.</p>
<ul>
<li><strong>Best for:</strong> budgets that need stretching, families with kids, travelers who dislike boats, flexible schedules.</li>
<li><strong>Trade-offs:</strong> you can’t reach the remote islands, and day boats spend time transiting that a cruise spends exploring.</li>
</ul>
<h2>A quick comparison</h2>
<table>
<thead><tr><th>Factor</th><th>Cruise</th><th>Land-based</th></tr></thead>
<tbody>
<tr><td>Wildlife access</td><td>Excellent — remote sites</td><td>Good — central islands</td></tr>
<tr><td>Cost</td><td>Higher</td><td>Lower</td></tr>
<tr><td>Flexibility</td><td>Fixed itinerary</td><td>Choose day to day</td></tr>
<tr><td>Seasickness</td><td>Possible (night crossings)</td><td>Minimal</td></tr>
<tr><td>Best for</td><td>Wildlife immersion</td><td>Families, budgets</td></tr>
</tbody>
</table>
<h2>Can you combine both?</h2>
<p>Yes — and many travelers do. A shorter 4–5 day cruise paired with a few land-based nights gives you the remote-island wildlife <em>and</em> the flexibility and value of a hotel base. It’s often the most satisfying way to see the archipelago on a first visit.</p>
<p>Not sure which fits your group? Tell us who’s traveling and what you most want to see, and we’ll map out the ideal balance.</p>
`,
  },
  {
    slug: 'antarctica-vs-arctic-which-to-choose',
    title: 'Antarctica vs. the Arctic: Which Polar Expedition Should You Choose?',
    category: 'planning',
    related_destination: 'antarctica',
    tags: ['antarctica', 'arctic', 'planning'],
    focus_keyword: 'antarctica vs arctic',
    published_at: daysAgo(13),
    excerpt:
      'Both poles are once-in-a-lifetime — but they’re very different trips. Penguins and endless ice, or polar bears and Arctic culture? Here’s how to choose between Antarctica and the Arctic.',
    meta_title: 'Antarctica vs the Arctic: Which Polar Trip Is Right for You?',
    meta_description:
      'Antarctica or the Arctic? Compare wildlife (penguins vs polar bears), scenery, season, cost and access to decide which polar expedition suits you best.',
    cover_image: '',
    cover_image_alt: 'A polar bear on Arctic sea ice',
    content: `
<p>People often ask which pole they should visit first. Both are transformative, but they are genuinely different experiences — in wildlife, landscape, season and even the feeling of the place. Here’s how to decide.</p>
<h2>Wildlife: penguins vs. polar bears</h2>
<p>This is the clearest dividing line. <strong>Antarctica</strong> means penguins — hundreds of thousands of them — plus seals and whales, in a place with no land predators and no human history to speak of. The <strong>Arctic</strong> is polar bear country, along with walrus, Arctic fox, reindeer, and millions of seabirds. If seeing a polar bear is the dream, only the Arctic delivers it.</p>
<h2>Landscape and atmosphere</h2>
<p>Antarctica is on a scale that’s hard to describe — a continent of ice, colossal tabular icebergs, and mountains rising straight from the sea. It feels genuinely untouched. The Arctic (Svalbard, Greenland, the Canadian High Arctic) mixes glaciers and sea ice with tundra, fjords, and — crucially — human presence: Inuit communities, historic trading posts, and research stations. The Arctic has culture; Antarctica has pure wilderness.</p>
<h2>Season</h2>
<ul>
<li><strong>Antarctica:</strong> November–March (austral summer).</li>
<li><strong>Arctic:</strong> roughly June–September, depending on region — Svalbard peaks in summer for pack-ice bear sightings.</li>
</ul>
<p>Because the seasons are opposite, you can, in principle, visit both within a single calendar year.</p>
<h2>Getting there</h2>
<p>Antarctica is more of an undertaking: fly to the southern tip of South America (usually Ushuaia), then cross the Drake Passage. The Arctic is generally easier to reach — Svalbard, for example, is a scheduled flight from mainland Norway to Longyearbyen, where many voyages begin.</p>
<h2>Cost</h2>
<p>The two overlap heavily, but Antarctica often runs a little higher for a comparable ship because of the remoteness and the longer positioning. In both cases, cabin category and ship class drive price more than the destination itself.</p>
<h2>So which should you choose?</h2>
<blockquote>Choose <strong>Antarctica</strong> for sheer scale, penguins, and untouched wilderness. Choose the <strong>Arctic</strong> for polar bears, dramatic fjords, and a human and cultural dimension.</blockquote>
<p>If it’s your first polar expedition and you can’t decide, Antarctica tends to be the more overwhelming, bucket-list "wow." But travelers who’ve done both often say the Arctic surprised them the most. Tell us what moves you and we’ll help you pick.</p>
`,
  },
  {
    slug: 'what-to-pack-for-antarctica-expedition',
    title: 'What to Pack for an Antarctica Expedition: The Complete List',
    category: 'planning',
    related_destination: 'antarctica',
    tags: ['antarctica', 'packing', 'planning'],
    focus_keyword: 'what to pack for antarctica',
    published_at: daysAgo(17),
    excerpt:
      'Layering is everything in Antarctica. Here’s exactly what to pack — from the base layers that keep you warm to the gear most expedition ships lend you — so you’re comfortable ashore and don’t overpack.',
    meta_title: 'What to Pack for Antarctica: The Complete Expedition List',
    meta_description:
      'A practical Antarctica packing list: the layering system that works, what ships usually provide (parka, boots), and the small items travelers forget.',
    cover_image: '',
    cover_image_alt: 'Expedition traveler in a red parka photographing penguins',
    content: `
<p>Antarctica in the austral summer isn’t as brutally cold as people expect — peninsula temperatures usually hover around freezing. The challenge is <strong>wind and wet</strong>, not deep cold. The solution is layering, and knowing what your ship already provides so you don’t overpack.</p>
<h2>What most ships provide</h2>
<p>Before you buy anything, check your operator’s inclusions. Most expedition ships supply:</p>
<ul>
<li>A warm, windproof <strong>expedition parka</strong> (often yours to keep).</li>
<li><strong>Waterproof muck boots</strong> on loan for wet Zodiac landings.</li>
</ul>
<p>That covers the two bulkiest items. Everything below is the layering system that goes underneath.</p>
<h2>The layering system</h2>
<h3>Base layer (next to skin)</h3>
<p>Merino wool or synthetic thermal top and bottoms. Bring two sets. <strong>Avoid cotton</strong> — it holds moisture and chills you.</p>
<h3>Mid layer (insulation)</h3>
<p>A fleece or light down jacket, plus fleece trousers or heavier leggings for the coldest landings.</p>
<h3>Outer layer (wind and waterproof)</h3>
<p>Your expedition parka handles your top half. For your legs you’ll want <strong>waterproof over-trousers</strong> — essential for sitting in Zodiacs and kneeling for photos.</p>
<h2>Extremities — where people get cold</h2>
<ul>
<li><strong>Hands:</strong> a thin liner glove plus a warm waterproof outer glove or mitten. The liner lets you operate a camera without bare skin.</li>
<li><strong>Head:</strong> a warm hat that covers the ears, plus a neck gaiter or buff.</li>
<li><strong>Feet:</strong> two pairs of thick wool socks to wear inside the loaner boots.</li>
</ul>
<h2>Don’t forget</h2>
<ul>
<li><strong>Sunglasses and high-SPF sunscreen</strong> — glare off snow and water is intense.</li>
<li><strong>Seasickness remedies</strong> for the Drake Passage (patches, tablets, or bands — whatever works for you).</li>
<li><strong>Binoculars</strong> — you’ll use them constantly for wildlife.</li>
<li><strong>Camera gear</strong> with spare batteries (cold drains them fast) and plenty of memory.</li>
<li><strong>A dry bag or waterproof case</strong> to protect electronics on Zodiac transfers.</li>
<li><strong>A refillable water bottle</strong> and any personal medications.</li>
</ul>
<h2>What to leave at home</h2>
<p>You won’t need formalwear — expedition ships are relaxed. Skip the heavy cotton jeans and the "just in case" extras. A duffel of smart layers beats a suitcase of bulk.</p>
<p>Every ship’s inclusions differ slightly, so once you’ve chosen your voyage we’ll send a tailored packing list for that specific operator.</p>
`,
  },
];

async function seed() {
  console.log(`Seeding ${posts.length} blog posts...`);

  const rows = posts.map((p) => ({
    ...p,
    author: 'Meridian Luxury Travel',
    status: 'published',
    read_minutes: readMinutes(p.content),
    is_featured: !!p.is_featured,
  }));

  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(rows, { onConflict: 'slug' })
    .select('slug, title');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  data.forEach((r) => console.log(`  ✓ ${r.slug}`));
  console.log('\nDone. Review drafts and swap in real cover images before promoting.');
}

seed();
