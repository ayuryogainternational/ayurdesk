// ====================================================================
// AyurDesk - User Management Script
// ====================================================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth(true)) return;

  window.initAppLayout('users');

  // Open modal
  const openModalBtn = document.getElementById('btn-open-add-user');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      document.getElementById('add-user-modal').classList.add('active');
    });
  }

  // Add User Form
  const form = document.getElementById('add-user-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('new-fullname').value.trim();
      const email = document.getElementById('new-email').value.trim();
      const role = document.getElementById('new-role').value;

      const btn = document.getElementById('btn-save-new-user');
      btn.disabled = true;
      btn.textContent = 'Creating...';

      try {
        await window.dataStore.addUser({
          full_name: fullName,
          email: email,
          role: role,
        });

        window.showToast('User Created', `Successfully provisioned ${fullName} as ${role}.`, 'success');
        closeAddUserModal();
        form.reset();
        await loadUsers();
      } catch (err) {
        window.showToast('Error', err.message || 'Could not provision user', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create User';
      }
    });
  }

  await loadUsers();
});

async function loadUsers() {
  const users = await window.dataStore.getUsers();
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--slate-400);">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const initial = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U';
      const isMustChange = u.must_change_password ?? false;

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="user-avatar" style="background-color: var(--forest-800); width: 30px; height: 30px; font-size: 0.75rem;">
                ${initial}
              </div>
              <div style="font-weight: 600; color: var(--forest-900);">${u.full_name}</div>
            </div>
          </td>
          <td style="color: var(--slate-600);">${u.email}</td>
          <td>
            <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-staff'}">${u.role}</span>
          </td>
          <td>
            <span class="badge ${isMustChange ? 'badge-warning' : 'badge-success'}">
              ${isMustChange ? 'Required on Login' : 'Password Active'}
            </span>
          </td>
          <td style="color: var(--slate-400); font-size: 0.75rem;">
            ${window.formatDateTimeMauritius(u.created_at, false)}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="togglePasswordReq('${u.id}')">
              ${isMustChange ? 'Clear Flag' : 'Force Reset'}
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function togglePasswordReq(userId) {
  await window.dataStore.toggleUserPasswordRequirement(userId);
  window.showToast('Updated', 'User password reset requirement updated.', 'info');
  await loadUsers();
}

function closeAddUserModal() {
  const modal = document.getElementById('add-user-modal');
  if (modal) modal.classList.remove('active');
}

window.closeAddUserModal = closeAddUserModal;
window.togglePasswordReq = togglePasswordReq;
