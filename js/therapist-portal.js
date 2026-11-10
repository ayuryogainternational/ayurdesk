// ====================================================================
// AyurDesk - Therapist Portal & Attendance Script
// Daily 2-Shift Marking, Off Days, Overtime (75 MUR/hr > 5h), & Works
// Organization: Ayuryoga International
// ====================================================================

let currentRecord = null;
let currentSelectedDate = '';

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth({ therapistOnly: true })) return;

  window.initAppLayout('therapist-portal');

  const today = window.getTodayMauritiusDate ? window.getTodayMauritiusDate() : new Date().toISOString().split('T')[0];
  currentSelectedDate = today;

  const dateInput = document.getElementById('duty-date');
  if (dateInput) {
    dateInput.value = today;
    dateInput.addEventListener('change', async () => {
      currentSelectedDate = dateInput.value || today;
      await loadTherapistDay(currentSelectedDate);
    });
  }

  // Setup Punch Buttons
  document.getElementById('btn-punch-in-1').addEventListener('click', () => punchTimeNow('check_in_1'));
  document.getElementById('btn-punch-out-1').addEventListener('click', () => punchTimeNow('check_out_1'));
  document.getElementById('btn-punch-in-2').addEventListener('click', () => punchTimeNow('check_in_2'));
  document.getElementById('btn-punch-out-2').addEventListener('click', () => punchTimeNow('check_out_2'));

  // Setup Live Time Input Listeners
  ['check_in_1', 'check_out_1', 'check_in_2', 'check_out_2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLiveHoursCalculation);
      el.addEventListener('change', updateLiveHoursCalculation);
    }
  });

  // Setup Off Day Toggle
  const checkOffDay = document.getElementById('check-off-day');
  const offDayReason = document.getElementById('off-day-reason');
  const offDayReasonBox = document.getElementById('off-day-reason-box');
  const btnResumeDuty = document.getElementById('btn-resume-duty');

  checkOffDay.addEventListener('change', async () => {
    const isOff = checkOffDay.checked;
    offDayReasonBox.style.display = isOff ? 'flex' : 'none';
    const reason = offDayReason.value || 'Weekly Off';
    await toggleOffDayStatus(isOff, reason);
  });

  offDayReason.addEventListener('change', async () => {
    if (checkOffDay.checked) {
      await toggleOffDayStatus(true, offDayReason.value);
    }
  });

  if (btnResumeDuty) {
    btnResumeDuty.addEventListener('click', async () => {
      checkOffDay.checked = false;
      offDayReasonBox.style.display = 'none';
      await toggleOffDayStatus(false, null);
    });
  }

  // Setup Save Attendance Button
  document.getElementById('btn-save-attendance').addEventListener('click', handleSaveAttendance);

  // Setup Modal Add Work
  const modalAddWork = document.getElementById('modal-add-work');
  const btnOpenWorkModal = document.getElementById('btn-open-work-modal');
  const btnCloseWorkModal = document.getElementById('btn-close-work-modal');
  const btnCancelWork = document.getElementById('btn-cancel-work');
  const formAddWork = document.getElementById('form-add-work');

  btnOpenWorkModal.addEventListener('click', () => {
    modalAddWork.classList.add('active');
  });

  const closeModal = () => modalAddWork.classList.remove('active');
  btnCloseWorkModal.addEventListener('click', closeModal);
  btnCancelWork.addEventListener('click', closeModal);

  // Modal time calculation
  const workStart = document.getElementById('work-start-time');
  const workEnd = document.getElementById('work-end-time');
  const workDuration = document.getElementById('work-duration');

  const updateModalDuration = () => {
    const s = workStart.value;
    const e = workEnd.value;
    if (s && e) {
      const [sh, sm] = s.split(':').map(Number);
      const [eh, em] = e.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) {
        workDuration.value = +(diff / 60).toFixed(2);
      }
    }
  };
  workStart.addEventListener('change', updateModalDuration);
  workEnd.addEventListener('change', updateModalDuration);

  formAddWork.addEventListener('submit', handleAddWorkSubmit);

  // Live broadcast listener
  window.addEventListener('ayurdesk:data-updated', async () => {
    await loadTherapistDay(currentSelectedDate);
  });

  // Initial Load
  await loadTherapistDay(currentSelectedDate);
});

