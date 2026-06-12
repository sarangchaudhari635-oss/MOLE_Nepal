-- ============================================================
-- MOLE — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Enable UUID extension ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── Table: users ──────────────────────────────────────────
-- Extends Supabase auth.users with MOLE profile data
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  full_name     TEXT        NOT NULL,
  role          TEXT        NOT NULL CHECK (role IN ('generator', 'buyer', 'agent')),
  industry      TEXT,                                   -- buyer's industry (for matching)
  phone         TEXT,                                   -- WhatsApp / Viber number
  location      TEXT,                                   -- Kathmandu neighborhood
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── Table: listings ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  category_code   TEXT        NOT NULL CHECK (
    category_code IN (
      'wood_biomass', 'plastic_hdpe', 'metal_ferrous', 'metal_nonferrous',
      'textile_wool', 'concrete_rubble', 'brick_dust', 'paper_cardboard',
      'glass_cullet', 'organic_food', 'other'
    )
  ),
  material_type   TEXT        NOT NULL,
  quantity_kg     NUMERIC     NOT NULL CHECK (quantity_kg > 0),
  condition       TEXT        NOT NULL CHECK (condition IN ('Clean', 'Contaminated', 'Mixed')),
  price_npr_min   NUMERIC,
  price_npr_max   NUMERIC,
  photo_url       TEXT,
  lat             NUMERIC,
  lng             NUMERIC,
  neighborhood    TEXT,
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  ai_result       JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast map queries
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_code);
CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(lat, lng);


-- ─── Table: matches ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_buyer ON public.matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing ON public.matches(listing_id);


-- ─── Table: impact_log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.impact_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID        NOT NULL REFERENCES public.listings(id),
  kg_diverted   NUMERIC     NOT NULL,
  co2_saved_kg  NUMERIC     GENERATED ALWAYS AS (kg_diverted * 0.5) STORED,
  traded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_log  ENABLE ROW LEVEL SECURITY;


-- ─── users RLS ─────────────────────────────────────────────
-- Users can read and update only their own row.
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Service role (backend) can read/write all users
CREATE POLICY "Service role full access to users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');


-- ─── listings RLS ──────────────────────────────────────────
-- Read is public (no auth required for browsing)
CREATE POLICY "Anyone can read active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Insert, update, delete requires ownership
CREATE POLICY "Owners can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY "Service role full access to listings"
  ON public.listings FOR ALL
  USING (auth.role() = 'service_role');


-- ─── matches RLS ───────────────────────────────────────────
-- Visible only to the listing owner and the matched buyer
CREATE POLICY "Match participants can view matches"
  ON public.matches FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() IN (
      SELECT user_id FROM public.listings WHERE id = listing_id
    )
  );

CREATE POLICY "Buyers can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Match participants can update status"
  ON public.matches FOR UPDATE
  USING (
    auth.uid() = buyer_id
    OR auth.uid() IN (
      SELECT user_id FROM public.listings WHERE id = listing_id
    )
  );

CREATE POLICY "Service role full access to matches"
  ON public.matches FOR ALL
  USING (auth.role() = 'service_role');


-- ─── impact_log RLS ────────────────────────────────────────
-- Read is public (powers homepage counter)
CREATE POLICY "Anyone can read impact log"
  ON public.impact_log FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to impact_log"
  ON public.impact_log FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- Storage Bucket Setup (run separately in Storage tab)
-- ============================================================
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket called: waste-photos
-- 3. Set it as Public bucket (so photo URLs work without auth)
-- 4. Storage policy: allow authenticated users to upload

-- ============================================================
-- Verification Queries
-- ============================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
-- SELECT * FROM public.listings LIMIT 5;
