-- ============================================================
-- MOLE — Waste Schedule Schema (Supabase)
-- Allows users to create detailed waste generation schedules
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── WASTE SCHEDULE ────────────────────────────────────────
-- Detailed waste generation schedule for companies
-- Allows defining recurring or one-time waste generation events
CREATE TABLE IF NOT EXISTS public.waste_schedule (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    waste_type       TEXT        NOT NULL,  -- Type of waste (e.g., steel-scrap, aluminum, etc.)
    quantity         NUMERIC     NOT NULL DEFAULT 0,
    unit             TEXT        NOT NULL DEFAULT 'Tons',
    schedule_date    DATE        NOT NULL,  -- The specific date this waste is generated
    time_from        TIME,                   -- Optional: time when waste generation starts
    time_to          TIME,                   -- Optional: time when waste generation ends
    frequency        TEXT        DEFAULT 'once',  -- once, daily, weekly, monthly, custom
    description      TEXT,                   -- Details about the waste generation
    location         TEXT,                   -- Where the waste is generated (facility/line)
    hazard_level     TEXT        DEFAULT 'non-hazardous',  -- non-hazardous, hazardous, ee/crt
    handling_notes   TEXT,                   -- Special handling requirements
    is_active        BOOLEAN     DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waste_schedule
CREATE POLICY "waste_schedule_select_own" ON public.waste_schedule
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "waste_schedule_insert_own" ON public.waste_schedule
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "waste_schedule_update_own" ON public.waste_schedule
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "waste_schedule_delete_own" ON public.waste_schedule
    FOR DELETE USING (auth.uid() = company_id);


-- ─── WASTE SCHEDULE RECURRING ──────────────────────────────
-- For recurring waste schedules (daily, weekly, monthly)
CREATE TABLE IF NOT EXISTS public.waste_schedule_recurring (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    waste_type       TEXT        NOT NULL,
    quantity         NUMERIC     NOT NULL DEFAULT 0,
    unit             TEXT        NOT NULL DEFAULT 'Tons',
    frequency        TEXT        NOT NULL,  -- daily, weekly, monthly, custom
    day_of_week      INTEGER,               -- 0-6 for weekly (0=Sunday, 6=Saturday)
    day_of_month     INTEGER,               -- 1-31 for monthly schedules
    time_from        TIME,                  -- When waste generation begins
    time_to          TIME,                  -- When waste generation ends
    start_date       DATE        NOT NULL,  -- When this recurring schedule starts
    end_date         DATE,                  -- Optional: when the recurring schedule ends
    description      TEXT,
    location         TEXT,
    hazard_level     TEXT        DEFAULT 'non-hazardous',
    handling_notes   TEXT,
    is_active        BOOLEAN     DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_schedule_recurring ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waste_schedule_recurring
CREATE POLICY "waste_schedule_recurring_select_own" ON public.waste_schedule_recurring
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "waste_schedule_recurring_insert_own" ON public.waste_schedule_recurring
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "waste_schedule_recurring_update_own" ON public.waste_schedule_recurring
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "waste_schedule_recurring_delete_own" ON public.waste_schedule_recurring
    FOR DELETE USING (auth.uid() = company_id);


-- ─── INDEXES FOR PERFORMANCE ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_waste_schedule_company_date 
    ON public.waste_schedule(company_id, schedule_date);

CREATE INDEX IF NOT EXISTS idx_waste_schedule_company_active 
    ON public.waste_schedule(company_id, is_active);

CREATE INDEX IF NOT EXISTS idx_waste_schedule_recurring_company 
    ON public.waste_schedule_recurring(company_id, is_active);


-- ─── HELPER VIEW: MONTHLY WASTE SUMMARY ───────────────────
-- Summarizes waste generation by waste type and month
CREATE OR REPLACE VIEW public.waste_schedule_monthly_summary AS
SELECT 
    company_id,
    waste_type,
    DATE_TRUNC('month', schedule_date)::date AS month,
    SUM(quantity) AS total_quantity,
    unit,
    COUNT(*) AS event_count,
    MIN(schedule_date) AS first_date,
    MAX(schedule_date) AS last_date
FROM public.waste_schedule
WHERE is_active = true
GROUP BY company_id, waste_type, DATE_TRUNC('month', schedule_date), unit;


-- ─── HELPER FUNCTION: GET SCHEDULE FOR DATE RANGE ────────
-- Returns all waste schedule entries for a company within a date range
CREATE OR REPLACE FUNCTION public.get_waste_schedule_for_range(
    p_company_id UUID,
    p_from_date DATE,
    p_to_date DATE
)
RETURNS TABLE (
    id UUID,
    waste_type TEXT,
    quantity NUMERIC,
    unit TEXT,
    schedule_date DATE,
    time_from TIME,
    time_to TIME,
    frequency TEXT,
    description TEXT,
    location TEXT,
    hazard_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.id,
        ws.waste_type,
        ws.quantity,
        ws.unit,
        ws.schedule_date,
        ws.time_from,
        ws.time_to,
        ws.frequency,
        ws.description,
        ws.location,
        ws.hazard_level
    FROM public.waste_schedule ws
    WHERE ws.company_id = p_company_id
      AND ws.schedule_date >= p_from_date
      AND ws.schedule_date <= p_to_date
      AND ws.is_active = true
    ORDER BY ws.schedule_date, ws.time_from;
END;
$$ LANGUAGE plpgsql;