function punchTimeNow(fieldId) {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Indian/Mauritius',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const input = document.getElementById(fieldId);
  if (input) {
    input.value = timeStr;
    updateLiveHoursCalculation();
    window.showToast('Time Stamped', `Punched ${fieldId.replace(/_/g, ' ').toUpperCase()} at ${timeStr}`, 'info');
  }
}

async function loadTherapistDay(dateStr) {
  const user = window.authManager.getCurrentUser();
  if (!user) return;

  currentRecord = await window.dataStore.getTherapistRecordForDate(user.id, dateStr);

  // 1. Off Day UI
  const checkOffDay = document.getElementById('check-off-day');
  const offDayReason = document.getElementById('off-day-reason');
  const offDayReasonBox = document.getElementById('off-day-reason-box');
  const activeDutySection = document.getElementById('active-duty-section');
  const offDayNotice = document.getElementById('off-day-view-notice');
  const offDayReasonText = document.getElementById('off-day-reason-text');

  if (currentRecord.is_off_day) {
    checkOffDay.checked = true;
    offDayReasonBox.style.display = 'flex';
    if (currentRecord.off_day_reason) offDayReason.value = currentRecord.off_day_reason;
    activeDutySection.style.display = 'none';
    offDayNotice.style.display = 'block';
    offDayReasonText.textContent = `This day is officially registered as "${currentRecord.off_day_reason || 'Weekly Off'}". Clinical working hours and treatment duty are paused.`;
  } else {
    checkOffDay.checked = false;
    offDayReasonBox.style.display = 'none';
    activeDutySection.style.display = 'block';
    offDayNotice.style.display = 'none';
  }

  // 2. Populate Shift Inputs
  document.getElementById('check_in_1').value = currentRecord.check_in_1 || '';
  document.getElementById('check_out_1').value = currentRecord.check_out_1 || '';
  document.getElementById('check_in_2').value = currentRecord.check_in_2 || '';
  document.getElementById('check_out_2').value = currentRecord.check_out_2 || '';

  // 3. Render Works List
  renderWorksList(currentRecord.works || []);

  // 4. Update Live Calculations
  updateLiveHoursCalculation();

  // 5. Update Monthly Statement
  await updateMonthlyStatement(dateStr);
}

function calculateHoursDifference(inTime, outTime) {
  if (!inTime || !outTime) return 0;
  const [inH, inM] = inTime.split(':').map(Number);
  const [outH, outM] = outTime.split(':').map(Number);
  if (isNaN(inH) || isNaN(outH)) return 0;
  const startMins = inH * 60 + (inM || 0);
  const endMins = outH * 60 + (outM || 0);
  if (endMins >= startMins) {
    return +((endMins - startMins) / 60).toFixed(2);
  }
  return 0;
}

