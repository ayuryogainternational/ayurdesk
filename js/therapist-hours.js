// ====================================================================
// AyurDesk - Therapist Daily Working Hours & Overtime Management Script
// Organization: Ayuryoga International
// 3 Branches: Grand Baie, Curepipe, Moka (12 Therapists)
// Overtime Rule: > 5 hours => 75 MUR/hour
// Accessible to: Front Desk Staff (Shilpa & Gokul) and Administrators
// ====================================================================

let currentDateStr = '';
let activeBranchFilter = 'all';
let currentDailyList = [];
let isDirty = false;

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('therapist-hours');

  const user = window.authManager.getCurrentUser();
  const userTag = document.getElementById('current-user-tag');
  if (userTag && user) {
    userTag.textContent = `${user.full_name} (${user.role.toUpperCase()})`;
  }

  // Set default date to today in Mauritius
  currentDateStr = window.getTodayMauritiusDate
    ? window.getTodayMauritiusDate()
    : new Date().toISOString().split('T')[0];

  const dateInput = document.getElementById('input-duty-date');
  if (dateInput) {
    dateInput.value = currentDateStr;
    dateInput.addEventListener('change', (e) => {
      currentDateStr = e.target.value;
      loadDailyHours();
    });
  }

  // Setup previous / today / next day buttons
  const btnPrev = document.getElementById('btn-prev-day');
  const btnToday = document.getElementById('btn-today');
  const btnNext = document.getElementById('btn-next-day');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      shiftDate(-1);
    });
  }
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      currentDateStr = window.getTodayMauritiusDate
        ? window.getTodayMauritiusDate()
        : new Date().toISOString().split('T')[0];
      if (dateInput) dateInput.value = currentDateStr;
      loadDailyHours();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      shiftDate(1);
    });
  }

  // View Mode Switcher
  const btnDailyMode = document.getElementById('view-mode-daily');
  const btnMonthlyMode = document.getElementById('view-mode-monthly');
  const sectionDaily = document.getElementById('section-daily-entry');
  const sectionMonthly = document.getElementById('section-monthly-summary');

  if (btnDailyMode && btnMonthlyMode && sectionDaily && sectionMonthly) {
    btnDailyMode.addEventListener('click', () => {
      btnDailyMode.classList.add('active');
      btnMonthlyMode.classList.remove('active');
      sectionDaily.style.display = 'block';
      sectionMonthly.style.display = 'none';
      loadDailyHours();
    });

    btnMonthlyMode.addEventListener('click', () => {
      btnMonthlyMode.classList.add('active');
      btnDailyMode.classList.remove('active');
      sectionDaily.style.display = 'none';
      sectionMonthly.style.display = 'block';
      loadMonthlySummary();
    });
  }

  // Branch filter tabs (All, Grand Baie, Curepipe, Moka)
  const branchTabs = document.querySelectorAll('.branch-tab');
  branchTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      branchTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeBranchFilter = tab.getAttribute('data-branch');
      renderDailyTherapistCards();
    });
  });

  // Action Buttons
  const btnSave = document.getElementById('btn-save-daily-hours');
  if (btnSave) {
    btnSave.addEventListener('click', saveDailyHours);
  }

  const btnFillStandard = document.getElementById('btn-fill-standard');
  if (btnFillStandard) {
    btnFillStandard.addEventListener('click', fillStandardShift);
  }

  const btnClearHours = document.getElementById('btn-clear-hours');
  if (btnClearHours) {
    btnClearHours.addEventListener('click', clearAllHours);
  }

  // Monthly summary controls
  const monthPicker = document.getElementById('monthly-month-picker');
  if (monthPicker) {
    const curMonth = currentDateStr.substring(0, 7);
    monthPicker.value = curMonth;
    monthPicker.addEventListener('change', loadMonthlySummary);
  }

  const monthlyBranchSelect = document.getElementById('monthly-branch-select');
  if (monthlyBranchSelect) {
    monthlyBranchSelect.addEventListener('change', loadMonthlySummary);
  }

  const btnExportExcel = document.getElementById('btn-export-monthly-excel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', exportMonthlyPayrollExcel);
  }

  const btnPrint = document.getElementById('btn-print-monthly');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // Listen to background sync updates
  window.addEventListener('ayurdesk:data-updated', (e) => {
    if (e.detail?.type === 'THERAPIST_HOURS_SAVED') {
      if (e.detail.payload?.date === currentDateStr) {
        loadDailyHours();
      }
    }
  });

  await loadDailyHours();
});

