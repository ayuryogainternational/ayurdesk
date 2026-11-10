-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Complete Setup Migration: full_setup.sql
-- Organization: Ayuryoga International
-- ====================================================================
-- This script contains all DDL, Row Level Security policies,
-- audit triggers, and initial seed data in a single idempotent script.
-- It can be executed directly in the Supabase Dashboard SQL Editor
-- or via CLI/migration runner.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    must_change_password BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Daily Reports Table (Operational tracking)
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

CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON public.daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_at ON public.daily_reports(created_at DESC);

-- Audit Logs Table (Immutable change ledger)
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ====================================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ====================================================================

-- Function: Updated at timestamp generator
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_daily_reports_updated_at ON public.daily_reports;
CREATE TRIGGER trg_daily_reports_updated_at
BEFORE UPDATE ON public.daily_reports
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Function: Check if caller is Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Function: Comprehensive Audit Logging for daily_reports
CREATE OR REPLACE FUNCTION public.process_daily_report_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT := 'System / Migration';
  v_user_role TEXT := 'system';
  v_record_id UUID;
  v_old_data JSONB := NULL;
  v_new_data JSONB := NULL;
  v_changed JSONB := '{}'::JSONB;
  v_action TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT full_name, role 
    INTO v_user_name, v_user_role
    FROM public.profiles
    WHERE id = v_user_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_record_id := NEW.id;
    v_new_data := to_jsonb(NEW);
    
    INSERT INTO public.audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_fields,
      performed_by,
      performed_by_name,
      performed_by_role,
      performed_at
    ) VALUES (
      'daily_reports',
      v_record_id,
      v_action,
      NULL,
      v_new_data,
      jsonb_build_object('event', 'created'),
      v_user_id,
      COALESCE(v_user_name, 'Unknown Staff'),
      COALESCE(v_user_role, 'staff'),
      now()
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_record_id := NEW.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);

    IF OLD.report_date IS DISTINCT FROM NEW.report_date THEN
      v_changed := jsonb_set(v_changed, '{report_date}', jsonb_build_object('old', OLD.report_date, 'new', NEW.report_date));
    END IF;
    IF OLD.total_enquiries IS DISTINCT FROM NEW.total_enquiries THEN
      v_changed := jsonb_set(v_changed, '{total_enquiries}', jsonb_build_object('old', OLD.total_enquiries, 'new', NEW.total_enquiries));
    END IF;
    IF OLD.total_responses IS DISTINCT FROM NEW.total_responses THEN
      v_changed := jsonb_set(v_changed, '{total_responses}', jsonb_build_object('old', OLD.total_responses, 'new', NEW.total_responses));
    END IF;
    IF OLD.total_confirmations IS DISTINCT FROM NEW.total_confirmations THEN
      v_changed := jsonb_set(v_changed, '{total_confirmations}', jsonb_build_object('old', OLD.total_confirmations, 'new', NEW.total_confirmations));
    END IF;
    IF OLD.total_bookings IS DISTINCT FROM NEW.total_bookings THEN
      v_changed := jsonb_set(v_changed, '{total_bookings}', jsonb_build_object('old', OLD.total_bookings, 'new', NEW.total_bookings));
    END IF;
    IF OLD.tomorrow_bookings IS DISTINCT FROM NEW.tomorrow_bookings THEN
      v_changed := jsonb_set(v_changed, '{tomorrow_bookings}', jsonb_build_object('old', OLD.tomorrow_bookings, 'new', NEW.tomorrow_bookings));
    END IF;
    IF OLD.whatsapp_calls_messages IS DISTINCT FROM NEW.whatsapp_calls_messages THEN
      v_changed := jsonb_set(v_changed, '{whatsapp_calls_messages}', jsonb_build_object('old', OLD.whatsapp_calls_messages, 'new', NEW.whatsapp_calls_messages));
    END IF;
    IF OLD.normal_calls IS DISTINCT FROM NEW.normal_calls THEN
      v_changed := jsonb_set(v_changed, '{normal_calls}', jsonb_build_object('old', OLD.normal_calls, 'new', NEW.normal_calls));
    END IF;

    IF v_changed != '{}'::JSONB THEN
      INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_fields,
        performed_by,
        performed_by_name,
        performed_by_role,
        performed_at
      ) VALUES (
        'daily_reports',
        v_record_id,
        v_action,
        v_old_data,
        v_new_data,
        v_changed,
        v_user_id,
        COALESCE(v_user_name, 'Unknown User'),
        COALESCE(v_user_role, 'staff'),
        now()
      );
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_record_id := OLD.id;
    v_old_data := to_jsonb(OLD);

    INSERT INTO public.audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_fields,
      performed_by,
      performed_by_name,
      performed_by_role,
      performed_at
    ) VALUES (
      'daily_reports',
      v_record_id,
      v_action,
      v_old_data,
      NULL,
      jsonb_build_object('event', 'deleted'),
      v_user_id,
      COALESCE(v_user_name, 'Admin'),
      COALESCE(v_user_role, 'admin'),
      now()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_daily_reports ON public.daily_reports;
CREATE TRIGGER trg_audit_daily_reports
AFTER INSERT OR UPDATE OR DELETE ON public.daily_reports
FOR EACH ROW
EXECUTE FUNCTION public.process_daily_report_audit();

-- Function: Automatic profile sync on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    must_change_password,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::BOOLEAN, true),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Reset existing policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;