function updateLiveHoursCalculation() {
  const in1 = document.getElementById('check_in_1').value;
  const out1 = document.getElementById('check_out_1').value;
  const in2 = document.getElementById('check_in_2').value;
  const out2 = document.getElementById('check_out_2').value;

  const h1 = calculateHoursDifference(in1, out1);
  const h2 = calculateHoursDifference(in2, out2);
  const total = +(h1 + h2).toFixed(2);

  document.getElementById('display-shift-1-hours').textContent = `${h1.toFixed(2)} hrs`;
  document.getElementById('display-shift-2-hours').textContent = `${h2.toFixed(2)} hrs`;

  // Standard Shift quota = 5.0 hours
  const regular = Math.min(5.0, total);
  const overtime = +(Math.max(0, total - 5.0)).toFixed(2);
  const isOvertime = total > 5.0;
  const overtimeRate = 75; // 75 MUR / hour
  const overtimeSalary = +(overtime * overtimeRate).toFixed(2);

  document.getElementById('calc-total-hours').textContent = `${total.toFixed(2)} hrs`;
  document.getElementById('calc-regular-hours').textContent = `${regular.toFixed(2)} hrs`;
  document.getElementById('calc-overtime-hours').textContent = `${overtime.toFixed(2)} hrs`;
  document.getElementById('calc-overtime-salary').textContent = `${overtimeSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`;

  // Status Badge
  const statusPill = document.getElementById('overtime-status-pill');
  if (isOvertime) {
    statusPill.innerHTML = `
      <span class="badge badge-overtime" style="font-size: 0.8125rem; padding: 0.35rem 0.75rem;">
        ⚡ OVERTIME ACTIVE (+${overtime.toFixed(2)} hrs @ 75 MUR/hr)
      </span>
    `;
  } else if (total > 0) {
    statusPill.innerHTML = `<span class="badge badge-standard">Standard Shift (${total.toFixed(2)}h ≤ 5.0h)</span>`;
  } else {
    statusPill.innerHTML = `<span class="badge badge-staff">No Attendance Punched</span>`;
  }
}

