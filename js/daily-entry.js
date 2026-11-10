// ====================================================================
// AyurDesk - Daily Operational Entry Script
// Supports Reception Handover (Shilpa & Gokul) Overwrite within 24h
// ====================================================================

let pendingData = null;
let currentExistingRecord = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('daily-entry');

  const dateInput = document.getElementById('report_date');
  if (dateInput) {
    dateInput.value = window.getTodayMauritiusDate();
    dateInput.addEventListener('change', () => {
      checkExistingReportForDate(dateInput.value);
    });
  }

  // Setup live calculation listeners
  const numericInputs = [
    'total_enquiries',
    'total_responses',
    'total_confirmations',
    'total_bookings',
    'tomorrow_bookings',
    'whatsapp_calls_messages',
    'normal_calls',
  ];

  numericInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLiveRates);
    }
  });

  // Reset form
  const resetBtn = document.getElementById('btn-reset-form');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all fields in this form?')) {
        document.getElementById('daily-entry-form').reset();
        document.getElementById('report_date').value = window.getTodayMauritiusDate();
        clearErrors();
        updateLiveRates();
        checkExistingReportForDate(document.getElementById('report_date').value);
      }
    });
  }

  // Form submit
  const form = document.getElementById('daily-entry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const validation = validateForm();
      if (!validation.isValid) {
        window.showToast('Validation Failed', 'Please review the highlighted fields.', 'warning');
        return;
      }

      pendingData = validation.parsedValues;
      showConfirmModal(pendingData, currentExistingRecord);
    });
  }

  // Confirm Save button
  const confirmSaveBtn = document.getElementById('btn-confirm-save');
  if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener('click', async () => {
      if (!pendingData) return;
      confirmSaveBtn.disabled = true;
      confirmSaveBtn.textContent = 'Saving...';

      try {
        await window.dataStore.saveReport(pendingData);
        const actionType = currentExistingRecord ? 'overwritten & updated' : 'recorded';
        window.showToast(
          'Record Saved',
          `Operational entry for ${pendingData.report_date} successfully ${actionType}.`,
          'success'
        );
        closeConfirmModal();
        setTimeout(() => {
          window.location.href = 'records.html';
        }, 600);
      } catch (err) {
        window.showToast('Save Failed', err.message || 'Error occurred while saving.', 'error');
        confirmSaveBtn.disabled = false;
        confirmSaveBtn.textContent = 'Confirm & Save';
      }
    });
  }

  // Initial check for default date
  await checkExistingReportForDate(dateInput.value);
});

