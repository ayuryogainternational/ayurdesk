-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Security Migration: 002_row_level_security.sql
-- Organization: Ayuryoga International
-- ====================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check if the current user is an administrator
-- SECURITY DEFINER ensures it runs with the privileges of the creator
-- STABLE allows PostgreSQL to cache the result within a query
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

-- Grant execute on is_admin to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ====================================================================
-- PROFILES POLICIES
-- ====================================================================

-- SELECT: Users can read their own profile; Admins can read all profiles
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR public.is_admin()
);

-- UPDATE: Users can update their own password status, Admins can update any profile
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR public.is_admin()
)
WITH CHECK (
  -- If not admin, user cannot elevate their own role
  public.is_admin() OR (
    id = auth.uid() AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  )
);

-- INSERT: Admins can insert new profiles (and auth trigger on user signup)
CREATE POLICY "profiles_insert_admin_only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin() OR id = auth.uid()
);

-- DELETE: Only admins can delete user profiles
CREATE POLICY "profiles_delete_admin_only"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ====================================================================
-- DAILY REPORTS POLICIES
-- ====================================================================

-- SELECT: All authenticated staff and admin can view all records
CREATE POLICY "daily_reports_select_authenticated"
ON public.daily_reports
FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated'
);

-- INSERT: Authenticated staff and admin can create daily reports
CREATE POLICY "daily_reports_insert_authenticated"
ON public.daily_reports
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated'
);

-- UPDATE: Reception overwrite & 24-hour window policy:
-- Staff (Shilpa, Gokul) can overwrite/edit reports within 24 hours of creation.
-- After 24 hours, editing is locked for staff; only Admin can modify historical records.
CREATE POLICY "daily_reports_update_within_24h_or_admin"
ON public.daily_reports
FOR UPDATE
TO authenticated
USING (
  public.is_admin() OR (created_at >= now() - interval '24 hours')
)
WITH CHECK (
  public.is_admin() OR (created_at >= now() - interval '24 hours')
);

-- DELETE: Strictly Owner / Admin only. Staff cannot delete records.
CREATE POLICY "daily_reports_delete_admin_only"
ON public.daily_reports
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ====================================================================
-- AUDIT LOGS POLICIES
-- ====================================================================

-- SELECT: Strictly Owner / Admin only. Staff cannot view audit logs.
CREATE POLICY "audit_logs_select_admin_only"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- INSERT/UPDATE/DELETE: Audit logs are immutable and created solely by database triggers.
-- Direct inserts, updates, or deletes from client connections are disallowed.
CREATE POLICY "audit_logs_no_client_insert"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "audit_logs_no_client_update"
ON public.audit_logs
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "audit_logs_no_client_delete"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (false);
