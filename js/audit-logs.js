// ====================================================================
// AyurDesk - Immutable Audit Trail Script
// ====================================================================

let allLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth(true)) return;

  window.initAppLayout('audit-logs');

  const actionFilter = document.getElementById('filter-audit-action');
  actionFilter.addEventListener('change', renderAuditTable);

  const refreshBtn = document.getElementById('btn-refresh-audit');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    await loadAuditLogs();
    refreshBtn.disabled = false;
    window.showToast('Audit Ledger Refreshed', 'Latest events loaded.', 'info');
  });

  await loadAuditLogs();
});

async function loadAuditLogs() {
  allLogs = await window.dataStore.getAuditLogs();
  renderAuditTable();
}

function renderAuditTable() {
  const filter = document.getElementById('filter-audit-action').value;
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  const filtered = filter === 'all' ? allLogs : allLogs.filter((l) => l.action === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--slate-400);">No matching audit events found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((log) => {
      let badgeClass = 'badge-neutral';
      if (log.action === 'INSERT') badgeClass = 'badge-success';
      else if (log.action === 'UPDATE') badgeClass = 'badge-warning';
      else if (log.action === 'DELETE') badgeClass = 'badge-danger';

      return `
        <tr>
          <td style="font-size: 0.75rem; color: var(--slate-500); font-variant-numeric: tabular-nums;">
            ${window.formatDateTimeMauritius(log.performed_at, true)}
          </td>
          <td>
            <span class="badge ${badgeClass}">${log.action}</span>
          </td>
          <td style="font-family: monospace; font-size: 0.75rem; color: var(--forest-900);">
            ${log.table_name}
          </td>
          <td style="font-family: monospace; font-size: 0.75rem; color: var(--slate-500);">
            ${log.record_id}
          </td>
          <td>
            <div style="font-weight: 600; color: var(--forest-900); font-size: 0.8125rem;">
              ${log.performed_by_name || 'System Automated'}
            </div>
            <div style="font-size: 0.6875rem; color: var(--slate-400); text-transform: capitalize;">
              Role: ${log.performed_by_role || 'system'}
            </div>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="inspectAuditLog('${log.id}')">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              <span>Inspect</span>
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  if (window.lucide) {
    window.lucide.createIcons({ root: tbody });
  }
}

function inspectAuditLog(logId) {
  const log = allLogs.find((l) => l.id === logId);
  if (!log) return;

  document.getElementById('diff-action').textContent = log.action;
  document.getElementById('diff-table').textContent = log.table_name;
  document.getElementById('diff-performer').textContent = `${log.performed_by_name} (${log.performed_by_role})`;
  document.getElementById('diff-time').textContent = window.formatDateTimeMauritius(log.performed_at);

  const payload = {
    action: log.action,
    changed_fields: log.changed_fields,
    new_data: log.new_data,
    old_data: log.old_data,
  };

  document.getElementById('diff-json').textContent = JSON.stringify(payload, null, 2);
  document.getElementById('audit-diff-modal').classList.add('active');
}

function closeDiffModal() {
  document.getElementById('audit-diff-modal').classList.remove('active');
}

window.inspectAuditLog = inspectAuditLog;
window.closeDiffModal = closeDiffModal;

