-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Schema Migration: 004_therapist_hours.sql
-- Description: Therapist daily working hours, branch tracking & overtime remuneration
-- Organization: Ayuryoga International
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.therapist_hours (
    id TEXT PRIMARY KEY,
    record_date DATE NOT NULL,
    branch TEXT NOT NULL CHECK (branch IN ('Grand Baie', 'Curepipe', 'Moka')),
    therapist_name TEXT NOT NULL,
    hours NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (hours >= 0),
    regular_hours NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    overtime_hours NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_overtime BOOLEAN NOT NULL DEFAULT FALSE,
    overtime_rate NUMERIC(6,2) NOT NULL DEFAULT 75.00,
    overtime_salary NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    is_off_day BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_by TEXT,
    created_by_name TEXT,
    updated_by TEXT,
    updated_by_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT therapist_hours_date_name_unique UNIQUE (record_date, therapist_name)
);

CREATE INDEX IF NOT EXISTS idx_therapist_hours_date ON public.therapist_hours(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_therapist_hours_branch ON public.therapist_hours(branch);
CREATE INDEX IF NOT EXISTS idx_therapist_hours_name ON public.therapist_hours(therapist_name);

-- Row Level Security
ALTER TABLE public.therapist_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_hours_select"
ON public.therapist_hours FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "therapist_hours_insert"
ON public.therapist_hours FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "therapist_hours_update"
ON public.therapist_hours FOR UPDATE TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "therapist_hours_delete"
ON public.therapist_hours FOR DELETE TO authenticated
USING (public.is_admin());
