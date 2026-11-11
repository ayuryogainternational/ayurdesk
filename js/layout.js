// ====================================================================
// AyurDesk - Shared Application Layout, Header Clock & Notifications
// Organization: Ayuryoga International
// ====================================================================

function initAppLayout(activePageKey) {
  const user = window.authManager ? window.authManager.getCurrentUser() : null;
  const isAdmin = window.authManager ? window.authManager.isAdmin() : false;

  // 1. Render Sidebar
  const sidebarContainer = document.getElementById('app-sidebar');
  if (sidebarContainer) {
    const navItems = [
      { key: 'dashboard', href: 'index.html', label: 'Dashboard', icon: 'layout-dashboard' },
      { key: 'daily-entry', href: 'daily-entry.html', label: 'Add Daily Report', icon: 'plus-circle' },
      { key: 'therapist-hours', href: 'therapist-hours.html', label: 'Therapist Hours', icon: 'clock' },
      { key: 'records', href: 'records.html', label: 'All Records', icon: 'table-properties' },
      { key: 'analytics', href: 'analytics.html', label: 'Analytics', icon: 'bar-chart-3' },
      // Admin Items
      { key: 'reports', href: 'reports.html', label: 'Export Reports', icon: 'file-spreadsheet', adminOnly: true },
      { key: 'users', href: 'users.html', label: 'User Management', icon: 'users', adminOnly: true },
      { key: 'audit-logs', href: 'audit-logs.html', label: 'Audit Logs', icon: 'history', adminOnly: true },
      // General
      { key: 'settings', href: 'settings.html', label: 'Settings', icon: 'settings' },
    ];

    let navHtml = `
      <div class="sidebar-header">
        <div class="brand-icon-box">
          <i data-lucide="layers"></i>
        </div>
        <div>
          <div class="brand-title">AyurDesk</div>
          <div class="brand-subtitle">Ayuryoga Int'l</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Operations</div>
    `;

    navItems.forEach((item, index) => {
      if (item.adminOnly && !isAdmin) return; // Hide admin pages for staff

      if (item.key === 'reports' && isAdmin) {
        navHtml += `<div class="nav-section-label" style="margin-top: 0.75rem;">Administration</div>`;
      } else if (item.key === 'settings') {
        navHtml += `<div class="nav-section-label" style="margin-top: 0.75rem;">System</div>`;
      }

      const isActive = item.key === activePageKey;
      navHtml += `
        <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
          ${item.adminOnly ? '<span class="nav-badge-admin">Admin</span>' : ''}
        </a>
      `;
    });

    const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
    const userName = user?.full_name || 'Guest User';
    const userRole = user?.role || 'staff';

    navHtml += `
      </nav>

      <div class="sidebar-footer">
        <div class="user-mini-profile">
          <div class="user-avatar">${userInitial}</div>
          <div class="user-info-text">
            <div class="user-name">${userName}</div>
            <div class="user-role-badge">${userRole}</div>
          </div>
        </div>
        <button id="sidebar-logout-btn" class="btn-logout-icon" title="Sign Out">
          <i data-lucide="log-out"></i>
        </button>
      </div>
    `;

    sidebarContainer.innerHTML = navHtml;

    // Attach logout event
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign out of AyurDesk?')) {
          window.authManager.signOut();
        }
      });
    }
  }

  // 2. Render Top Header
  const headerContainer = document.getElementById('app-header');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="header-left">
        <button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="Toggle Menu">
          <i data-lucide="menu"></i>
        </button>
        <div class="org-tag">
          Ayuryoga International <span style="color: var(--slate-300); margin: 0 4px;">•</span> Operations Control
        </div>
      </div>
      <div class="header-right">
        <div class="clock-pill">
          <i data-lucide="clock"></i>
          <span>Mauritius: <strong id="live-mauritius-time">--:--:--</strong></span>
        </div>
        <span class="badge ${isAdmin ? 'badge-admin' : 'badge-staff'}">${user?.role || 'staff'}</span>
      </div>
    `;

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (mobileBtn && sidebarContainer) {
      mobileBtn.addEventListener('click', () => {
        sidebarContainer.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }
    if (backdrop && sidebarContainer) {
      backdrop.addEventListener('click', () => {
        sidebarContainer.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }

    // Live Mauritius Clock
    updateMauritiusClock();
    setInterval(updateMauritiusClock, 1000);
  }

  // 3. Ensure Toast Container exists
  if (!document.getElementById('toast-container')) {
    const toastBox = document.createElement('div');
    toastBox.id = 'toast-container';
    toastBox.className = 'toast-container';
    document.body.appendChild(toastBox);
  }

  // 4. Initialize Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function updateMauritiusClock() {
  const clockEl = document.getElementById('live-mauritius-time');
  if (!clockEl) return;
  try {
    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Indian/Mauritius',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
    clockEl.textContent = timeStr;
  } catch (e) {
    clockEl.textContent = new Date().toLocaleTimeString();
  }
}

// Toast Notifications
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 18px; height: 18px; flex-shrink: 0; color: currentColor;"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

window.initAppLayout = initAppLayout;
window.showToast = showToast;

