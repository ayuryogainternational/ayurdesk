// ====================================================================
// AyurDesk - User Management Center
// Administrator only: manage staff roles and provisioning
// ====================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Shield,
  KeyRound,
  UserCheck,
  AlertCircle,
  Terminal,
  RefreshCw,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProvisioningGuide, setShowProvisioningGuide] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      // Mock view for preview if Supabase not yet connected
      setUsers([
        {
          id: 'admin-1',
          email: 'admin@ayuryoga.example.com',
          full_name: 'Owner / Administrator',
          role: 'admin',
          must_change_password: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'staff-1',
          email: 'shilpa@ayuryoga.example.com',
          full_name: 'Shilpa',
          role: 'staff',
          must_change_password: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'staff-2',
          email: 'gokul@ayuryoga.example.com',
          full_name: 'Gokul',
          role: 'staff',
          must_change_password: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });

      if (fetchErr) {
        error('Failed to load users', fetchErr.message);
      } else {
        setUsers((data as Profile[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (targetUser: Profile) => {
    if (targetUser.id === currentAdmin?.id) {
      error('Operation Blocked', 'You cannot change your own administrator role.');
      return;
    }

    const newRole: UserRole = targetUser.role === 'admin' ? 'staff' : 'admin';

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetUser.id);

      if (updateErr) {
        error('Role Update Failed', updateErr.message);
      } else {
        success('Role Updated', `${targetUser.full_name} is now ${newRole}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      error('Update Failed', msg);
    }
  };

  const handleForcePasswordReset = async (targetUser: Profile) => {
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ must_change_password: true, updated_at: new Date().toISOString() })
        .eq('id', targetUser.id);

      if (updateErr) {
        error('Password Reset Failed', updateErr.message);
      } else {
        success(
          'Password Change Flag Set',
          `${targetUser.full_name} will be prompted to change their password on next login.`
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, must_change_password: true } : u))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password flag';
      error('Action Failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest-900">
            User Management & Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff identities, permission roles, and mandatory password policies for Ayuryoga International
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowProvisioningGuide(true)}
          >
            <Terminal className="w-3.5 h-3.5 mr-1" />
            Provisioning Guide
          </Button>
        </div>
      </div>

      {/* Users Table Card */}
      <Card
        title="Authorized Personnel Accounts"
        subtitle="3 Configured Personas: Shilpa (Staff), Gokul (Staff), Owner/Admin (Administrator)"
      >
        <div className="overflow-x-auto border border-[#E5E5DC] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-forest-900 text-white font-semibold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Password Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No user accounts found. Run account provisioning script to populate initial users.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs">
                        {u.full_name[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <Badge variant={u.role === 'admin' ? 'forest' : 'teal'}>
                        {u.role === 'admin' ? 'Administrator' : 'Staff'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {u.must_change_password ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          Change Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          Password Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {u.id !== currentAdmin?.id && (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 px-2 py-1 rounded bg-forest-50 hover:bg-forest-100 transition"
                          >
                            Set as {u.role === 'admin' ? 'Staff' : 'Admin'}
                          </button>
                        )}
                        <button
                          onClick={() => handleForcePasswordReset(u)}
                          title="Force password reset on next login"
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 transition"
                        >
                          Require Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provisioning Instructions Modal */}
      <Modal
        isOpen={showProvisioningGuide}
        onClose={() => setShowProvisioningGuide(false)}
        title="Secure Account Provisioning Guide"
        subtitle="Automated CLI and SQL setup instructions for Shilpa, Gokul, and Owner"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <p>
            To provision accounts securely without committing cleartext passwords to version control,
            run the bundled CLI script or execute the SQL template in your Supabase Dashboard:
          </p>

          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1">
            <div className="text-slate-400"># 1. Run the interactive TypeScript provisioner:</div>
            <div>npx tsx scripts/provision-users.ts</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">Provisioned Accounts:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>Shilpa (Staff)</strong>: Daily operational entry & viewing.
              </li>
              <li>
                <strong>Gokul (Staff)</strong>: Daily operational entry & viewing.
              </li>
              <li>
                <strong>Owner / Admin (Administrator)</strong>: Unrestricted access, Excel & PDF report exports, audit inspection.
              </li>
            </ul>
          </div>

          <div className="p-3 bg-warm-100 border border-[#E5E5DC] rounded-xl text-slate-600">
            <strong>First-Login Enforcement:</strong> All accounts created via this method have{' '}
            <code>must_change_password: true</code> enabled by default. On their initial sign-in,
            a mandatory modal forces them to choose a private password.
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowProvisioningGuide(false)}>
              Close Guide
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

