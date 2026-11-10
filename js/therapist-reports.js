// ====================================================================
// AyurDesk - Admin Therapist Monthly Reports & Daily Monitoring Script
// Overtime Calculation: 75 MUR / hour for hours > 5h/day
// Organization: Ayuryoga International
// ====================================================================

let currentMode = 'monthly'; // 'monthly' | 'daily'
let allTherapistRecords = [];
let allTherapists = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth({ adminOnly: true })) return;

  window.initAppLayout('therapist-reports');

  const today = window.getTodayMauritiusDate ? window.getTodayMauritiusDate() : new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  document.getElementById('report-month').value = currentMonth;
  document.getElementById('report-date').value = today;

  // Setup View Mode Switcher
  const btnMonthly = document.getElementById('tab-mode-monthly');
  const btnDaily = document.getElementById('tab-mode-daily');
  const viewMonthly = document.getElementById('view-monthly-report');
  const viewDaily = document.getElementById('view-daily-analysis');
  const groupMonth = document.getElementById('group-month-selector');
  const groupDate = document.getElementById('group-date-selector');

  btnMonthly.addEventListener('click', () => {
    currentMode = 'monthly';
    btnMonthly.className = 'btn btn-primary';
    btnDaily.className = 'btn btn-outline';
    btnDaily.style.background = 'transparent';
    btnDaily.style.border = 'none';
    viewMonthly.style.display = 'block';
    viewDaily.style.display = 'none';
    groupMonth.style.display = 'block';
    groupDate.style.display = 'none';
    renderCurrentView();
  });

  btnDaily.addEventListener('click', () => {
    currentMode = 'daily';
    btnDaily.className = 'btn btn-primary';
    btnMonthly.className = 'btn btn-outline';
    btnMonthly.style.background = 'transparent';
    btnMonthly.style.border = 'none';
    viewMonthly.style.display = 'none';
    viewDaily.style.display = 'block';
    groupMonth.style.display = 'none';
    groupDate.style.display = 'block';
    renderCurrentView();
  });

  // Filter Listeners
  document.getElementById('report-month').addEventListener('change', renderCurrentView);
  document.getElementById('report-date').addEventListener('change', renderCurrentView);
  document.getElementById('filter-therapist').addEventListener('change', renderCurrentView);

  // Sync Button
  document.getElementById('btn-sync-therapist-data').addEventListener('click', async () => {
    const btn = document.getElementById('btn-sync-therapist-data');
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i> Syncing...';
    if (window.lucide) window.lucide.createIcons();
    await loadData();
    renderCurrentView();
    window.showToast('Data Synced', 'Refreshed therapist attendance and clinical reports.', 'success');
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="refresh-cw"></i> Refresh Data';
    if (window.lucide) window.lucide.createIcons();
  });

  // Export Buttons
  document.getElementById('btn-export-excel').addEventListener('click', handleExportExcel);
  document.getElementById('btn-export-pdf').addEventListener('click', handleExportPdf);

  // Live broadcast listener
  window.addEventListener('ayurdesk:data-updated', async () => {
    await loadData();
    renderCurrentView();
  });

  await loadData();
  renderCurrentView();
});

async function loadData() {
  allTherapists = await window.dataStore.getTherapists();
  allTherapistRecords = await window.dataStore.getTherapistRecords();

  // Populate filter dropdown with all registered therapists
  const select = document.getElementById('filter-therapist');
  if (select && allTherapists && allTherapists.length > 0) {
    const currentVal = select.value;
    select.innerHTML = `<option value="all">All Registered Therapists</option>` +
      allTherapists.map((t) => `<option value="${t.id}">${t.full_name} (${t.specialty || 'Therapist'})</option>`).join('');
    if (currentVal) select.value = currentVal;
  }
}

function renderCurrentView() {
  if (currentMode === 'monthly') {
    renderMonthlyReport();
  } else {
    renderDailyAnalysis();
  }
}

