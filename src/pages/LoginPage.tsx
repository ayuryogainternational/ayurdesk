// ====================================================================
// AyurDesk - Login & First-Time Provisioning Interface
// Organization: Ayuryoga International
// ====================================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  User,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  UserPlus,
  LogIn,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isConfigured } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('staff');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsEmailUnconfirmed(false);

    if (!isConfigured) {
      setAuthError('Supabase credentials are not configured yet in .env.');
      return;
    }

    try {
      setIsLoading(true);
      const { error: signInErr } = await signIn(email, password);

      if (signInErr) {
        const msg = signInErr.message || 'Invalid email or password.';
        setAuthError(msg);

        if (msg.toLowerCase().includes('email not confirmed')) {
          setIsEmailUnconfirmed(true);
        }

        error('Authentication Failed', msg);
      } else {
        success('Welcome back', 'Signed in successfully to AyurDesk.');
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setRegSuccessMessage('');

    if (regPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            role: regRole,
            must_change_password: false,
          },
        },
      });

      if (signUpErr) {
        setAuthError(signUpErr.message);
        error('Registration Failed', signUpErr.message);
        return;
      }

      if (data.session) {
        success('Account Created', `Welcome to AyurDesk, ${regFullName}!`);
        navigate(from, { replace: true });
      } else {
        // Confirmation email sent or pending confirmation
        setRegSuccessMessage(
          `Account for ${regEmail} created successfully! If email confirmation is enabled on your Supabase project, check your inbox or disable "Confirm email" in Supabase Auth settings.`
        );
        info('Account Created', 'Please sign in with your credentials.');
        setMode('signin');
        setEmail(regEmail);
        setPassword(regPassword);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-md">
          <Layers className="w-8 h-8 text-warm-100" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-forest-900 font-sans">
          AyurDesk
        </h2>
        <p className="mt-1 text-xs uppercase tracking-wider font-semibold text-forest-600">
          Ayuryoga International
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Daily Operations Management & Control System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-7 px-6 shadow-sm border border-[#E5E5DC] rounded-2xl sm:px-10">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition ${
                mode === 'signin'
                  ? 'border-forest-900 text-forest-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <LogIn className="w-4 h-4" />
                Sign In
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition ${
                mode === 'register'
                  ? 'border-forest-900 text-forest-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                Register / Setup
              </span>
            </button>
          </div>

          {regSuccessMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{authError}</span>
                {isEmailUnconfirmed && (
                  <p className="mt-1 text-slate-600">
                    <strong>Solution:</strong> In Supabase Dashboard &rarr; <strong>Authentication</strong> &rarr;{' '}
                    <strong>Providers</strong> &rarr; <strong>Email</strong>, turn off{' '}
                    <strong>"Confirm email"</strong>, or click the confirmation link in your inbox.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SIGN IN FORM                                                   */}
          {/* ============================================================== */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ayuryoga.example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Sign In to AyurDesk
              </Button>
            </form>
          ) : (
            /* ============================================================== */
            /* REGISTRATION / SETUP FORM                                      */
            /* ============================================================== */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Owner / Admin, Shilpa, or Gokul"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@ayuryoga.example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 bg-white"
                >
                  <option value="admin">Administrator (Owner / Admin)</option>
                  <option value="staff">Staff (Operational Entry & View)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Quick Setup Helper Banner */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-xs text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showSqlGuide ? 'Hide' : 'Show'} 1-Click Supabase Setup SQL</span>
            </button>

            {showSqlGuide && (
              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono space-y-2">
                <p className="text-slate-400">
                  Run this in your <strong>Supabase SQL Editor</strong> to auto-confirm all signups
                  and bypass email verification:
                </p>
                <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto text-[10px]">
{`-- Auto-confirm signups
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_confirm ON auth.users;
CREATE TRIGGER trg_auto_confirm
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
