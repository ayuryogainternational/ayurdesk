// ====================================================================
// AyurDesk - Settings & Profile Page
// ====================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, Lock, Globe, Shield, Clock, Building } from 'lucide-react';
import { MAURITIUS_TIMEZONE } from '../lib/timezone';

export const SettingsPage: React.FC = () => {
  const { profile, updatePassword, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      error('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      setIsUpdating(true);
      const { error: updateErr } = await updatePassword(newPassword);

      if (updateErr) {
        error('Update Failed', updateErr.message);
      } else {
        success('Password Updated', 'Your account credentials have been updated.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-forest-900">
          Account & System Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account credentials, regional time preferences, and organization details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <Card title="User Identity Profile">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-base">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{profile?.full_name}</h4>
                <p className="text-slate-500 font-mono">{profile?.email}</p>
                <div className="mt-1">
                  <Badge variant={isAdmin ? 'forest' : 'teal'}>
                    {isAdmin ? 'Administrator' : 'Staff'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Access Tier:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {profile?.role || 'Staff'} Account
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Report Export Permissions:</span>
                <span className="font-semibold text-slate-800">
                  {isAdmin ? 'Authorized (Admin)' : 'Restricted (Admin Only)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Audit Viewing Permissions:</span>
                <span className="font-semibold text-slate-800">
                  {isAdmin ? 'Authorized (Admin)' : 'Restricted (Admin Only)'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Organization & Regional Config */}
        <Card title="Organization & Regional Standards">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-warm-100 rounded-xl border border-[#E5E5DC]">
              <Building className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-forest-950 block">Organization:</span>
                <span className="text-slate-700">Ayuryoga International</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warm-100 rounded-xl border border-[#E5E5DC]">
              <Clock className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-forest-950 block">Standard Timezone:</span>
                <span className="text-slate-700">
                  Indian Ocean / Mauritius Time (MUT, UTC+04:00)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All daily reports, timestamps, exports, and audits are strictly governed by this timezone.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warm-100 rounded-xl border border-[#E5E5DC]">
              <Shield className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-forest-950 block">Data Protection:</span>
                <span className="text-slate-700">PostgreSQL Row Level Security (RLS)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Password Card */}
      <Card
        title="Update Account Password"
        subtitle="Ensure your new password contains at least 8 characters with letters and numbers"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Lock className="w-4 h-4 mr-1.5" />
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

