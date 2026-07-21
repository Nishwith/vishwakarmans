-- =============================================================================
-- Phase 1: Database Hardening, RLS, & Debounced Caching
-- Migration: 0001_phase1_hardening.sql
-- =============================================================================
-- SAFETY: All statements are idempotent (IF NOT EXISTS, CREATE OR REPLACE,
--         DROP ... IF EXISTS before recreate). Safe to re-run.
-- =============================================================================

BEGIN;

-- =========================================================================
-- 1. CRITICAL INDEXING — Missing FK indexes
-- =========================================================================
-- connections.client_id, reviews.client_id, project_views_log.project_id
-- are FK columns with no B-Tree index. JOINs and cascaded DELETEs seq-scan.

CREATE INDEX IF NOT EXISTS idx_connections_client_id
  ON public.connections USING btree (client_id);

CREATE INDEX IF NOT EXISTS idx_reviews_client_id
  ON public.reviews USING btree (client_id);

CREATE INDEX IF NOT EXISTS idx_project_views_log_project_id
  ON public.project_views_log USING btree (project_id);


-- =========================================================================
-- 2. ANALYTICS LOG RLS HARDENING — authenticated-only INSERT
-- =========================================================================
-- Current "Allow public inserts for views" grants anon INSERT (abuse vector).
-- Replace with authenticated-only. No UPDATE/DELETE policies = denied by RLS.

DROP POLICY IF EXISTS "Allow public inserts for views" ON public.project_views_log;

-- INSERT: authenticated only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_views_log'
      AND policyname = 'Authenticated can log views'
  ) THEN
    CREATE POLICY "Authenticated can log views"
      ON public.project_views_log
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- SELECT: admins only (raw log analytics)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_views_log'
      AND policyname = 'Admins can read view logs'
  ) THEN
    CREATE POLICY "Admins can read view logs"
      ON public.project_views_log
      FOR SELECT
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

-- UPDATE/DELETE: no policies created = denied by default under RLS.


-- =========================================================================
-- 3. DAILY VIEW COUNTS — Aggregate table + pg_cron rollup
-- =========================================================================
-- Composite PK (project_id, view_date) enables upsert. No public read
-- policies — hidden from REST API to prevent competitive scraping.
-- The matview (SECURITY DEFINER owner) reads it server-side.

CREATE TABLE IF NOT EXISTS public.daily_view_counts (
  project_id  bigint  NOT NULL REFERENCES public.designer_projects(id) ON DELETE CASCADE,
  view_date   date    NOT NULL,
  view_count  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, view_date)
);

ALTER TABLE public.daily_view_counts ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT (no anon/authenticated public read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'daily_view_counts'
      AND policyname = 'Admins can read daily counts'
  ) THEN
    CREATE POLICY "Admins can read daily counts"
      ON public.daily_view_counts
      FOR SELECT
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

-- No INSERT/UPDATE/DELETE policies = only cron (superuser) and matview
-- refresh (SECURITY DEFINER) can write.

CREATE INDEX IF NOT EXISTS idx_daily_view_counts_project_id
  ON public.daily_view_counts USING btree (project_id);

-- Cron: aggregate yesterday, purge >30 days, 02:00 UTC daily
-- Unschedule first (idempotent)
SELECT cron.unschedule('rollup_daily_views')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'rollup_daily_views');

SELECT cron.schedule(
  'rollup_daily_views',
  '0 2 * * *',
  $$
    INSERT INTO public.daily_view_counts (project_id, view_date, view_count)
    SELECT project_id, (now() AT TIME ZONE 'UTC')::date - 1, count(*)
    FROM public.project_views_log
    WHERE viewed_at >= (now() AT TIME ZONE 'UTC')::date - 1
      AND viewed_at <  (now() AT TIME ZONE 'UTC')::date
    GROUP BY project_id
    ON CONFLICT (project_id, view_date)
    DO UPDATE SET view_count = EXCLUDED.view_count;

    DELETE FROM public.project_views_log
    WHERE viewed_at < now() - interval '30 days';
  $$
);


-- =========================================================================
-- 4. PROFILE COMPLETION TRACKING
-- =========================================================================

-- Add column idempotently
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
      AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN profile_completed boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Backfill existing rows where phone AND city are non-empty
UPDATE public.users
SET profile_completed = true
WHERE phone IS NOT NULL AND phone <> ''
  AND city IS NOT NULL AND city <> ''
  AND profile_completed = false;

