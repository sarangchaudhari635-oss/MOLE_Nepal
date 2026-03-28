-- ============================================================
-- MOLE — Fix transactions table + notification RLS
-- Run in Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add missing columns to transactions table
ALTER TABLE public.transactions 
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'interested',
    ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL;

-- 2. Allow users to UPDATE their own transactions
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' AND policyname = 'transactions_update_own'
    ) THEN
        CREATE POLICY "transactions_update_own" ON public.transactions
            FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
    END IF;
END $$;

-- 3. Fix notifications RLS — allow ANY authenticated user to INSERT
-- (needed because user A sends a notification to user B)
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_any_auth" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Allow users to UPDATE their own notifications (mark as read)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'notifications_update_own'
    ) THEN
        CREATE POLICY "notifications_update_own" ON public.notifications
            FOR UPDATE USING (auth.uid() = company_id);
    END IF;
END $$;

-- 5. Index on transactions for deal pipeline queries
CREATE INDEX IF NOT EXISTS transactions_seller_buyer_idx
    ON public.transactions(seller_id, buyer_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx
    ON public.transactions(status);