function shiftDate(deltaDays) {
  const [y, m, d] = currentDateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  dateObj.setUTCDate(dateObj.getUTCDate() + deltaDays);
  currentDateStr = dateObj.toISOString().split('T')[0];

  const dateInput = document.getElementById('input-duty-date');
  if (dateInput) dateInput.value = currentDateStr;

  loadDailyHours();
}

// Load daily records for all 12 therapists for currentDateStr
async function loadDailyHours() {
  currentDailyList = await window.dataStore.getTherapistHoursForDate(currentDateStr);
  isDirty = false;
  updateDirtyIndicator();
  renderDailyTherapistCards();
  updateDailyKpiMetrics();
}

function updateDirtyIndicator() {
  const indicator = document.getElementById('unsaved-status-indicator');
  if (!indicator) return;
  if (isDirty) {
    indicator.innerHTML = '<span style="color: #b45309; font-weight: 700;">● Unsaved Changes</span>';
  } else {
    indicator.innerHTML = '<span style="color: #16a34a; font-weight: 600;">✓ All Changes Saved</span>';
  }
}

// Render therapist cards grouped by the 3 branches: Grand Baie, Curepipe, Moka
function renderDailyTherapistCards() {
  const container = document.getElementById('therapist-branches-container');
  if (!container) return;

  const branchMeta = {
    'Grand Baie': { badgeClass: 'branch-badge-grandbaie', icon: 'compass', desc: 'North Region Clinic' },
    'Curepipe': { badgeClass: 'branch-badge-curepipe', icon: 'mountain', desc: 'Central Plateau Clinic' },
    'Moka': { badgeClass: 'branch-badge-moka', icon: 'map-pin', desc: 'Main Headquarters' },
  };

  const branches = ['Grand Baie', 'Curepipe', 'Moka'];
  let html = '';

  branches.forEach((branchName) => {
    if (activeBranchFilter !== 'all' && activeBranchFilter !== branchName) {
      return;
    }

    const branchTherapists = currentDailyList.filter((t) => t.branch === branchName);
    const meta = branchMeta[branchName];

    // Branch sub-totals in minutes and currency
    let branchTotalMins = 0;
    let branchOvertimeMins = 0;
    let branchOvertimeSalary = 0;

    branchTherapists.forEach((t) => {
      const h = parseInt(t.hours, 10) || 0;
      const m = parseInt(t.minutes, 10) || 0;
      const isOff = !!t.is_off_day;
      const calc = window.dataStore.calculateTherapistOvertime(isOff ? 0 : h, isOff ? 0 : m);
      branchTotalMins += Math.round(calc.total_hours * 60);
      branchOvertimeMins += calc.overtime_minutes;
      branchOvertimeSalary += calc.overtime_salary;
    });

    const bTotH = Math.floor(branchTotalMins / 60);
    const bTotM = branchTotalMins % 60;
    const bOtH = Math.floor(branchOvertimeMins / 60);
    const bOtM = branchOvertimeMins % 60;

    html += `
      <div class="branch-section">
        <div class="branch-section-header">
          <div class="branch-title">
            <span class="${meta.badgeClass}">${branchName}</span>
            <span style="font-size: 0.8125rem; font-weight: 600; color: var(--slate-500);">${meta.desc} • ${branchTherapists.length} Therapists</span>
          </div>
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--forest-900);">
            Total: <span>${bTotH}h ${bTotM}m (${(branchTotalMins / 60).toFixed(2)}h)</span>
            <span style="color: var(--slate-300); margin: 0 4px;">•</span>
            <span style="color: #b45309;">OT: +${bOtH}h ${bOtM}m (${(branchOvertimeMins / 60).toFixed(2)}h)</span>
            <span style="color: var(--slate-300); margin: 0 4px;">•</span>
            <span style="color: var(--forest-800);">MUR ${branchOvertimeSalary.toFixed(2)}</span>
          </div>
        </div>

        <div class="therapist-grid">
          ${branchTherapists
            .map((t) => {
              const h = parseInt(t.hours, 10) || 0;
              const m = parseInt(t.minutes, 10) || 0;
              const isOff = !!t.is_off_day;
              const calc = window.dataStore.calculateTherapistOvertime(isOff ? 0 : h, isOff ? 0 : m);
              const isOt = calc.is_overtime && !isOff;

              const cardClasses = ['therapist-item-card'];
              if (isOt) cardClasses.push('is-overtime');
              if (isOff) cardClasses.push('is-off');

              const initial = t.therapist_name.charAt(0).toUpperCase();

              return `
                <div class="${cardClasses.join(' ')}" id="card-${t.therapist_name}">
                  <div class="therapist-card-top">
                    <div class="therapist-info">
                      <div class="therapist-avatar">${initial}</div>
                      <div>
                        <div class="therapist-name">${t.therapist_name}</div>
                        <div style="font-size: 0.6875rem; color: var(--slate-500);">${t.branch} Branch</div>
                      </div>
                    </div>

                    <!-- Off Day Toggle -->
                    <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; color: var(--slate-600);">
                      <input type="checkbox" class="off-day-toggle" data-name="${t.therapist_name}" ${isOff ? 'checked' : ''} onchange="toggleOffDay('${t.therapist_name}', this.checked)" />
                      <span>Off Day</span>
                    </label>
                  </div>

                  <!-- Working Hours & Custom Minutes Dual Controls -->
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <label style="font-size: 0.75rem; font-weight: 700; color: var(--forest-900);">Working Time:</label>
                        <div class="time-input-dual-group">
                          <div class="time-input-box" title="Hours">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="1"
                              value="${isOff ? 0 : h}"
                              ${isOff ? 'disabled' : ''}
                              class="time-number-input hour-input"
                              data-name="${t.therapist_name}"
                              placeholder="0"
                              oninput="handleHoursInput('${t.therapist_name}', this.value)"
                            />
                            <span class="time-unit-label">h</span>
                          </div>
                          <span class="time-colon">:</span>
                          <div class="time-input-box" title="Minutes (0-59)">
                            <input
                              type="number"
                              min="0"
                              max="59"
                              step="5"
                              value="${isOff ? 0 : m}"
                              ${isOff ? 'disabled' : ''}
                              class="time-number-input minute-input"
                              data-name="${t.therapist_name}"
                              placeholder="0"
                              oninput="handleMinutesInput('${t.therapist_name}', this.value)"
                            />
                            <span class="time-unit-label">m</span>
                          </div>
                        </div>
                      </div>

                      <!-- Formatted Total Time Pill -->
                      <div class="time-total-badge" id="total-badge-${t.therapist_name}">
                        ${isOff ? '0h 0m' : `${calc.formatted_time} (${calc.total_hours.toFixed(2)}h)`}
                      </div>
                    </div>

                    <!-- Quick Adjust Minute Chips & Shortcuts -->
                    <div class="minute-chips-bar">
                      <button type="button" class="minute-chip" onclick="addMinutes('${t.therapist_name}', 15)" ${isOff ? 'disabled' : ''}>+15m</button>
                      <button type="button" class="minute-chip" onclick="addMinutes('${t.therapist_name}', 30)" ${isOff ? 'disabled' : ''}>+30m</button>
                      <button type="button" class="minute-chip" onclick="addMinutes('${t.therapist_name}', 45)" ${isOff ? 'disabled' : ''}>+45m</button>
                      <button type="button" class="minute-chip" onclick="addHours('${t.therapist_name}', 1)" ${isOff ? 'disabled' : ''}>+1h</button>
                      <button type="button" class="minute-chip chip-action" onclick="setExactTime('${t.therapist_name}', 5, 0)" ${isOff ? 'disabled' : ''}>5h Shift</button>
                      <button type="button" class="minute-chip chip-action" onclick="setExactTime('${t.therapist_name}', 0, 0)" ${isOff ? 'disabled' : ''}>Reset</button>
                    </div>
                  </div>

                  <!-- Overtime Calculation Feedback Badge -->
                  <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.4rem; border-top: 1px dashed var(--border-color);">
                    <div id="badge-wrap-${t.therapist_name}">
                      ${
                        isOff
                          ? '<span class="standard-badge" style="background: #f1f5f9; color: #64748b; border-color: #cbd5e1;">Roster Off Day</span>'
                          : isOt
                          ? `<span class="ot-badge">
                              <i data-lucide="zap" style="width: 12px; height: 12px;"></i>
                              Overtime: +${calc.formatted_overtime} (${calc.overtime_hours.toFixed(2)} hrs) • <strong>MUR ${calc.overtime_salary.toFixed(2)}</strong>
                            </span>`
                          : (h > 0 || m > 0)
                          ? `<span class="standard-badge">Standard Shift: ${calc.formatted_time} (${calc.regular_hours.toFixed(2)} hrs) (No OT)</span>`
                          : '<span style="font-size: 0.6875rem; color: var(--slate-400);">No hours logged</span>'
                      }
                    </div>

                    ${
                      t.updated_by_name
                        ? `<div style="font-size: 0.6875rem; color: var(--slate-400);">By ${t.updated_by_name}</div>`
                        : ''
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// Live calculation update when hours or minutes change
window.handleHoursInput = function (therapistName, val) {
  const num = Math.max(0, Math.min(24, parseInt(val, 10) || 0));
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    item.hours = num;
    item.is_off_day = false;
    isDirty = true;
    updateDirtyIndicator();
    updateCardDisplay(item);
    updateDailyKpiMetrics();
  }
};

window.handleMinutesInput = function (therapistName, val) {
  let rawM = Math.max(0, parseInt(val, 10) || 0);
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    let curH = parseInt(item.hours, 10) || 0;
    if (rawM >= 60) {
      curH += Math.floor(rawM / 60);
      rawM = rawM % 60;
      item.hours = Math.min(24, curH);
    }
    item.minutes = Math.min(59, rawM);
    item.is_off_day = false;
    isDirty = true;
    updateDirtyIndicator();
    updateCardDisplay(item);
    updateDailyKpiMetrics();
  }
};

window.addMinutes = function (therapistName, deltaMins) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    const curH = parseInt(item.hours, 10) || 0;
    const curM = parseInt(item.minutes, 10) || 0;
    const totalMins = Math.max(0, curH * 60 + curM + deltaMins);
    item.hours = Math.min(24, Math.floor(totalMins / 60));
    item.minutes = totalMins % 60;
    item.is_off_day = false;
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

window.addHours = function (therapistName, deltaH) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    const curH = parseInt(item.hours, 10) || 0;
    item.hours = Math.max(0, Math.min(24, curH + deltaH));
    item.is_off_day = false;
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

window.setExactTime = function (therapistName, h, m) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    item.hours = Math.max(0, Math.min(24, h));
    item.minutes = Math.max(0, Math.min(59, m));
    item.is_off_day = (h === 0 && m === 0) ? item.is_off_day : false;
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

window.toggleOffDay = function (therapistName, isChecked) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    item.is_off_day = isChecked;
    if (isChecked) {
      item.hours = 0;
      item.minutes = 0;
    }
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

function updateCardDisplay(item) {
  const card = document.getElementById(`card-${item.therapist_name}`);
  if (!card) return;

  const h = parseInt(item.hours, 10) || 0;
  const m = parseInt(item.minutes, 10) || 0;
  const isOff = !!item.is_off_day;
  const calc = window.dataStore.calculateTherapistOvertime(isOff ? 0 : h, isOff ? 0 : m);
  const isOt = calc.is_overtime && !isOff;

  card.classList.toggle('is-overtime', isOt);
  card.classList.toggle('is-off', isOff);

  const hInput = card.querySelector('.hour-input');
  if (hInput && document.activeElement !== hInput) hInput.value = isOff ? 0 : h;

  const mInput = card.querySelector('.minute-input');
  if (mInput && document.activeElement !== mInput) mInput.value = isOff ? 0 : m;

  const badgeWrap = document.getElementById(`badge-wrap-${item.therapist_name}`);
  if (badgeWrap) {
    badgeWrap.innerHTML = isOff
      ? '<span class="standard-badge" style="background: #f1f5f9; color: #64748b; border-color: #cbd5e1;">Roster Off Day</span>'
      : isOt
      ? `<span class="ot-badge">
          <i data-lucide="zap" style="width: 12px; height: 12px;"></i>
          Overtime: +${calc.formatted_overtime} (${calc.overtime_hours.toFixed(2)} hrs) • <strong>MUR ${calc.overtime_salary.toFixed(2)}</strong>
        </span>`
      : (h > 0 || m > 0)
      ? `<span class="standard-badge">Standard Shift: ${calc.formatted_time} (${calc.regular_hours.toFixed(2)} hrs) (No OT)</span>`
      : '<span style="font-size: 0.6875rem; color: var(--slate-400);">No hours logged</span>';
    if (window.lucide) window.lucide.createIcons();
  }

  const totBadge = document.getElementById(`total-badge-${item.therapist_name}`);
  if (totBadge) {
    totBadge.textContent = isOff ? '0h 0m' : `${calc.formatted_time} (${calc.total_hours.toFixed(2)}h)`;
  }
}

// Compute daily KPI metrics across active therapists
function updateDailyKpiMetrics() {
  let totalMinutes = 0;
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let overtimeSalary = 0;
  let activeCount = 0;
  let otCount = 0;

  const branchSubtotals = {
    'Grand Baie': { minutes: 0, overtimeMinutes: 0, salary: 0 },
    'Curepipe': { minutes: 0, overtimeMinutes: 0, salary: 0 },
    'Moka': { minutes: 0, overtimeMinutes: 0, salary: 0 },
  };

  currentDailyList.forEach((t) => {
    const h = parseInt(t.hours, 10) || 0;
    const m = parseInt(t.minutes, 10) || 0;
    const isOff = !!t.is_off_day;
    const itemMins = h * 60 + m;

    if (!isOff && itemMins > 0) {
      activeCount += 1;
      const calc = window.dataStore.calculateTherapistOvertime(h, m);
      totalMinutes += itemMins;
      regularMinutes += Math.round(calc.regular_hours * 60);
      overtimeMinutes += calc.overtime_minutes;
      overtimeSalary += calc.overtime_salary;
      if (calc.is_overtime) otCount += 1;

      if (branchSubtotals[t.branch]) {
        branchSubtotals[t.branch].minutes += itemMins;
        branchSubtotals[t.branch].overtimeMinutes += calc.overtime_minutes;
        branchSubtotals[t.branch].salary += calc.overtime_salary;
      }
    }
  });

  const totH = Math.floor(totalMinutes / 60);
  const totM = totalMinutes % 60;
  const regH = Math.floor(regularMinutes / 60);
  const regM = regularMinutes % 60;
  const otH = Math.floor(overtimeMinutes / 60);
  const otM = overtimeMinutes % 60;

  document.getElementById('kpi-daily-total-hours').textContent = `${totH}h ${totM}m (${(totalMinutes / 60).toFixed(2)}h)`;
  document.getElementById('kpi-daily-active-count').textContent = `${activeCount} on duty`;

  document.getElementById('kpi-daily-regular-hours').textContent = `${regH}h ${regM}m (${(regularMinutes / 60).toFixed(2)}h)`;
  document.getElementById('kpi-daily-overtime-hours').textContent = `${otH}h ${otM}m (${(overtimeMinutes / 60).toFixed(2)}h)`;
  document.getElementById('kpi-daily-overtime-count').textContent = `${otCount} in overtime (>5h)`;

  document.getElementById('kpi-daily-overtime-salary').textContent = `MUR ${overtimeSalary.toFixed(2)}`;

  ['Grand Baie', 'Curepipe', 'Moka'].forEach((bName) => {
    const sub = branchSubtotals[bName];
    const slug = bName.toLowerCase().replace(/\s+/g, '');
    const el = document.getElementById(`badge-summary-${slug}`);
    if (el) {
      const sh = Math.floor(sub.minutes / 60);
      const sm = sub.minutes % 60;
      el.textContent = `${sh}h ${sm}m • MUR ${sub.salary.toFixed(2)}`;
    }
  });
}

// Quick action: Fill standard 5h
function fillStandardShift() {
  currentDailyList.forEach((t) => {
    if (!t.is_off_day) {
      t.hours = 5;
      t.minutes = 0;
    }
  });
  isDirty = true;
  updateDirtyIndicator();
  renderDailyTherapistCards();
  updateDailyKpiMetrics();
}

function clearAllHours() {
  if (confirm('Zero working hours and minutes for all therapists on this date?')) {
    currentDailyList.forEach((t) => {
      t.hours = 0;
      t.minutes = 0;
    });
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
}
  renderDailyTherapistCards();
  updateDailyKpiMetrics();
}

function clearAllHours() {
  if (confirm('Zero working hours for all therapists on this date?')) {
    currentDailyList.forEach((t) => {
      t.hours = 0;
    });
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
}

// Save all 12 therapists' daily working hours
async function saveDailyHours() {
  const btn = document.getElementById('btn-save-daily-hours');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Saving Hours...';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const user = window.authManager.getCurrentUser();
    await window.dataStore.saveTherapistHoursForDate(currentDateStr, currentDailyList);

    isDirty = false;
    updateDirtyIndicator();

    window.showToast(
      'Working Hours Saved',
      `Therapist shifts for ${window.formatDateDisplay(currentDateStr)} saved by ${user?.full_name || 'Staff'}.`,
      'success'
    );

    await loadDailyHours();
  } catch (err) {
    window.showToast('Save Failed', err.message || 'Error occurred while saving hours.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="save"></i><span>Save Daily Working Hours</span>';
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

// =========================================================
// MONTHLY PAYROLL & OVERTIME SUMMARY REPORT
// =========================================================
async function loadMonthlySummary() {
  const monthPicker = document.getElementById('monthly-month-picker');
  const branchSelect = document.getElementById('monthly-branch-select');

  const monthKey = monthPicker ? monthPicker.value : currentDateStr.substring(0, 7);
  const branchFilter = branchSelect ? branchSelect.value : 'all';

  const allRecords = await window.dataStore.getTherapistHours({ month: monthKey });
  const summary = window.dataStore.calculateTherapistMonthlyReport(allRecords, monthKey, branchFilter);

  // Update monthly KPI summary cards
  document.getElementById('kpi-monthly-total-hours').textContent = `${summary.grandTotals.formatted_time} (${summary.grandTotals.total_hours.toFixed(1)}h)`;
  document.getElementById('kpi-monthly-days-worked').textContent = `${summary.grandTotals.days_worked} shift days`;

  document.getElementById('kpi-monthly-regular-hours').textContent = `${summary.grandTotals.regular_hours.toFixed(1)} hrs`;
  document.getElementById('kpi-monthly-overtime-hours').textContent = `+${summary.grandTotals.formatted_overtime} (${summary.grandTotals.overtime_hours.toFixed(1)}h)`;

  document.getElementById('kpi-monthly-overtime-salary').textContent = `MUR ${summary.grandTotals.overtime_salary.toFixed(2)}`;

  // Render monthly table
  const tbody = document.getElementById('monthly-summary-tbody');
  if (!tbody) return;

  const branchMeta = {
    'Grand Baie': 'branch-badge-grandbaie',
    'Curepipe': 'branch-badge-curepipe',
    'Moka': 'branch-badge-moka',
  };

  let rowsHtml = '';
  const branches = branchFilter === 'all' ? ['Grand Baie', 'Curepipe', 'Moka'] : [branchFilter];

  branches.forEach((bName) => {
    const list = summary.therapists.filter((t) => t.branch === bName);
    if (list.length === 0) return;

    list.forEach((t) => {
      const isOt = t.overtime_hours > 0;
      rowsHtml += `
        <tr>
          <td style="font-weight: 700; color: var(--forest-900);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="therapist-avatar" style="width: 26px; height: 26px; font-size: 0.75rem;">${t.therapist_name.charAt(0)}</span>
              <span>${t.therapist_name}</span>
            </div>
          </td>
          <td><span class="${branchMeta[t.branch] || 'badge'}">${t.branch}</span></td>
          <td class="numeric">${t.days_worked}</td>
          <td class="numeric">${t.off_days}</td>
          <td class="numeric" style="font-weight: 700;">
            ${t.formatted_time} <span style="font-size: 0.6875rem; color: var(--slate-400);">(${t.total_hours.toFixed(2)}h)</span>
          </td>
          <td class="numeric">${t.regular_hours.toFixed(2)}</td>
          <td class="numeric" style="font-weight: 700; color: ${isOt ? '#b45309' : 'inherit'};">
            ${isOt ? `+${t.formatted_overtime} <span style="font-size: 0.6875rem;">(${t.overtime_hours.toFixed(2)}h)</span>` : '0h 0m'}
          </td>
          <td class="numeric" style="color: var(--slate-500);">MUR 75</td>
          <td class="numeric" style="font-weight: 800; color: ${isOt ? 'var(--forest-900)' : 'var(--slate-400)'};">
            MUR ${t.overtime_salary.toFixed(2)}
          </td>
        </tr>
      `;
    });

    // Branch Subtotal Row
    const bTotal = summary.branchTotals[bName];
    if (bTotal && list.length > 1) {
      rowsHtml += `
        <tr class="branch-subtotal-row">
          <td colspan="2">Subtotal: ${bName} Branch</td>
          <td class="numeric">-</td>
          <td class="numeric">-</td>
          <td class="numeric">${bTotal.formatted_time} <span style="font-size: 0.6875rem;">(${bTotal.hours.toFixed(2)}h)</span></td>
          <td class="numeric">${bTotal.regular.toFixed(2)}</td>
          <td class="numeric">+${bTotal.formatted_overtime} <span style="font-size: 0.6875rem;">(${bTotal.overtime.toFixed(2)}h)</span></td>
          <td class="numeric">-</td>
          <td class="numeric" style="font-weight: 800;">MUR ${bTotal.salary.toFixed(2)}</td>
        </tr>
      `;
    }
  });

  // Grand Combined Total Row
  rowsHtml += `
    <tr class="grand-total-row">
      <td colspan="2" style="font-size: 0.9375rem;">GRAND COMBINED TOTAL (All Active Branches)</td>
      <td class="numeric">${summary.grandTotals.days_worked}</td>
      <td class="numeric">-</td>
      <td class="numeric">${summary.grandTotals.formatted_time} (${summary.grandTotals.total_hours.toFixed(2)}h)</td>
      <td class="numeric">${summary.grandTotals.regular_hours.toFixed(2)}</td>
      <td class="numeric" style="color: #b45309;">+${summary.grandTotals.formatted_overtime} (${summary.grandTotals.overtime_hours.toFixed(2)}h)</td>
      <td class="numeric">MUR 75</td>
      <td class="numeric" style="font-size: 1rem; color: var(--forest-900);">MUR ${summary.grandTotals.overtime_salary.toFixed(2)}</td>
    </tr>
  `;

  tbody.innerHTML = rowsHtml;
}

// Export Monthly Payroll to Excel (.xlsx) using ExcelJS
async function exportMonthlyPayrollExcel() {
  if (typeof ExcelJS === 'undefined') {
    alert('ExcelJS export library is still loading. Please try again in a moment.');
    return;
  }

  const monthPicker = document.getElementById('monthly-month-picker');
  const monthKey = monthPicker ? monthPicker.value : currentDateStr.substring(0, 7);
  const branchSelect = document.getElementById('monthly-branch-select');
  const branchFilter = branchSelect ? branchSelect.value : 'all';

  const allRecords = await window.dataStore.getTherapistHours({ month: monthKey });
  const summary = window.dataStore.calculateTherapistMonthlyReport(allRecords, monthKey, branchFilter);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AyurDesk';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Overtime ${monthKey}`, {
    views: [{ showGridLines: true }],
  });

  // Title Block
  sheet.mergeCells('A1:K1');
  sheet.getCell('A1').value = 'AYURYOGA INTERNATIONAL - THERAPIST WORKING HOURS & OVERTIME PAYROLL';
  sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  sheet.mergeCells('A2:K2');
  sheet.getCell('A2').value = `Month: ${monthKey} | Branch Scope: ${branchFilter.toUpperCase()} | Overtime Rule: >5.0 hrs (300 mins) @ 75 MUR/hr`;
  sheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF334155' } };
  sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 20;

  sheet.addRow([]);

  // Header Row
  const headerRow = sheet.addRow([
    'Therapist Name',
    'Branch',
    'Days Worked',
    'Off Days',
    'Working Time (h & m)',
    'Total Hours (Decimal)',
    'Regular Hours (≤ 5h)',
    'Overtime (h & m)',
    'Overtime Hours (Decimal)',
    'Overtime Rate (MUR)',
    'Overtime Remuneration (MUR)',
  ]);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF23675B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Data Rows
  summary.therapists.forEach((t) => {
    const row = sheet.addRow([
      t.therapist_name,
      t.branch,
      t.days_worked,
      t.off_days,
      t.formatted_time,
      t.total_hours,
      t.regular_hours,
      t.overtime_hours > 0 ? t.formatted_overtime : '0h 0m',
      t.overtime_hours,
      75,
      t.overtime_salary,
    ]);
    row.height = 20;

    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };

    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(7).numFmt = '#,##0.00';
    row.getCell(9).numFmt = '#,##0.00';
    row.getCell(10).numFmt = '"MUR " #,##0.00';
    row.getCell(11).numFmt = '"MUR " #,##0.00';

    if (t.overtime_hours > 0) {
      row.getCell(8).font = { bold: true, color: { argb: 'FFB45309' } };
      row.getCell(9).font = { bold: true, color: { argb: 'FFB45309' } };
      row.getCell(11).font = { bold: true, color: { argb: 'FF103B37' } };
    }
  });

  // Grand Total Row
  sheet.addRow([]);
  const grandRow = sheet.addRow([
    'GRAND COMBINED TOTAL',
    'ALL BRANCHES',
    summary.grandTotals.days_worked,
    '-',
    summary.grandTotals.formatted_time,
    summary.grandTotals.total_hours,
    summary.grandTotals.regular_hours,
    summary.grandTotals.overtime_hours > 0 ? summary.grandTotals.formatted_overtime : '0h 0m',
    summary.grandTotals.overtime_hours,
    75,
    summary.grandTotals.overtime_salary,
  ]);
  grandRow.height = 26;
  grandRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF103B37' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4EA' } };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF103B37' } },
      bottom: { style: 'double', color: { argb: 'FF103B37' } },
    };
  });
  grandRow.getCell(6).numFmt = '#,##0.00';
  grandRow.getCell(7).numFmt = '#,##0.00';
  grandRow.getCell(9).numFmt = '#,##0.00';
  grandRow.getCell(10).numFmt = '"MUR " #,##0.00';
  grandRow.getCell(11).numFmt = '"MUR " #,##0.00';

  // Column Widths
  sheet.columns = [
    { width: 20 },
    { width: 15 },
    { width: 14 },
    { width: 12 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 22 },
    { width: 20 },
    { width: 26 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Ayuryoga_Therapist_Overtime_Payroll_${monthKey}.xlsx`;
  link.click();

  window.showToast('Excel Downloaded', `Generated payroll report for ${monthKey}.`, 'success');
}