-- Re-engineered handle_new_user():
--   • SECURITY DEFINER + SET search_path to prevent search-path hijacking
--   • Coalesces full_name / name for Google OAuth compatibility
--   • Null-safe for missing phone/city (OAuth won't provide them)
--   • Dynamically flags profile_completed

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $function$
DECLARE
  _full_name text;
  _phone     text;
  _city      text;
  _completed boolean;
BEGIN
  -- Email signup: 'full_name'. Google OAuth: 'full_name' or 'name'.
  _full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    ''
  );

  _phone := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');
  _city  := nullif(trim(coalesce(new.raw_user_meta_data->>'city',  '')), '');

  _completed := (_phone IS NOT NULL AND _city IS NOT NULL);

  INSERT INTO public.users (id, email, full_name, phone, city, role, profile_completed)
  VALUES (
    new.id,
    new.email,
    _full_name,
    _phone,
    _city,
    'client',
    _completed
  );

  RETURN new;
END;
$function$;


-- =========================================================================
-- 5. CACHE HYDRATION ENGINE — Rebuild mv_public_marketplace_feed
-- =========================================================================
-- Fixes:
--   a) Filter corrected from 'published' → 'approved' (matches live data)
--   b) Reads SUM(daily_view_counts) instead of COUNT(raw logs)
--   c) PII excluded: no email, phone, or internal subscription fields

DROP MATERIALIZED VIEW IF EXISTS public.mv_public_marketplace_feed;

CREATE MATERIALIZED VIEW public.mv_public_marketplace_feed AS
SELECT
  dp.id            AS project_id,
  dp.title,
  dp.project_category,
  dp.place,
  dp.created_at,
  d.id             AS designer_id,
  d.name           AS designer_name,
  d.logo_url       AS designer_logo,
  d.city           AS designer_city,
  d.is_verified,
  d.designer_type,
  d.rating_avg,
  d.rating_count,
  d.featured_status,
  d.priority_score,
  (
    SELECT pi.image_url
    FROM public.project_images pi
    WHERE pi.project_id = dp.id AND pi.is_cover = true
    LIMIT 1
  ) AS cover_image_path,
  coalesce(
    (SELECT sum(dvc.view_count) FROM public.daily_view_counts dvc WHERE dvc.project_id = dp.id),
    0
  )::integer AS calculated_views
FROM public.designer_projects dp
JOIN public.designers d ON dp.designer_id = d.id
WHERE dp.status = 'approved'
WITH NO DATA;

-- Unique index: required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_feed_project_id
  ON public.mv_public_marketplace_feed (project_id);

-- Initial populate
REFRESH MATERIALIZED VIEW public.mv_public_marketplace_feed;

-- Matviews don't inherit base-table RLS — explicit grants needed
GRANT SELECT ON public.mv_public_marketplace_feed TO anon, authenticated;


-- =========================================================================
-- 6. DEBOUNCED STATEMENT-LEVEL REFRESH TRIGGER
-- =========================================================================

-- Single-row gating table
CREATE TABLE IF NOT EXISTS public.mv_refresh_state (
  id                integer     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_refreshed_at timestamptz NOT NULL DEFAULT '1970-01-01'::timestamptz
);

INSERT INTO public.mv_refresh_state (id, last_refreshed_at)
VALUES (1, now())
ON CONFLICT (id) DO NOTHING;

-- Debounced refresh: SECURITY DEFINER + search_path locked down.
-- FOR UPDATE SKIP LOCKED discards overlapping rapid publish events.
-- 60-second cooldown between actual matview refreshes.

CREATE OR REPLACE FUNCTION public.debounced_refresh_marketplace()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $function$
DECLARE
  _last timestamptz;
BEGIN
  SELECT last_refreshed_at INTO _last
  FROM public.mv_refresh_state
  WHERE id = 1
  FOR UPDATE SKIP LOCKED;

  -- Could not acquire lock → another refresh is in-flight, skip
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Only refresh if 60+ seconds since last
  IF _last < now() - interval '60 seconds' THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_public_marketplace_feed;
    UPDATE public.mv_refresh_state SET last_refreshed_at = now() WHERE id = 1;
  END IF;

  RETURN NULL;
END;
$function$;

-- Attach as AFTER statement-level trigger on designer_projects
DROP TRIGGER IF EXISTS trg_debounced_refresh_feed ON public.designer_projects;
CREATE TRIGGER trg_debounced_refresh_feed
  AFTER INSERT OR UPDATE OR DELETE ON public.designer_projects
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.debounced_refresh_marketplace();

-- Unschedule the old 15-min cron (now superseded by debounced trigger)
SELECT cron.unschedule('refresh_marketplace_feed')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_marketplace_feed');

COMMIT;
