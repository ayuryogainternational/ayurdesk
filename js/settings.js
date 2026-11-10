// ====================================================================
// AyurDesk - Settings Page Script
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('settings');

  // Change Password Form
  const pwForm = document.getElementById('change-password-form');
  if (pwForm) {
    pwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPw = document.getElementById('current-pw').value;
      const newPw = document.getElementById('new-pw').value;

      if (newPw.length < 6) {
        window.showToast('Validation Error', 'New password must be at least 6 characters.', 'warning');
        return;
      }

      // If Supabase client exists
      if (window.supabaseClient) {
        try {
          await window.supabaseClient.auth.updateUser({ password: newPw });
        } catch (err) {
          console.warn('[AyurDesk] Supabase password update notice:', err);
        }
      }

      const user = window.authManager.getCurrentUser();
      if (user) {
        user.must_change_password = false;
        window.authManager.setUser(user);
      }

      window.showToast('Password Updated', 'Your password has been changed successfully.', 'success');
      pwForm.reset();
    });
  }

  // Reset to Seed Data
  const resetBtn = document.getElementById('btn-reset-seed');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the historical 16 seed records? Any unsaved edits will be reset.')) {
        window.dataStore.resetDataToSeed();
        window.showToast('Dataset Restored', 'Reset to initial 16 operational records including 2027 anomaly.', 'success');
      }
    });
  }
});

