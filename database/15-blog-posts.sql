-- Blog / SEO content engine
-- Adds the blog_posts table used by the public /blog surface and the
-- /admin/blog authoring UI. Follows the same conventions as 05-cms-tables.sql:
-- uuid_generate_v4() PKs, the shared update_updated_at_column() trigger,
-- public-readable SELECT policy, and an admin-manageable ALL policy (admin
-- API routes additionally go through the service-role client after requireAdmin).

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Public identity
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,                       -- sanitized HTML from RichTextEditor

  -- Media
  cover_image TEXT,                   -- hero image URL
  cover_image_alt TEXT,               -- accessibility + image SEO

  -- Taxonomy / internal linking
  category TEXT NOT NULL DEFAULT 'guides',
  tags TEXT[] DEFAULT '{}',
  related_destination TEXT,           -- slug of a /destinations/* page for internal links

  -- Authorship / UX
  author TEXT NOT NULL DEFAULT 'Meridian Luxury Travel',
  read_minutes INTEGER,

  -- SEO
  focus_keyword TEXT,
  meta_title TEXT,                    -- falls back to title when null
  meta_description TEXT,              -- falls back to excerpt when null

  -- Publishing workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for the two hot query paths: lookup by slug, and
-- "published posts newest first" for the index page + sitemap + RSS.
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON blog_posts (status, published_at DESC);

-- RLS: the public (anon key) may ONLY read published posts. There is
-- deliberately no anon write policy — unlike content_sections, which uses a
-- permissive `USING (true)` ALL policy that would let anyone with the anon key
-- mutate rows. All writes and draft reads go through the service-role client in
-- the /api/admin/blog routes (guarded by requireAdmin), which bypasses RLS.
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts are publicly readable" ON blog_posts;
CREATE POLICY "Published posts are publicly readable" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Keep updated_at fresh using the shared trigger function.
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