async function handleSaveAttendance() {
  const btn = document.getElementById('btn-save-attendance');
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="save"></i><span>Saving...</span>';

  try {
    const in1 = document.getElementById('check_in_1').value;
    const out1 = document.getElementById('check_out_1').value;
    const in2 = document.getElementById('check_in_2').value;
    const out2 = document.getElementById('check_out_2').value;

    const payload = {
      ...currentRecord,
      check_in_1: in1 || null,
      check_out_1: out1 || null,
      check_in_2: in2 || null,
      check_out_2: out2 || null,
      is_off_day: false,
      off_day_reason: null,
    };

    currentRecord = await window.dataStore.saveTherapistRecord(payload);
    window.showToast('Attendance Saved', `Hours and overtime for ${currentSelectedDate} recorded successfully.`, 'success');
    await updateMonthlyStatement(currentSelectedDate);
  } catch (err) {
    window.showToast('Save Error', err.message || 'Failed to save attendance', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="save"></i><span>Save Attendance & Calculate Overtime</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

async function toggleOffDayStatus(isOff, reason) {
  try {
    currentRecord = await window.dataStore.markTherapistOffDay(
      currentRecord.therapist_id,
      currentSelectedDate,
      isOff,
      reason
    );
    window.showToast('Status Updated', isOff ? `Marked ${currentSelectedDate} as Off Day (${reason})` : 'Resumed active clinical duty.', 'info');
    await loadTherapistDay(currentSelectedDate);
  } catch (err) {
    window.showToast('Update Failed', err.message || 'Could not update status', 'error');
  }
}

function renderWorksList(works) {
  const tbody = document.getElementById('works-list-body');
  const countEl = document.getElementById('display-works-count');
  const durEl = document.getElementById('display-works-duration');

  const count = works.length;
  const totalDuration = +works.reduce((acc, w) => acc + (Number(w.duration_hours) || 0), 0).toFixed(2);

  countEl.textContent = `${count} works`;
  durEl.textContent = `${totalDuration.toFixed(2)} hrs`;

  if (count === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-400);">No treatments logged for this date yet. Click "+ Log Completed Treatment Work" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = works
    .map((w, index) => {
      return `
        <tr>
          <td style="font-weight: 700; color: var(--slate-500);">${index + 1}</td>
          <td style="font-weight: 700; color: var(--forest-900);">${w.patient_name}</td>
          <td><span class="badge badge-teal">${w.treatment_type}</span></td>
          <td>${w.start_time || '-'}</td>
          <td>${w.end_time || '-'}</td>
          <td class="numeric" style="font-weight: 800; color: var(--forest-800);">${Number(w.duration_hours).toFixed(2)} hrs</td>
          <td style="font-size: 0.75rem; color: var(--slate-600);">${w.notes || '-'}</td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-outline" style="padding: 0.2rem 0.5rem; color: #dc2626; border-color: #fca5a5;" onclick="deleteWork('${w.id}')" title="Delete entry">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  if (window.lucide) window.lucide.createIcons();
}

async function handleAddWorkSubmit(e) {
  e.preventDefault();
  const patient = document.getElementById('work-patient').value.trim();
  const treatment = document.getElementById('work-treatment-type').value;
  const start = document.getElementById('work-start-time').value;
  const end = document.getElementById('work-end-time').value;
  const duration = Number(document.getElementById('work-duration').value) || 1.0;
  const notes = document.getElementById('work-notes').value.trim();

  try {
    currentRecord = await window.dataStore.addTherapistWork(currentRecord.therapist_id, currentSelectedDate, {
      patient_name: patient,
      treatment_type: treatment,
      start_time: start,
      end_time: end,
      duration_hours: duration,
      notes: notes,
    });

    window.showToast('Treatment Logged', `Recorded ${treatment} for ${patient} (${duration} hrs).`, 'success');
    document.getElementById('modal-add-work').classList.remove('active');
    document.getElementById('form-add-work').reset();
    document.getElementById('work-duration').value = '1.25';
    renderWorksList(currentRecord.works || []);
    await updateMonthlyStatement(currentSelectedDate);
  } catch (err) {
    window.showToast('Failed to Add Work', err.message || 'Error occurred', 'error');
  }
}

async function deleteWork(workId) {
  if (!confirm('Remove this completed treatment work entry?')) return;
  try {
    currentRecord = await window.dataStore.deleteTherapistWork(
      currentRecord.therapist_id,
      currentSelectedDate,
      workId
    );
    window.showToast('Work Deleted', 'Treatment entry removed from daily ledger.', 'info');
    renderWorksList(currentRecord.works || []);
    await updateMonthlyStatement(currentSelectedDate);
  } catch (err) {
    window.showToast('Delete Failed', err.message || 'Could not delete entry', 'error');
  }
}

async function updateMonthlyStatement(dateStr) {
  const user = window.authManager.getCurrentUser();
  if (!user) return;

  const monthKey = dateStr.substring(0, 7); // "YYYY-MM"
  const records = await window.dataStore.getTherapistRecords({
    therapist_id: user.id,
    month: monthKey,
  });

  let days = 0;
  let offdays = 0;
  let worksCount = 0;
  let hours = 0;
  let overtimeHours = 0;
  let overtimeSalary = 0;

  records.forEach((r) => {
    if (r.is_off_day) {
      offdays++;
    } else {
      if (r.total_working_hours > 0) days++;
      worksCount += r.works_count || (r.works ? r.works.length : 0);
      hours += Number(r.total_working_hours) || 0;
      overtimeHours += Number(r.overtime_hours) || 0;
      overtimeSalary += Number(r.overtime_salary) || 0;
    }
  });

  document.getElementById('m-stat-days').textContent = `${days} days`;
  document.getElementById('m-stat-offdays').textContent = `${offdays} days`;
  document.getElementById('m-stat-works').textContent = `${worksCount} works`;
  document.getElementById('m-stat-hours').textContent = `${hours.toFixed(2)} hrs`;
  document.getElementById('m-stat-overtime').textContent = `${overtimeHours.toFixed(2)} hrs`;
  document.getElementById('m-stat-salary').textContent = `${overtimeSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`;

  const monthLabel = document.getElementById('monthly-badge-label');
  if (monthLabel) {
    monthLabel.textContent = `Month: ${monthKey}`;
  }
}

window.deleteWork = deleteWork;
