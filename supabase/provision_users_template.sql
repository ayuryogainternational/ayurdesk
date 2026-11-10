-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Secure User Provisioning Template: provision_users_template.sql
-- Organization: Ayuryoga International
-- ====================================================================
-- INSTRUCTIONS:
-- 1. Replace the placeholder values below with the actual email addresses
--    supplied by the Owner, and choose a secure temporary password.
-- 2. Never commit actual passwords to version control.
-- 3. Run this script in the Supabase Dashboard SQL Editor.
-- 4. Upon first login, users will be required to change their password.
-- ====================================================================

DO $$
DECLARE
  -- CONFIGURE THESE VALUES BEFORE RUNNING:
  v_temp_password TEXT := 'REPLACE_WITH_TEMPORARY_PASSWORD_MIN_8_CHARS';
  v_shilpa_email  TEXT := 'shilpa@ayuryoga.example.com';
  v_gokul_email   TEXT := 'gokul@ayuryoga.example.com';
  v_admin_email   TEXT := 'admin@ayuryoga.example.com';

  v_shilpa_id UUID := gen_random_uuid();
  v_gokul_id  UUID := gen_random_uuid();
  v_admin_id  UUID := gen_random_uuid();
  v_encrypted_pw TEXT;
BEGIN
  -- Hash the temporary password using blowfish crypt
  v_encrypted_pw := extensions.crypt(v_temp_password, extensions.gen_salt('bf'));

  -- 1. Create Staff User 1: Shilpa
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_shilpa_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_shilpa_id,
      'authenticated',
      'authenticated',
      v_shilpa_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Shilpa","role":"staff","must_change_password":true}',
      now(),
      now()
    );

    INSERT INTO public.profiles (id, email, full_name, role, must_change_password)
    VALUES (v_shilpa_id, v_shilpa_email, 'Shilpa', 'staff', true)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      must_change_password = true;
      
    RAISE NOTICE 'Provisioned Staff: Shilpa (%)', v_shilpa_email;
  ELSE
    RAISE NOTICE 'User % already exists in auth.users', v_shilpa_email;
  END IF;

  -- 2. Create Staff User 2: Gokul
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_gokul_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_gokul_id,
      'authenticated',
      'authenticated',
      v_gokul_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Gokul","role":"staff","must_change_password":true}',
      now(),
      now()
    );

    INSERT INTO public.profiles (id, email, full_name, role, must_change_password)
    VALUES (v_gokul_id, v_gokul_email, 'Gokul', 'staff', true)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      must_change_password = true;

    RAISE NOTICE 'Provisioned Staff: Gokul (%)', v_gokul_email;
  ELSE
    RAISE NOTICE 'User % already exists in auth.users', v_gokul_email;
  END IF;

  -- 3. Create Administrator: Owner/Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Owner/Admin","role":"admin","must_change_password":true}',
      now(),
      now()
    );

    INSERT INTO public.profiles (id, email, full_name, role, must_change_password)
    VALUES (v_admin_id, v_admin_email, 'Owner/Admin', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      must_change_password = true;

    RAISE NOTICE 'Provisioned Admin: Owner/Admin (%)', v_admin_email;
  ELSE
    RAISE NOTICE 'User % already exists in auth.users', v_admin_email;
  END IF;

END $$;
