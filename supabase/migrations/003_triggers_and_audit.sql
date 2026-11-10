-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Database Triggers & Audit Trail: 003_triggers_and_audit.sql
-- Organization: Ayuryoga International
-- ====================================================================

-- 1. Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to profiles and daily_reports
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

-- 2. Audit Trail Trigger for daily_reports
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
  -- Identify current actor
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

    -- Calculate changed fields
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

    -- Only record audit if at least one operational field changed
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

-- 3. Automatic profile creation on auth.users insert
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
