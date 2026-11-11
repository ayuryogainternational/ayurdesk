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

    // Branch sub-totals
    let branchTotalHours = 0;
    let branchOvertimeHours = 0;
    let branchOvertimeSalary = 0;

    branchTherapists.forEach((t) => {
      const h = Number(t.hours) || 0;
      const calc = window.dataStore.calculateTherapistOvertime(t.is_off_day ? 0 : h);
      branchTotalHours += calc.hours;
      branchOvertimeHours += calc.overtime_hours;
      branchOvertimeSalary += calc.overtime_salary;
    });

    html += `
      <div class="branch-section">
        <div class="branch-section-header">
          <div class="branch-title">
            <span class="${meta.badgeClass}">${branchName}</span>
            <span style="font-size: 0.8125rem; font-weight: 600; color: var(--slate-500);">${meta.desc} • ${branchTherapists.length} Therapists</span>
          </div>
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--forest-900);">
            Total: <span>${branchTotalHours.toFixed(1)} hrs</span>
            <span style="color: var(--slate-300); margin: 0 4px;">•</span>
            <span style="color: #b45309;">OT: ${branchOvertimeHours.toFixed(1)} hrs</span>
            <span style="color: var(--slate-300); margin: 0 4px;">•</span>
            <span style="color: var(--forest-800);">MUR ${branchOvertimeSalary.toFixed(2)}</span>
          </div>
        </div>

        <div class="therapist-grid">
          ${branchTherapists
            .map((t) => {
              const h = Number(t.hours) || 0;
              const isOff = !!t.is_off_day;
              const calc = window.dataStore.calculateTherapistOvertime(isOff ? 0 : h);
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

                  <!-- Hours Input & Quick Adjustment Controls -->
                  <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <label style="font-size: 0.75rem; font-weight: 700; color: var(--forest-900);">Working Hours:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value="${isOff ? 0 : h}"
                        ${isOff ? 'disabled' : ''}
                        class="form-input hour-input"
                        data-name="${t.therapist_name}"
                        style="width: 80px; padding: 0.35rem 0.5rem; font-weight: 700; text-align: center; font-size: 0.9375rem;"
                        oninput="handleHoursInput('${t.therapist_name}', this.value)"
                      />
                    </div>

                    <!-- Quick Shift Buttons -->
                    <div style="display: flex; gap: 0.25rem;">
                      <button type="button" class="quick-hour-btn" onclick="adjustHours('${t.therapist_name}', 1)">+1h</button>
                      <button type="button" class="quick-hour-btn" onclick="adjustHours('${t.therapist_name}', 0.5)">+0.5h</button>
                      <button type="button" class="quick-hour-btn" onclick="setExactHours('${t.therapist_name}', 5)">5h</button>
                      <button type="button" class="quick-hour-btn" onclick="setExactHours('${t.therapist_name}', 0)">0</button>
                    </div>
                  </div>

                  <!-- Overtime Calculation Feedback Badge -->
                  <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.4rem; border-top: 1px dashed var(--border-color);">
                    <div>
                      ${
                        isOff
                          ? '<span class="standard-badge" style="background: #f1f5f9; color: #64748b; border-color: #cbd5e1;">Roster Off Day</span>'
                          : isOt
                          ? `<span class="ot-badge">
                              <i data-lucide="zap" style="width: 12px; height: 12px;"></i>
                              Overtime: +${calc.overtime_hours.toFixed(1)} hrs • <strong>MUR ${calc.overtime_salary.toFixed(2)}</strong>
                            </span>`
                          : h > 0
                          ? `<span class="standard-badge">Standard Shift: ${calc.regular_hours.toFixed(1)} hrs (No OT)</span>`
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

// Live calculation update when input changes
window.handleHoursInput = function (therapistName, val) {
  const num = Math.max(0, Math.min(24, parseFloat(val) || 0));
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

window.adjustHours = function (therapistName, delta) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    const cur = Number(item.hours) || 0;
    item.hours = Math.max(0, Math.min(24, +(cur + delta).toFixed(2)));
    item.is_off_day = false;
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

window.setExactHours = function (therapistName, exact) {
  const item = currentDailyList.find((t) => t.therapist_name === therapistName);
  if (item) {
    item.hours = exact;
    item.is_off_day = exact === 0 ? item.is_off_day : false;
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
    if (isChecked) item.hours = 0;
    isDirty = true;
    updateDirtyIndicator();
    renderDailyTherapistCards();
    updateDailyKpiMetrics();
  }
};

function updateCardDisplay(item) {
  const card = document.getElementById(`card-${item.therapist_name}`);
  if (!card) return;

  const h = Number(item.hours) || 0;
  const isOff = !!item.is_off_day;
  const calc = window.dataStore.calculateTherapistOvertime(isOff ? 0 : h);
  const isOt = calc.is_overtime && !isOff;

  card.classList.toggle('is-overtime', isOt);
  card.classList.toggle('is-off', isOff);

  const input = card.querySelector('.hour-input');
  if (input) input.value = isOff ? 0 : h;
}

// Compute daily KPI metrics across active therapists
function updateDailyKpiMetrics() {
  let totalHours = 0;
  let regularHours = 0;
  let overtimeHours = 0;
  let overtimeSalary = 0;
  let activeCount = 0;
  let otCount = 0;

  const branchSubtotals = {
    'Grand Baie': { hours: 0, salary: 0 },
    'Curepipe': { hours: 0, salary: 0 },
    'Moka': { hours: 0, salary: 0 },
  };

  currentDailyList.forEach((t) => {
    const h = Number(t.hours) || 0;
    const isOff = !!t.is_off_day;
    if (!isOff && h > 0) {
      activeCount += 1;
      const calc = window.dataStore.calculateTherapistOvertime(h);
      totalHours += calc.hours;
      regularHours += calc.regular_hours;
      overtimeHours += calc.overtime_hours;
      overtimeSalary += calc.overtime_salary;
      if (calc.is_overtime) otCount += 1;

      if (branchSubtotals[t.branch]) {
        branchSubtotals[t.branch].hours += calc.hours;
        branchSubtotals[t.branch].salary += calc.overtime_salary;
      }
    }
  });

  document.getElementById('kpi-daily-total-hours').textContent = totalHours.toFixed(1);
  document.getElementById('kpi-daily-active-count').textContent = `${activeCount} on duty`;

  document.getElementById('kpi-daily-regular-hours').textContent = regularHours.toFixed(1);
  document.getElementById('kpi-daily-overtime-hours').textContent = overtimeHours.toFixed(1);
  document.getElementById('kpi-daily-overtime-count').textContent = `${otCount} in overtime (>5h)`;

  document.getElementById('kpi-daily-overtime-salary').textContent = `MUR ${overtimeSalary.toFixed(2)}`;

  document.getElementById('badge-summary-grandbaie').textContent = `${branchSubtotals['Grand Baie'].hours.toFixed(1)}h • MUR ${branchSubtotals['Grand Baie'].salary.toFixed(2)}`;
  document.getElementById('badge-summary-curepipe').textContent = `${branchSubtotals['Curepipe'].hours.toFixed(1)}h • MUR ${branchSubtotals['Curepipe'].salary.toFixed(2)}`;
  document.getElementById('badge-summary-moka').textContent = `${branchSubtotals['Moka'].hours.toFixed(1)}h • MUR ${branchSubtotals['Moka'].salary.toFixed(2)}`;
}

// Quick action: Fill standard 5h
function fillStandardShift() {
  currentDailyList.forEach((t) => {
    if (!t.is_off_day) {
      t.hours = 5.0;
    }
  });
  isDirty = true;
  updateDirtyIndicator();
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
  document.getElementById('kpi-monthly-total-hours').textContent = summary.grandTotals.total_hours.toFixed(1);
  document.getElementById('kpi-monthly-days-worked').textContent = `${summary.grandTotals.days_worked} shift days`;

  document.getElementById('kpi-monthly-regular-hours').textContent = summary.grandTotals.regular_hours.toFixed(1);
  document.getElementById('kpi-monthly-overtime-hours').textContent = summary.grandTotals.overtime_hours.toFixed(1);

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
          <td class="numeric" style="font-weight: 700;">${t.total_hours.toFixed(1)}</td>
          <td class="numeric">${t.regular_hours.toFixed(1)}</td>
          <td class="numeric" style="font-weight: 700; color: ${isOt ? '#b45309' : 'inherit'};">
            ${isOt ? `+${t.overtime_hours.toFixed(1)}` : '0.0'}
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
          <td class="numeric">${bTotal.hours.toFixed(1)}</td>
          <td class="numeric">${bTotal.regular.toFixed(1)}</td>
          <td class="numeric">+${bTotal.overtime.toFixed(1)}</td>
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
      <td class="numeric">${summary.grandTotals.total_hours.toFixed(1)}</td>
      <td class="numeric">${summary.grandTotals.regular_hours.toFixed(1)}</td>
      <td class="numeric" style="color: #b45309;">+${summary.grandTotals.overtime_hours.toFixed(1)}</td>
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
  sheet.mergeCells('A1:I1');
  sheet.getCell('A1').value = 'AYURYOGA INTERNATIONAL - THERAPIST WORKING HOURS & OVERTIME PAYROLL';
  sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  sheet.mergeCells('A2:I2');
  sheet.getCell('A2').value = `Month: ${monthKey} | Branch Scope: ${branchFilter.toUpperCase()} | Overtime Rule: >5.0 hrs @ 75 MUR/hr`;
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
    'Total Working Hours',
    'Regular Hours (≤ 5h)',
    'Overtime Hours (> 5h)',
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
      t.total_hours,
      t.regular_hours,
      t.overtime_hours,
      75,
      t.overtime_salary,
    ]);
    row.height = 20;

    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

    row.getCell(5).numFmt = '#,##0.0';
    row.getCell(6).numFmt = '#,##0.0';
    row.getCell(7).numFmt = '#,##0.0';
    row.getCell(8).numFmt = '"MUR " #,##0.00';
    row.getCell(9).numFmt = '"MUR " #,##0.00';

    if (t.overtime_hours > 0) {
      row.getCell(7).font = { bold: true, color: { argb: 'FFB45309' } };
      row.getCell(9).font = { bold: true, color: { argb: 'FF103B37' } };
    }
  });

  // Grand Total Row
  sheet.addRow([]);
  const grandRow = sheet.addRow([
    'GRAND COMBINED TOTAL',
    'ALL BRANCHES',
    summary.grandTotals.days_worked,
    '-',
    summary.grandTotals.total_hours,
    summary.grandTotals.regular_hours,
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
  grandRow.getCell(5).numFmt = '#,##0.0';
  grandRow.getCell(6).numFmt = '#,##0.0';
  grandRow.getCell(7).numFmt = '#,##0.0';
  grandRow.getCell(8).numFmt = '"MUR " #,##0.00';
  grandRow.getCell(9).numFmt = '"MUR " #,##0.00';

  // Column Widths
  sheet.columns = [
    { width: 22 },
    { width: 16 },
    { width: 14 },
    { width: 12 },
    { width: 20 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 28 },
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