// ====================================================================
// VIEW 1: MONTHLY CONSOLIDATED REPORT
// ====================================================================
function renderMonthlyReport() {
  const monthKey = document.getElementById('report-month').value || '2026-11';
  const therapistFilter = document.getElementById('filter-therapist').value;

  const reportData = window.dataStore.calculateTherapistMonthlyReport(allTherapistRecords, monthKey);
  let therapists = reportData.therapists;

  if (therapistFilter && therapistFilter !== 'all') {
    therapists = therapists.filter((t) => t.therapist_id === therapistFilter);
  }

  // Update Summary Texts
  document.getElementById('export-summary-text').textContent = `Monthly Therapist Report: ${monthKey}`;
  document.getElementById('export-metrics-text').textContent =
    `Active Therapists: ${therapists.length} | Combined Working Hours: ${reportData.combined.total_working_hours} hrs | Combined Overtime: ${reportData.combined.total_overtime_hours} hrs (${reportData.combined.total_overtime_salary} MUR)`;

  // Update Executive KPI Cards
  document.getElementById('kpi-therapists-count').textContent = therapists.length;
  document.getElementById('kpi-days-worked').textContent = `${reportData.combined.days_worked} days`;
  document.getElementById('kpi-off-days').textContent = `${reportData.combined.off_days} off days`;
  document.getElementById('kpi-total-works').textContent = `${reportData.combined.total_works} works`;
  document.getElementById('kpi-total-hours').textContent = `${reportData.combined.total_working_hours.toFixed(2)} hrs`;
  document.getElementById('kpi-regular-hours').textContent = `${reportData.combined.total_regular_hours.toFixed(2)} hrs regular`;
  document.getElementById('kpi-overtime-hours').textContent = `${reportData.combined.total_overtime_hours.toFixed(2)} hrs`;
  document.getElementById('kpi-overtime-salary').textContent = `${reportData.combined.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`;

  // Render Table Body
  const tbody = document.getElementById('table-monthly-body');
  const tfoot = document.getElementById('table-monthly-foot');

  if (therapists.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--slate-400);">No therapist attendance or treatments recorded for ${monthKey}.</td></tr>`;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  tbody.innerHTML = therapists
    .map((t) => {
      const otBadge =
        t.total_overtime_hours > 0
          ? `<span class="badge badge-overtime">+${t.total_overtime_hours.toFixed(2)} hrs</span>`
          : '<span class="badge badge-standard">0.00 hrs</span>';

      return `
        <tr>
          <td style="font-weight: 700; color: var(--forest-900);">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <i data-lucide="user" style="width: 14px; height: 14px; color: var(--forest-600);"></i>
              <span>${t.therapist_name}</span>
            </div>
          </td>
          <td style="font-size: 0.75rem; color: var(--slate-600);">${t.therapist_email}</td>
          <td class="numeric" style="font-weight: 600;">${t.days_worked}</td>
          <td class="numeric" style="color: var(--slate-500);">${t.off_days}</td>
          <td class="numeric" style="font-weight: 700; color: var(--forest-700);">${t.total_works}</td>
          <td class="numeric" style="font-weight: 700; color: var(--forest-900);">${t.total_working_hours.toFixed(2)}</td>
          <td class="numeric" style="color: var(--slate-700);">${t.total_regular_hours.toFixed(2)}</td>
          <td class="numeric">${otBadge}</td>
          <td class="numeric" style="color: var(--slate-500); font-size: 0.75rem;">75 MUR</td>
          <td class="numeric" style="font-weight: 800; color: var(--forest-900); font-size: 0.9375rem;">
            ${t.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    })
    .join('');

  // Render Table Footer (COMBINED GRAND TOTAL)
  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background-color: var(--warm-100); border-top: 2px solid var(--forest-900); border-bottom: 2px solid var(--forest-900);">
        <td colspan="2" style="font-weight: 800; color: var(--forest-900); padding: 0.75rem 0.875rem;">
          COMBINED THERAPISTS GRAND TOTAL
        </td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${reportData.combined.days_worked}</td>
        <td class="numeric" style="font-weight: 800; color: var(--slate-700);">${reportData.combined.off_days}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${reportData.combined.total_works}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${reportData.combined.total_working_hours.toFixed(2)}</td>
        <td class="numeric" style="font-weight: 800; color: var(--slate-800);">${reportData.combined.total_regular_hours.toFixed(2)}</td>
        <td class="numeric" style="font-weight: 800; color: #b45309;">${reportData.combined.total_overtime_hours.toFixed(2)} hrs</td>
        <td class="numeric" style="font-weight: 800; color: var(--slate-700);">75 MUR</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900); font-size: 1.05rem;">
          ${reportData.combined.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR
        </td>
      </tr>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

// ====================================================================
// VIEW 2: DAILY ANALYSIS & REAL-TIME MONITORING
// ====================================================================
function renderDailyAnalysis() {
  const dateKey = document.getElementById('report-date').value || window.getTodayMauritiusDate();
  const therapistFilter = document.getElementById('filter-therapist').value;

  document.getElementById('badge-daily-date').textContent = dateKey;

  const analysis = window.dataStore.calculateTherapistDailyAnalysis(allTherapistRecords, dateKey);
  let records = analysis.therapist_records;

  if (therapistFilter && therapistFilter !== 'all') {
    records = records.filter((r) => r.therapist_id === therapistFilter);
  }

  // Update Daily Summary KPI Cards
  document.getElementById('d-stat-active').textContent = analysis.summary.active_therapists;
  document.getElementById('d-stat-off').textContent = analysis.summary.off_day_therapists;
  document.getElementById('d-stat-works').textContent = `${analysis.summary.total_works} works`;
  document.getElementById('d-stat-hours').textContent = `${analysis.summary.total_working_hours.toFixed(2)} hrs`;
  document.getElementById('d-stat-overtime').textContent = `${analysis.summary.total_overtime_hours.toFixed(2)} hrs`;
  document.getElementById('d-stat-salary').textContent = `${analysis.summary.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`;

  // Render Daily Cards
  const container = document.getElementById('daily-therapist-cards-container');

  if (records.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem; color: var(--slate-400);">
        No therapist duty or attendance records found for ${dateKey}.
      </div>
    `;
    return;
  }

  container.innerHTML = records
    .map((r) => {
      let statusBadge = '';
      if (r.is_off_day) {
        statusBadge = `<span class="badge badge-offday">Off Day (${r.off_day_reason || 'Leave'})</span>`;
      } else if (r.is_overtime) {
        statusBadge = `<span class="badge badge-overtime">⚡ Overtime (+${r.overtime_hours.toFixed(2)}h @ 75 MUR/hr)</span>`;
      } else if (r.total_working_hours > 0) {
        statusBadge = `<span class="badge badge-standard">Standard Shift (${r.total_working_hours.toFixed(2)}h ≤ 5h)</span>`;
      } else {
        statusBadge = `<span class="badge badge-staff">No Check-In</span>`;
      }

      // Treatments list html
      const works = r.works || [];
      let worksHtml = '';
      if (works.length === 0) {
        worksHtml = `<div style="font-size: 0.75rem; color: var(--slate-400); padding: 0.5rem 0;">No individual treatments logged for this shift.</div>`;
      } else {
        worksHtml = `
          <div style="margin-top: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--forest-900); margin-bottom: 0.4rem;">
              Completed Treatment Works (${works.length} works • ${r.total_treatment_hours || 0} hrs):
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              ${works
                .map(
                  (w, i) => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.4rem 0.65rem; font-size: 0.75rem;">
                  <div>
                    <span style="font-weight: 700; color: var(--forest-900);">${i + 1}. ${w.patient_name}</span>
                    <span style="color: var(--slate-500); margin: 0 4px;">•</span>
                    <span style="color: var(--forest-700); font-weight: 600;">${w.treatment_type}</span>
                    ${w.notes ? `<span style="color: var(--slate-400); font-style: italic;"> (${w.notes})</span>` : ''}
                  </div>
                  <div style="font-weight: 700; color: var(--forest-900);">
                    ${w.start_time || ''} - ${w.end_time || ''} (${Number(w.duration_hours).toFixed(2)} hrs)
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      return `
        <div class="card" style="border-left: 4px solid ${r.is_off_day ? 'var(--slate-400)' : r.is_overtime ? '#f59e0b' : 'var(--forest-600)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 800; color: var(--forest-900);">${r.therapist_name}</h3>
                ${statusBadge}
              </div>
              <div style="font-size: 0.75rem; color: var(--slate-500); margin-top: 0.15rem;">${r.therapist_email}</div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 0.6875rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Overtime Remuneration</div>
              <div style="font-size: 1.125rem; font-weight: 800; color: var(--forest-900);">
                ${(r.overtime_salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR
              </div>
            </div>
          </div>

          <!-- Shifts Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; font-size: 0.75rem;">
            <div>
              <div style="color: var(--slate-500); font-weight: 600;">Shift 1 (Session 1):</div>
              <div style="font-weight: 700; color: var(--forest-900); font-size: 0.8125rem; margin-top: 0.15rem;">
                ${r.check_in_1 || '--:--'} → ${r.check_out_1 || '--:--'} (${(r.shift_1_hours || 0).toFixed(2)} hrs)
              </div>
            </div>

            <div>
              <div style="color: var(--slate-500); font-weight: 600;">Shift 2 (Session 2):</div>
              <div style="font-weight: 700; color: var(--forest-900); font-size: 0.8125rem; margin-top: 0.15rem;">
                ${r.check_in_2 || '--:--'} → ${r.check_out_2 || '--:--'} (${(r.shift_2_hours || 0).toFixed(2)} hrs)
              </div>
            </div>

            <div>
              <div style="color: var(--slate-500); font-weight: 600;">Total Day Duty:</div>
              <div style="font-weight: 800; color: var(--forest-900); font-size: 0.875rem; margin-top: 0.15rem;">
                ${(r.total_working_hours || 0).toFixed(2)} hrs
                <span style="font-size: 0.6875rem; font-weight: 600; color: var(--slate-500);">(Reg: ${(r.regular_hours || 0).toFixed(2)}h, OT: ${(r.overtime_hours || 0).toFixed(2)}h)</span>
              </div>
            </div>
          </div>

          ${worksHtml}
        </div>
      `;
    })
    .join('');

  if (window.lucide) window.lucide.createIcons();
}

// ====================================================================
// EXCEL EXPORT (EXCELJS)
// ====================================================================
async function handleExportExcel() {
  const monthKey = document.getElementById('report-month').value || '2026-11';
  const reportData = window.dataStore.calculateTherapistMonthlyReport(allTherapistRecords, monthKey);
  const therapists = reportData.therapists;

  if (therapists.length === 0) {
    window.showToast('Export Notice', 'No therapist records to export for this month.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-export-excel');
  btn.disabled = true;
  btn.innerHTML = 'Generating Excel...';

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AyurDesk - Ayuryoga International';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Therapist Monthly Report', {
      pageSetup: { orientation: 'landscape', paperSize: 9 },
      views: [{ showGridLines: true }],
    });

    // 1. Header Banner
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'AYURYOGA INTERNATIONAL';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF103B37' } };
    worksheet.getRow(1).height = 28;

    worksheet.mergeCells('A2:J2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Official Monthly Ayurvedic Therapist Performance & Overtime Remuneration Report (${monthKey})`;
    subtitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF23675B' } };
    worksheet.getRow(2).height = 22;

    // 2. Metadata
    worksheet.getCell('A3').value = 'Report Period:';
    worksheet.getCell('A3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('B3').value = `Month of ${monthKey}`;

    worksheet.getCell('E3').value = 'Overtime Standard:';
    worksheet.getCell('E3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('F3').value = 'Threshold: 5.0h/day • Rate: 75 MUR / hour';

    worksheet.getCell('A4').value = 'Authorized Officer:';
    worksheet.getCell('A4').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('B4').value = window.authManager.getCurrentUser()?.full_name || 'Administrator';

    worksheet.getCell('E4').value = 'Generated At:';
    worksheet.getCell('E4').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('F4').value = window.getReportGenerationTimestamp ? window.getReportGenerationTimestamp() : new Date().toLocaleString();

    worksheet.getRow(5).height = 10;

    // 3. Table Header Row (Row 6)
    const headers = [
      'Therapist Name',
      'Email Address',
      'Days Worked',
      'Off Days',
      'Treatments Done',
      'Total Duty Hours',
      'Regular Hours (≤5h)',
      'Overtime Hours (>5h)',
      'Rate (MUR/hr)',
      'Overtime Salary (MUR)',
    ];

    const headerRow = worksheet.getRow(6);
    headerRow.values = headers;
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 4. Data Rows
    let currentRowIdx = 7;
    therapists.forEach((t) => {
      const row = worksheet.getRow(currentRowIdx++);
      row.values = [
        t.therapist_name,
        t.therapist_email,
        t.days_worked,
        t.off_days,
        t.total_works,
        t.total_working_hours,
        t.total_regular_hours,
        t.total_overtime_hours,
        75,
        t.total_overtime_salary,
      ];
      row.font = { name: 'Arial', size: 9 };
      row.getCell(1).alignment = { horizontal: 'left' };
      row.getCell(2).alignment = { horizontal: 'left' };
      row.getCell(10).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF103B37' } };
    });

    // 5. Grand Combined Total Row
    const footRow = worksheet.getRow(currentRowIdx);
    footRow.values = [
      'COMBINED THERAPISTS TOTAL',
      'All Registered Clinical Staff',
      reportData.combined.days_worked,
      reportData.combined.off_days,
      reportData.combined.total_works,
      reportData.combined.total_working_hours,
      reportData.combined.total_regular_hours,
      reportData.combined.total_overtime_hours,
      75,
      reportData.combined.total_overtime_salary,
    ];
    footRow.height = 24;
    footRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7EF' } };
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF103B37' } };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
    });

    // Adjust column widths
    worksheet.columns = [
      { width: 24 }, // Name
      { width: 26 }, // Email
      { width: 14 }, // Days
      { width: 12 }, // Off
      { width: 18 }, // Works
      { width: 18 }, // Total Hours
      { width: 18 }, // Regular
      { width: 20 }, // Overtime
      { width: 14 }, // Rate
      { width: 22 }, // Salary
    ];

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AyurDesk_Therapists_Report_${monthKey}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    window.showToast('Excel Export Ready', `Downloaded ${a.download}`, 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Failed to generate Excel', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="file-spreadsheet"></i><span>Download Excel (.xlsx)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

// ====================================================================
// PDF EXPORT (JSPDF + AUTOTABLE)
// ====================================================================
async function handleExportPdf() {
  const monthKey = document.getElementById('report-month').value || '2026-11';
  const reportData = window.dataStore.calculateTherapistMonthlyReport(allTherapistRecords, monthKey);
  const therapists = reportData.therapists;

  if (therapists.length === 0) {
    window.showToast('Export Notice', 'No therapist records to export.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-export-pdf');
  btn.disabled = true;
  btn.innerHTML = 'Generating PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // 1. Header Banner
    doc.setFillColor(16, 59, 55); // #103B37 Forest Green
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AYURYOGA INTERNATIONAL', 14, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AYURDESK CLINICAL OPERATIONS • MONTHLY THERAPIST REPORT & OVERTIME STATEMENT', 14, 18);

    // 2. Metadata Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Period: Month of ${monthKey}`, 14, 32);
    doc.text(`Overtime Rule: Standard ≤ 5.0h/day • Rate: 75.00 MUR / hour above 5h`, 14, 38);

    doc.setFont('helvetica', 'normal');
    doc.text(`Authorized By: ${window.authManager.getCurrentUser()?.full_name || 'Administrator'}`, 190, 32);
    doc.text(`Generated: ${window.getReportGenerationTimestamp ? window.getReportGenerationTimestamp() : new Date().toLocaleString()}`, 190, 38);

    // 3. Table Rows
    const tableHeaders = [
      ['Therapist Name', 'Email Address', 'Days Worked', 'Off Days', 'Treatments', 'Duty Hours', 'Regular (≤5h)', 'Overtime (>5h)', 'Rate', 'Overtime Salary (MUR)'],
    ];

    const tableRows = therapists.map((t) => [
      t.therapist_name,
      t.therapist_email,
      t.days_worked,
      t.off_days,
      t.total_works,
      t.total_working_hours.toFixed(2),
      t.total_regular_hours.toFixed(2),
      `${t.total_overtime_hours.toFixed(2)}h`,
      '75 MUR',
      `${t.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`,
    ]);

    // Footer row
    const footRow = [
      'COMBINED GRAND TOTAL',
      'All Clinical Staff',
      reportData.combined.days_worked,
      reportData.combined.off_days,
      reportData.combined.total_works,
      reportData.combined.total_working_hours.toFixed(2),
      reportData.combined.total_regular_hours.toFixed(2),
      `${reportData.combined.total_overtime_hours.toFixed(2)}h`,
      '75 MUR',
      `${reportData.combined.total_overtime_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUR`,
    ];

    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      foot: [footRow],
      startY: 44,
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [15, 23, 42],
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [16, 59, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [247, 247, 239],
        textColor: [16, 59, 55],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // 4. Sign-off block
    const finalY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Prepared by Clinical Supervisor: ________________________', 14, finalY);
    doc.text('Approved by Medical Director / Admin: ________________________', 170, finalY);

    doc.save(`AyurDesk_Therapists_Report_${monthKey}.pdf`);
    window.showToast('PDF Export Ready', 'Official therapist report downloaded.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Failed to generate PDF', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="download"></i><span>Download PDF (.pdf)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}
