// ====================================================================
// AyurDesk - First-Time Mandatory Password Change Modal
// Enforces security compliance before accessing system
// ====================================================================

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const PasswordChangeModal: React.FC = () => {
  const { profile, updatePassword } = useAuth();
  const { success, error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show only if user is logged in and must_change_password is true
  const isOpen = Boolean(profile && profile.must_change_password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setValidationError('Password must include both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error: updateErr } = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (updateErr) {
      error('Failed to change password', updateErr.message);
    } else {
      success('Password updated successfully', 'Your new password is now active.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      preventClose={true}
      title="Mandatory Password Update"
      subtitle="Security Policy - First Login Requirement"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            Welcome to <strong>AyurDesk</strong>, {profile?.full_name}. For operational security,
            you must replace your temporary provisioning password with a private password before
            proceeding.
          </p>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              New Secure Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters (letters & numbers)"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Update Password & Enter AyurDesk
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