DROP POLICY IF EXISTS "daily_reports_select_authenticated" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_insert_authenticated" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_update_authenticated" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_update_within_24h_or_admin" ON public.daily_reports;
DROP POLICY IF EXISTS "daily_reports_delete_admin_only" ON public.daily_reports;

DROP POLICY IF EXISTS "audit_logs_select_admin_only" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_client_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_client_update" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_client_delete" ON public.audit_logs;

-- Profiles Policies
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (
  public.is_admin() OR (
    id = auth.uid() AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "profiles_insert_admin_only"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.is_admin() OR id = auth.uid());

CREATE POLICY "profiles_delete_admin_only"
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- Daily Reports Policies
CREATE POLICY "daily_reports_select_authenticated"
ON public.daily_reports FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "daily_reports_insert_authenticated"
ON public.daily_reports FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- UPDATE: Staff (Shilpa, Gokul) can overwrite/edit reports within 24 hours of creation.
-- After 24 hours, only administrators can modify historical records.
CREATE POLICY "daily_reports_update_within_24h_or_admin"
ON public.daily_reports FOR UPDATE TO authenticated, anon
USING (public.is_admin() OR (created_at >= now() - interval '24 hours'))
WITH CHECK (public.is_admin() OR (created_at >= now() - interval '24 hours'));

CREATE POLICY "daily_reports_delete_admin_only"
ON public.daily_reports FOR DELETE TO authenticated
USING (public.is_admin());

-- Audit Logs Policies
CREATE POLICY "audit_logs_select_admin_only"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "audit_logs_no_client_insert"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "audit_logs_no_client_update"
ON public.audit_logs FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "audit_logs_no_client_delete"
ON public.audit_logs FOR DELETE TO authenticated
USING (false);

-- ====================================================================
-- 5. INITIAL DATA IMPORT (16 HISTORICAL OPERATIONAL RECORDS)
-- ====================================================================

INSERT INTO public.daily_reports (
    report_date,
    total_enquiries,
    total_responses,
    total_confirmations,
    total_bookings,
    tomorrow_bookings,
    whatsapp_calls_messages,
    normal_calls
) VALUES
('2026-10-25', 29, 29, NULL, 11, NULL, 32, 15),
('2027-10-26', 31, 31, NULL, 7,  NULL, 28, 28), -- Preserved & Flagged for Admin Verification (possible year typo in source data)
('2026-10-27', 47, 47, NULL, 26, NULL, 34, 12),
('2026-10-28', 37, 37, NULL, 28, NULL, 26, 11),
('2026-10-29', 25, 25, NULL, 21, NULL, 48, 10),
('2026-10-30', 34, 34, NULL, 12, NULL, 29, 7),
('2026-10-31', 30, 30, NULL, 14, NULL, 20, 11),
('2026-11-01', 42, 42, NULL, NULL, NULL, 42, 10),
('2026-11-02', 42, 42, NULL, 14, NULL, 29, 12),
('2026-11-03', 46, 46, NULL, 22, NULL, NULL, 25),
('2026-11-04', 32, 32, NULL, 18, NULL, 27, 5),
('2026-11-05', 27, 27, NULL, 10, NULL, 21, NULL),
('2026-11-06', 14, 14, NULL, 10, NULL, NULL, 7),
('2026-11-07', 21, 21, NULL, 11, 28,   15, 7),
('2026-11-08', 24, 24, 13,   NULL, NULL, 21, 3),
('2026-11-09', 2,  2,  2,    2,    NULL, NULL, 1)
ON CONFLICT (report_date) DO UPDATE SET
    total_enquiries = EXCLUDED.total_enquiries,
    total_responses = EXCLUDED.total_responses,
    total_confirmations = EXCLUDED.total_confirmations,
    total_bookings = EXCLUDED.total_bookings,
    tomorrow_bookings = EXCLUDED.tomorrow_bookings,
    whatsapp_calls_messages = EXCLUDED.whatsapp_calls_messages,
    normal_calls = EXCLUDED.normal_calls,
    updated_at = now();

