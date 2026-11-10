// ====================================================================
// AyurDesk - Supabase Client Initialization
// Organization: Ayuryoga International
// ====================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[AyurDesk] Supabase credentials not fully configured in .env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create standard client for browser operations
// Uses anon key with PostgreSQL Row Level Security enforcing policies
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

