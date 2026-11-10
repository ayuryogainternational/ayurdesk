-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Schema Migration: 001_initial_schema.sql
-- Organization: Ayuryoga International
-- ====================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    must_change_password BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Create daily_reports table
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE UNIQUE NOT NULL,
    total_enquiries INTEGER NULL CHECK (total_enquiries IS NULL OR total_enquiries >= 0),
    total_responses INTEGER NULL CHECK (total_responses IS NULL OR total_responses >= 0),
    total_confirmations INTEGER NULL CHECK (total_confirmations IS NULL OR total_confirmations >= 0),
    total_bookings INTEGER NULL CHECK (total_bookings IS NULL OR total_bookings >= 0),
    tomorrow_bookings INTEGER NULL CHECK (tomorrow_bookings IS NULL OR tomorrow_bookings >= 0),
    whatsapp_calls_messages INTEGER NULL CHECK (whatsapp_calls_messages IS NULL OR whatsapp_calls_messages >= 0),
    normal_calls INTEGER NULL CHECK (normal_calls IS NULL OR normal_calls >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering and filtering by date
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON public.daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_at ON public.daily_reports(created_at DESC);

-- 3. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by_name TEXT,
    performed_by_role TEXT,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying audit logs by date and record
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
