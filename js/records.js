// ====================================================================
// AyurDesk - All Records Page Script
// ====================================================================

let allRecords = [];
let filteredRecords = [];
let currentPage = 1;
const pageSize = 15;
let recordToDeleteId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('records');

  const isAdmin = window.authManager.isAdmin();
  const exportBtn = document.getElementById('records-export-btn');
  if (exportBtn && isAdmin) {
    exportBtn.style.display = 'inline-flex';
  }

  // Setup search & filters
  const searchInput = document.getElementById('filter-search');
  const fromDateInput = document.getElementById('filter-from-date');
  const toDateInput = document.getElementById('filter-to-date');
  const clearBtn = document.getElementById('btn-clear-filters');

  searchInput.addEventListener('input', applyFilters);
  fromDateInput.addEventListener('change', applyFilters);
  toDateInput.addEventListener('change', applyFilters);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    fromDateInput.value = '';
    toDateInput.value = '';
    applyFilters();
  });

  // Setup pagination buttons
  document.getElementById('btn-prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  document.getElementById('btn-next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  // Anomaly banner fix button
  const fixBtn = document.getElementById('records-fix-anomaly-btn');
  if (fixBtn) {
    fixBtn.addEventListener('click', async () => {
      fixBtn.disabled = true;
      fixBtn.textContent = 'Resolving...';
      const ok = await window.dataStore.resolveAnomaly('2026-10-26');
      if (ok) {
        window.showToast('Anomaly Resolved', 'Date corrected to 2026-10-26 and logged in audit ledger.', 'success');
        await loadRecords();
      }
      fixBtn.disabled = false;
      fixBtn.textContent = 'Resolve to 2026-10-26';
    });
  }

  // Edit form submit
  document.getElementById('edit-record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-record-id').value;
    const date = document.getElementById('edit-date').value.trim();

    const parseNum = (elemId) => {
      const val = document.getElementById(elemId).value.trim();
      return val === '' ? null : Number(val);
    };

    const patch = {
      report_date: date,
      total_enquiries: parseNum('edit-enquiries'),
      total_responses: parseNum('edit-responses'),
      total_confirmations: parseNum('edit-confirmations'),
      total_bookings: parseNum('edit-bookings'),
      tomorrow_bookings: parseNum('edit-tomorrow'),
      whatsapp_calls_messages: parseNum('edit-whatsapp'),
      normal_calls: parseNum('edit-normal'),
    };

    try {
      await window.dataStore.updateReport(id, patch);
      window.showToast('Record Updated', `Successfully updated operational record for ${date}.`, 'success');
      closeEditModal();
      await loadRecords();
    } catch (err) {
      window.showToast('Update Failed', err.message || 'Error updating record', 'error');
    }
  });

  // Delete confirm button
  document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    if (!recordToDeleteId) return;
    try {
      await window.dataStore.deleteReport(recordToDeleteId);
      window.showToast('Record Deleted', 'The operational record was deleted and logged in the audit ledger.', 'info');
      closeDeleteModal();
      await loadRecords();
    } catch (err) {
      window.showToast('Deletion Failed', err.message || 'Error deleting record', 'error');
    }
  });

  await loadRecords();
});

async function loadRecords() {
  allRecords = await window.dataStore.getReports();
  applyFilters();
}

function applyFilters() {
  const query = document.getElementById('filter-search').value.toLowerCase().trim();
  const fromDate = document.getElementById('filter-from-date').value;
  const toDate = document.getElementById('filter-to-date').value;

  filteredRecords = allRecords.filter((r) => {
    if (query && !r.report_date.toLowerCase().includes(query)) {
      return false;
    }
    if (fromDate && r.report_date < fromDate) {
      return false;
    }
    if (toDate && r.report_date > toDate) {
      return false;
    }
    return true;
  });

  currentPage = 1;
  document.getElementById('filter-count').textContent = filteredRecords.length;

  // Anomaly check
  const hasAnomaly = allRecords.some((r) => r.report_date === '2027-10-26');
  const banner = document.getElementById('records-anomaly-banner');
  if (banner) {
    banner.style.display = hasAnomaly ? 'flex' : 'none';
  }

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('records-table-body');
  const isAdmin = window.authManager.isAdmin();

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  document.getElementById('current-page-num').textContent = currentPage;
  document.getElementById('total-page-num').textContent = totalPages;

  document.getElementById('btn-prev-page').disabled = currentPage <= 1;
  document.getElementById('btn-next-page').disabled = currentPage >= totalPages;

  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filteredRecords.slice(startIdx, startIdx + pageSize);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--slate-400);">No matching records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = pageItems
    .map((r) => {
      const isAnomaly = r.report_date === '2027-10-26';
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.min(100, Math.round((r.total_responses / r.total_enquiries) * 100)) + '%'
          : '-';

      const conversion =
        r.total_enquiries && r.total_bookings
          ? Math.round((r.total_bookings / r.total_enquiries) * 100) + '%'
          : '-';

      return `
        <tr class="${isAnomaly ? 'anomaly-row' : ''}">
          <td>
            <div style="font-weight: 600; color: var(--forest-900); display: flex; align-items: center; gap: 0.35rem;">
              <span>${window.formatDateDisplay(r.report_date)}</span>
              ${isAnomaly ? '<span class="badge badge-warning" style="font-size: 0.6rem;">Anomaly</span>' : ''}
            </div>
            <div style="font-size: 0.6875rem; color: var(--slate-400);">${r.report_date}</div>
          </td>
          <td class="numeric">${r.total_enquiries ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.total_responses ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric"><span class="badge ${turnaround === '100%' ? 'badge-success' : 'badge-neutral'}">${turnaround}</span></td>
          <td class="numeric" style="font-weight: 700; color: var(--forest-900);">${r.total_bookings ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric"><span class="badge badge-forest">${conversion}</span></td>
          <td class="numeric">${r.tomorrow_bookings ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.whatsapp_calls_messages ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.normal_calls ?? '<span class="empty-cell">-</span>'}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; align-items: center; gap: 0.25rem;">
              <button class="btn btn-secondary btn-icon-only" title="Edit Record" onclick="openEditModal('${r.id}')">
                <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
              </button>
              ${
                isAdmin
                  ? `<button class="btn btn-secondary btn-icon-only" style="color: var(--danger-600);" title="Delete Record" onclick="openDeleteModal('${r.id}', '${r.report_date}')">
                       <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                     </button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  if (window.lucide) {
    window.lucide.createIcons({ root: tbody });
  }
}

// Edit Modal Functions
async function openEditModal(recordId) {
  const record = await window.dataStore.getReportById(recordId);
  if (!record) return;

  document.getElementById('edit-record-id').value = record.id;
  document.getElementById('edit-date').value = record.report_date;
  document.getElementById('edit-enquiries').value = record.total_enquiries ?? '';
  document.getElementById('edit-responses').value = record.total_responses ?? '';
  document.getElementById('edit-confirmations').value = record.total_confirmations ?? '';
  document.getElementById('edit-bookings').value = record.total_bookings ?? '';
  document.getElementById('edit-tomorrow').value = record.tomorrow_bookings ?? '';
  document.getElementById('edit-whatsapp').value = record.whatsapp_calls_messages ?? '';
  document.getElementById('edit-normal').value = record.normal_calls ?? '';

  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('active');
}

// Delete Modal Functions
function openDeleteModal(recordId, dateStr) {
  recordToDeleteId = recordId;
  document.getElementById('delete-record-date').textContent = dateStr;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
  recordToDeleteId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.remove('active');
}

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;