async function checkExistingReportForDate(dateStr) {
  if (!dateStr) return;
  const user = window.authManager.getCurrentUser();
  const banner = document.getElementById('reception-notice-banner');
  const titleEl = document.getElementById('reception-notice-title');
  const msgEl = document.getElementById('reception-notice-msg');
  const submitBtn = document.getElementById('btn-submit-entry');

  currentExistingRecord = await window.dataStore.getReportByDate(dateStr);

  const numericInputs = [
    'total_enquiries',
    'total_responses',
    'total_confirmations',
    'total_bookings',
    'tomorrow_bookings',
    'whatsapp_calls_messages',
    'normal_calls',
  ];

  if (currentExistingRecord) {
    const editCheck = window.dataStore.canEditReport(currentExistingRecord, user);

    if (banner) banner.style.display = 'flex';

    if (editCheck.canEdit) {
      // Allowed to overwrite within 24h
      banner.style.backgroundColor = '#f0fdf4';
      banner.style.borderColor = '#bbf7d0';
      titleEl.style.color = '#15803d';
      titleEl.textContent = 'Existing Report Detected – Reception Handover Active';

      const creator = currentExistingRecord.created_by_name || 'reception staff';
      msgEl.style.color = '#166534';
      msgEl.textContent = `A report for ${dateStr} was previously submitted by ${creator}. As reception staff, you have access to overwrite and update today's statistics within the 24-hour window. Current figures have been loaded below.`;

      // Prepopulate
      numericInputs.forEach((field) => {
        const input = document.getElementById(field);
        if (input) {
          input.value = currentExistingRecord[field] ?? '';
          input.disabled = false;
        }
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i><span>Overwrite & Update Daily Record</span>';
      }
    } else {
      // Locked: > 24 hours old and user is staff
      banner.style.backgroundColor = '#fffbeb';
      banner.style.borderColor = '#fde68a';
      titleEl.style.color = '#92400e';
      titleEl.textContent = 'Editing Locked – 24-Hour Window Expired';

      msgEl.style.color = '#b45309';
      msgEl.textContent = editCheck.reason || 'This record was submitted over 24 hours ago. Staff editing is locked. Only administrators have permission to modify historical records older than 24 hours.';

      // Prepopulate for viewing only
      numericInputs.forEach((field) => {
        const input = document.getElementById(field);
        if (input) {
          input.value = currentExistingRecord[field] ?? '';
          input.disabled = true;
        }
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="lock" style="width: 18px; height: 18px;"></i><span>Editing Locked (>24h)</span>';
      }
    }
  } else {
    // New Record
    if (banner) banner.style.display = 'none';

    numericInputs.forEach((field) => {
      const input = document.getElementById(field);
      if (input) input.disabled = false;
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="save" style="width: 18px; height: 18px;"></i><span>Save Daily Record</span>';
    }
  }

  updateLiveRates();
  if (window.lucide) window.lucide.createIcons();
}

function parseOptionalInt(id) {
  const el = document.getElementById(id);
  if (!el || el.value.trim() === '') return null;
  const num = Number(el.value.trim());
  return isNaN(num) ? NaN : num;
}

function updateLiveRates() {
  const enquiries = parseOptionalInt('total_enquiries');
  const responses = parseOptionalInt('total_responses');
  const bookings = parseOptionalInt('total_bookings');
  const wa = parseOptionalInt('whatsapp_calls_messages') || 0;
  const normal = parseOptionalInt('normal_calls') || 0;

  // Response rate
  const respEl = document.getElementById('live-response-rate');
  if (enquiries && responses !== null && enquiries > 0) {
    const rate = Math.round((responses / enquiries) * 100);
    respEl.textContent = `${rate}%`;
  } else {
    respEl.textContent = '--%';
  }

  // Conversion rate
  const convEl = document.getElementById('live-conversion-rate');
  if (enquiries && bookings !== null && enquiries > 0) {
    const rate = Math.round((bookings / enquiries) * 100);
    convEl.textContent = `${rate}%`;
  } else {
    convEl.textContent = '--%';
  }

  // Total comms
  const totalComms =
    parseOptionalInt('whatsapp_calls_messages') !== null || parseOptionalInt('normal_calls') !== null
      ? wa + normal
      : '--';
  document.getElementById('live-total-comms').textContent = totalComms;
}

function clearErrors() {
  const errEls = document.querySelectorAll('.form-error');
  errEls.forEach((el) => (el.textContent = ''));
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach((el) => el.classList.remove('is-invalid'));
}

function validateForm() {
  let isValid = true;
  const errors = {};

  const reportDate = document.getElementById('report_date').value.trim();
  if (!reportDate) {
    errors.report_date = 'Report date is required.';
    isValid = false;
  }

  const fields = [
    'total_enquiries',
    'total_responses',
    'total_confirmations',
    'total_bookings',
    'tomorrow_bookings',
    'whatsapp_calls_messages',
    'normal_calls',
  ];

  const parsed = {
    report_date: reportDate,
  };

  fields.forEach((field) => {
    const val = parseOptionalInt(field);
    if (isNaN(val)) {
      errors[field] = 'Must be a valid integer.';
      isValid = false;
    } else if (val !== null && val < 0) {
      errors[field] = 'Cannot be negative.';
      isValid = false;
    }
    parsed[field] = val;
  });

  if (!isValid) {
    Object.keys(errors).forEach((key) => {
      const errEl = document.getElementById(`err-${key}`);
      const inputEl = document.getElementById(key);
      if (errEl) errEl.textContent = errors[key];
      if (inputEl) inputEl.classList.add('is-invalid');
    });
  }

  return { isValid, errors, parsedValues: parsed };
}

function showConfirmModal(data, existing) {
  document.getElementById('confirm-date').textContent = data.report_date;
  document.getElementById('confirm-enquiries').textContent = data.total_enquiries ?? 'Not recorded';
  document.getElementById('confirm-responses').textContent = data.total_responses ?? 'Not recorded';
  document.getElementById('confirm-bookings').textContent = data.total_bookings ?? 'Not recorded';
  document.getElementById('confirm-tomorrow').textContent = data.tomorrow_bookings ?? 'Not recorded';

  const modalTitle = document.querySelector('#confirm-modal .modal-title');
  if (modalTitle) {
    modalTitle.textContent = existing ? 'Confirm Overwrite & Update' : 'Confirm Submission';
  }

  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.add('active');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.remove('active');
  const confirmSaveBtn = document.getElementById('btn-confirm-save');
  if (confirmSaveBtn) {
    confirmSaveBtn.disabled = false;
    confirmSaveBtn.textContent = 'Confirm & Save';
  }
}

window.closeConfirmModal = closeConfirmModal;
