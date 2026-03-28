-- ============================================================
-- MOLE — Dummy Data Seed Script
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- NOTE: This will add data alongside your existing data.
-- ============================================================

-- Create 3 dummy companies
INSERT INTO public.companies (id, company_name, industry_type, location, created_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'EcoSteel Manufacturing', 'manufacturing', 'Mumbai, India', now()),
    ('22222222-2222-2222-2222-222222222222', 'GreenBuild Aggregates', 'construction', 'Pune, India', now()),
    ('33333333-3333-3333-3333-333333333333', 'AgriBiomass Energy', 'energy', 'Nashik, India', now())
ON CONFLICT (id) DO NOTHING;

-- Add Waste Listings
INSERT INTO public.waste_listings (id, company_id, waste_type, description, quantity, unit, frequency, condition, hazard_level, price_per_unit, listing_location, created_at)
VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Steel Slag', 'High-quality steel slag byproduct from automotive parts casting.', 500, 'tons', 'Monthly', 'Processed', 'Non-hazardous', 200, 'Mumbai, India', now() - interval '2 days'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Metal Scrap', 'Mixed metal shavings and offcuts.', 50, 'tons', 'Weekly', 'Raw', 'Non-hazardous', 1500, 'Mumbai, India', now() - interval '5 days'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Wood Ash', 'Clean wood ash from biomass boiler operations.', 100, 'tons', 'Weekly', 'Processed', 'Non-hazardous', 0, 'Nashik, India', now() - interval '1 day'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Concrete Debris', 'Crushed concrete from demolition sites.', 1000, 'tons', 'One-time', 'Raw', 'Non-hazardous', 100, 'Pune, India', now() - interval '10 days');

-- Add Material Requests (Sourcing)
INSERT INTO public.material_requests (id, company_id, material_needed, quantity_required, unit, frequency, quality_grade, budget_per_unit, delivery_location, max_distance_km, created_at)
VALUES
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Steel Slag', 400, 'tons', 'Monthly', 'Industrial', 300, 'Pune, India', 200, now() - interval '3 days'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Fly Ash', 200, 'tons', 'Monthly', 'Industrial', 150, 'Pune, India', 100, now() - interval '7 days'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Agricultural Waste', 500, 'tons', 'Weekly', 'Organic', 50, 'Nashik, India', 50, now() - interval '14 days');

-- Add some completed Transactions to populate analytics
-- Transaction 1
INSERT INTO public.transactions (id, seller_id, buyer_id, material, amount, price, status, stage, created_at)
VALUES 
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Steel Slag', 200, 45000, 'completed', 'completed', now() - interval '15 days'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Wood Ash', 50, 0, 'completed', 'completed', now() - interval '5 days'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Metal Scrap', 20, 30000, 'active', 'in_transit', now() - interval '2 days');

-- Seed Circularity Scores
INSERT INTO public.circularity_scores (company_id, overall_score, recycled_pct, reused_pct, recovered_pct, landfill_pct, sector_percentile)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 78, 45, 20, 15, 20, 85),
    ('22222222-2222-2222-2222-222222222222', 65, 30, 10, 20, 40, 60),
    ('33333333-3333-3333-3333-333333333333', 92, 60, 20, 10, 10, 95)
ON CONFLICT (company_id) DO NOTHING;

-- Seed Impact Analytics for the past month
INSERT INTO public.impact_analytics (company_id, period_month, total_savings, transactions_count, co2_avoided_kg, water_saved_l, energy_saved_kwh, waste_diverted_kg, circularity_score)
VALUES
    ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW() - interval '1 month')::DATE, 125000, 4, 1500, 5000, 200, 5000, 75),
    ('22222222-2222-2222-2222-222222222222', date_trunc('month', NOW() - interval '1 month')::DATE, 45000, 2, 800, 2000, 100, 2000, 60),
    ('33333333-3333-3333-3333-333333333333', date_trunc('month', NOW() - interval '1 month')::DATE, 80000, 5, 3000, 10000, 500, 8000, 88)
ON CONFLICT (company_id, period_month) DO NOTHING;
