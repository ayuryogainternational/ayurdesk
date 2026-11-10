// ====================================================================
// AyurDesk - Authentication & Role Context
// Organization: Ayuryoga International
// ====================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user profile from public.profiles
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AyurDesk] Error fetching profile:', error.message);
        // Fallback: build temporary profile from auth metadata if available
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const role = (authData.user.user_metadata?.role as UserRole) || 'staff';
          return {
            id: authData.user.id,
            email: authData.user.email || '',
            full_name: authData.user.user_metadata?.full_name || 'Staff User',
            role,
            must_change_password: Boolean(authData.user.user_metadata?.must_change_password),
            created_at: authData.user.created_at,
            updated_at: authData.user.updated_at || authData.user.created_at,
          };
        }
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('[AyurDesk] Exception fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        if (isMounted) setProfile(p);
      }
      if (isMounted) setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const p = await fetchProfile(newSession.user.id);
          if (isMounted) setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error };

      if (data.user) {
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!user) throw new Error('No active user session');

      // 1. Update Supabase Auth password
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      });

      if (authError) throw authError;

      // 2. Update profiles table must_change_password = false
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);

      if (profileError) {
        console.warn('[AyurDesk] Profile update warning:', profileError.message);
      }

      // 3. Update local profile state
      setProfile((prev) => (prev ? { ...prev, must_change_password: false } : null));

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isAdmin,
        isStaff,
        signIn,
        signOut,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

