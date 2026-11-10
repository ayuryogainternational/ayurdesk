-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Migration: 004_therapist_attendance.sql
-- Organization: Ayuryoga International
-- Standard Timezone: Indian Ocean / Mauritius (UTC+04:00)
-- Overtime Remuneration: 75 MUR / hour for hours worked > 5.0h/day
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.therapist_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    therapist_name TEXT NOT NULL,
    therapist_email TEXT NOT NULL,
    record_date DATE NOT NULL,
    is_off_day BOOLEAN NOT NULL DEFAULT false,
    off_day_reason TEXT,
    check_in_1 TEXT,
    check_out_1 TEXT,
    check_in_2 TEXT,
    check_out_2 TEXT,
    shift_1_hours NUMERIC(5,2) DEFAULT 0,
    shift_2_hours NUMERIC(5,2) DEFAULT 0,
    total_working_hours NUMERIC(5,2) DEFAULT 0,
    regular_hours NUMERIC(5,2) DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    is_overtime BOOLEAN DEFAULT false,
    overtime_rate NUMERIC(10,2) DEFAULT 75.00,
    overtime_salary NUMERIC(10,2) DEFAULT 0,
    works_count INTEGER DEFAULT 0,
    total_treatment_hours NUMERIC(5,2) DEFAULT 0,
    works JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (therapist_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_therapist_attendance_date ON public.therapist_attendance(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_therapist_attendance_therapist ON public.therapist_attendance(therapist_id);

ALTER TABLE public.therapist_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_attendance_select_all"
ON public.therapist_attendance FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "therapist_attendance_upsert_all"
ON public.therapist_attendance FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "therapist_attendance_update_all"
ON public.therapist_attendance FOR UPDATE TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "therapist_attendance_delete_admin"
ON public.therapist_attendance FOR DELETE TO authenticated
USING (public.is_admin());

