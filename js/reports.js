// ====================================================================
// AyurDesk - Admin Reports Export Center Script
// Final Report:
// 1. Reception Operations: Calculates Combined Totals Including Shilpa & Gokul
// 2. Therapist Overtime Payroll: Grand Baie, Curepipe, Moka (>5h @ 75 MUR/hr)
// ====================================================================

let allReports = [];
let scopedRecords = [];
let allTherapistHours = [];
let scopedTherapistRecords = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth(true)) return;

  window.initAppLayout('reports');

  const today = window.getTodayMauritiusDate();
  document.getElementById('report-single-date').value = today;
  document.getElementById('report-end-date').value = today;

  // Setup Category & Scope Changes
  const categorySelect = document.getElementById('report-category');
  const branchSelect = document.getElementById('report-branch-select');
  const branchGroup = document.getElementById('group-branch-filter');

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const isTherapist = categorySelect.value === 'therapist_overtime';
      if (branchGroup) branchGroup.style.display = isTherapist ? 'block' : 'none';
      document.getElementById('card-reception-breakdown').style.display = isTherapist ? 'none' : 'block';
      document.getElementById('card-therapist-breakdown').style.display = isTherapist ? 'block' : 'none';
      updateScopedRecords();
    });
  }

  if (branchSelect) {
    branchSelect.addEventListener('change', updateScopedRecords);
  }

  const scopeSelect = document.getElementById('report-scope');
  if (scopeSelect) {
    scopeSelect.addEventListener('change', updateScopeInputs);
  }

  document.getElementById('report-single-date').addEventListener('change', updateScopedRecords);
  document.getElementById('report-start-date').addEventListener('change', updateScopedRecords);
  document.getElementById('report-end-date').addEventListener('change', updateScopedRecords);

  // Setup Export Buttons
  document.getElementById('btn-export-excel').addEventListener('click', handleExportExcel);
  document.getElementById('btn-export-pdf').addEventListener('click', handleExportPdf);

  // Setup Database Sync Refresh Button
  const syncBtn = document.getElementById('btn-sync-reports');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i><span>Syncing...</span>';
      if (window.lucide) window.lucide.createIcons();
      await refreshReportsData(true);
      window.showToast('Database Synchronized', 'Loaded latest operational and therapist entries.', 'success');
      syncBtn.disabled = false;
      syncBtn.innerHTML = '<i data-lucide="refresh-cw"></i><span>Sync Database</span>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Reactive listeners for instant real-time updates when staff saves or edits
  window.addEventListener('ayurdesk:data-updated', async () => {
    await refreshReportsData(false);
  });

  await refreshReportsData(false);
  updateScopeInputs();
});

async function refreshReportsData(forceRemote = false) {
  allReports = await window.dataStore.getReports();
  allTherapistHours = await window.dataStore.getTherapistHours();

  // If reports have dates newer than today, extend end date default so new entries are shown
  if (allReports && allReports.length > 0) {
    const latestDate = allReports[0].report_date;
    const endDateEl = document.getElementById('report-end-date');
    if (endDateEl && (!endDateEl.value || endDateEl.value < latestDate)) {
      endDateEl.value = latestDate;
    }
  }

  updateScopedRecords();
}

function updateScopeInputs() {
  const scope = document.getElementById('report-scope').value;
  const singleGroup = document.getElementById('scope-single-group');
  const rangeGroup = document.getElementById('scope-range-group');

  if (scope === 'single') {
    singleGroup.style.display = 'flex';
    rangeGroup.style.display = 'none';
  } else if (scope === 'range') {
    singleGroup.style.display = 'none';
    rangeGroup.style.display = 'flex';
  } else {
    singleGroup.style.display = 'none';
    rangeGroup.style.display = 'none';
  }

  updateScopedRecords();
}

function getStaffAttribution(r) {
  const c = (r.created_by_name || '').toLowerCase();
  const u = (r.updated_by_name || '').toLowerCase();

  const hasShilpa = c.includes('shilpa') || u.includes('shilpa');
  const hasGokul = c.includes('gokul') || u.includes('gokul');

  if (hasShilpa && hasGokul) {
    return 'Shilpa & Gokul (Handover)';
  } else if (hasShilpa) {
    return 'Shilpa (Reception)';
  } else if (hasGokul) {
    return 'Gokul (Reception)';
  } else if (r.created_by_name) {
    return r.created_by_name;
  }
  return 'Shilpa & Gokul (Reception)';
}

function calculateStaffBreakdown(records) {
  let shilpaDays = 0, shilpaInq = 0, shilpaBook = 0;
  let gokulDays = 0, gokulInq = 0, gokulBook = 0;
  let combInq = 0, combResp = 0, combBook = 0, combConf = 0, combWa = 0, combCall = 0;

  records.forEach((r) => {
    const inq = r.total_enquiries || 0;
    const resp = r.total_responses || 0;
    const book = r.total_bookings || 0;
    const conf = r.total_confirmations || 0;
    const wa = r.whatsapp_calls_messages || 0;
    const call = r.normal_calls || 0;

    combInq += inq;
    combResp += resp;
    combBook += book;
    combConf += conf;
    combWa += wa;
    combCall += call;

    const attr = getStaffAttribution(r);
    if (attr.includes('Shilpa') && attr.includes('Gokul')) {
      shilpaDays++;
      gokulDays++;
      shilpaInq += Math.round(inq / 2);
      gokulInq += Math.round(inq / 2);
      shilpaBook += Math.round(book / 2);
      gokulBook += Math.round(book / 2);
    } else if (attr.includes('Shilpa')) {
      shilpaDays++;
      shilpaInq += inq;
      shilpaBook += book;
    } else if (attr.includes('Gokul')) {
      gokulDays++;
      gokulInq += inq;
      gokulBook += book;
    } else {
      shilpaDays++;
      gokulDays++;
      shilpaInq += Math.round(inq / 2);
      gokulInq += Math.round(inq / 2);
      shilpaBook += Math.round(book / 2);
      gokulBook += Math.round(book / 2);
    }
  });

  return {
    shilpa: { days: shilpaDays, inquiries: shilpaInq, bookings: shilpaBook },
    gokul: { days: gokulDays, inquiries: gokulInq, bookings: gokulBook },
    combined: {
      inquiries: combInq,
      responses: combResp,
      bookings: combBook,
      confirmations: combConf,
      whatsapp: combWa,
      normalCalls: combCall,
      totalComms: combWa + combCall,
      turnaround: combInq > 0 ? Math.round((combResp / combInq) * 100) + '%' : '0%',
    },
  };
}

async function updateScopedRecords() {
  const category = document.getElementById('report-category')?.value || 'operations';
  const scope = document.getElementById('report-scope').value;
  const singleDate = document.getElementById('report-single-date').value;
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;
  const branchFilter = document.getElementById('report-branch-select')?.value || 'all';

  if (category === 'therapist_overtime') {
    await renderTherapistReportPreview(scope, singleDate, startDate, endDate, branchFilter);
  } else {
    renderOperationsReportPreview(scope, singleDate, startDate, endDate);
  }
}

// --------------------------------------------------------------------
// 1. Operations Report Preview
// --------------------------------------------------------------------
function renderOperationsReportPreview(scope, singleDate, startDate, endDate) {
  if (scope === 'single') {
    scopedRecords = allReports.filter((r) => r.report_date === singleDate);
  } else if (scope === 'weekly') {
    scopedRecords = [...allReports]
      .sort((a, b) => b.report_date.localeCompare(a.report_date))
      .slice(0, 7)
      .reverse();
  } else if (scope === 'monthly') {
    scopedRecords = [...allReports]
      .sort((a, b) => b.report_date.localeCompare(a.report_date))
      .slice(0, 30)
      .reverse();
  } else if (scope === 'all') {
    scopedRecords = [...allReports].sort((a, b) => a.report_date.localeCompare(b.report_date));
  } else {
    scopedRecords = allReports
      .filter((r) => {
        if (startDate && r.report_date < startDate) return false;
        if (endDate && r.report_date > endDate) return false;
        return true;
      })
      .sort((a, b) => a.report_date.localeCompare(b.report_date));
  }

  // Update Summary texts
  let scopeTitle = 'Date Range';
  if (scope === 'single') scopeTitle = `Single Date: ${singleDate}`;
  else if (scope === 'weekly') scopeTitle = 'Weekly Operations (Last 7 Days)';
  else if (scope === 'monthly') scopeTitle = 'Monthly Operations (30 Days)';
  else if (scope === 'all') scopeTitle = 'All Historical Operations';
  else scopeTitle = `Range: ${startDate || 'Earliest'} to ${endDate || 'Latest'}`;

  document.getElementById('export-summary-text').textContent = scopeTitle;

  const breakdown = calculateStaffBreakdown(scopedRecords);
  document.getElementById('export-metrics-text').textContent =
    `Records: ${scopedRecords.length} | Combined Inquiries: ${breakdown.combined.inquiries} | Combined Bookings: ${breakdown.combined.bookings} | Staff: Shilpa & Gokul`;

  // Update Reception Staff Breakdown Card
  document.getElementById('rep-shilpa-records').textContent = breakdown.shilpa.days;
  document.getElementById('rep-shilpa-inquiries').textContent = breakdown.shilpa.inquiries.toLocaleString();
  document.getElementById('rep-shilpa-bookings').textContent = breakdown.shilpa.bookings.toLocaleString();

  document.getElementById('rep-gokul-records').textContent = breakdown.gokul.days;
  document.getElementById('rep-gokul-inquiries').textContent = breakdown.gokul.inquiries.toLocaleString();
  document.getElementById('rep-gokul-bookings').textContent = breakdown.gokul.bookings.toLocaleString();

  document.getElementById('rep-combined-inquiries').textContent = breakdown.combined.inquiries.toLocaleString();
  document.getElementById('rep-combined-bookings').textContent = breakdown.combined.bookings.toLocaleString();
  document.getElementById('rep-combined-comms').textContent = `${breakdown.combined.totalComms.toLocaleString()} (${breakdown.combined.whatsapp} WA / ${breakdown.combined.normalCalls} Calls)`;

  // Update Table Header
  const thead = document.getElementById('export-preview-head');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Receptionist</th>
        <th class="numeric">Inquiries</th>
        <th class="numeric">Responses</th>
        <th class="numeric">Turnaround</th>
        <th class="numeric">Bookings</th>
        <th class="numeric">Confirmations</th>
        <th class="numeric">WhatsApp</th>
        <th class="numeric">Calls</th>
      </tr>
    `;
  }

  // Update Preview Table Body
  const tbody = document.getElementById('export-preview-body');
  const tfoot = document.getElementById('export-preview-foot');

  if (scopedRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--slate-400);">No operational records match the selected scope.</td></tr>`;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  tbody.innerHTML = scopedRecords
    .map((r) => {
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.min(100, Math.round((r.total_responses / r.total_enquiries) * 100)) + '%'
          : '-';
      const staff = getStaffAttribution(r);

      return `
        <tr>
          <td style="font-weight: 600; color: var(--forest-900);">${window.formatDateDisplay(r.report_date)}</td>
          <td><span class="badge badge-staff">${staff}</span></td>
          <td class="numeric">${r.total_enquiries ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.total_responses ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${turnaround}</td>
          <td class="numeric" style="font-weight: 700;">${r.total_bookings ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.total_confirmations ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.whatsapp_calls_messages ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.normal_calls ?? '<span class="empty-cell">-</span>'}</td>
        </tr>
      `;
    })
    .join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background-color: var(--warm-100); border-top: 2px solid var(--forest-900);">
        <td colspan="2" style="font-weight: 800; color: var(--forest-900); padding: 0.75rem 0.875rem;">
          COMBINED TOTAL (Shilpa & Gokul)
        </td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.inquiries}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.responses}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);"><span class="badge badge-success">${breakdown.combined.turnaround}</span></td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.bookings}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.confirmations}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.whatsapp}</td>
        <td class="numeric" style="font-weight: 800; color: var(--forest-900);">${breakdown.combined.normalCalls}</td>
      </tr>
    `;
  }
}

// --------------------------------------------------------------------
// 2. Therapist Overtime Report Preview
// --------------------------------------------------------------------
async function renderTherapistReportPreview(scope, singleDate, startDate, endDate, branchFilter) {
  let filtered = [...allTherapistHours];

  if (scope === 'single') {
    filtered = filtered.filter((r) => r.record_date === singleDate);
  } else if (scope === 'weekly') {
    const dates = Array.from(new Set(allTherapistHours.map((r) => r.record_date)))
      .sort()
      .slice(-7);
    filtered = filtered.filter((r) => dates.includes(r.record_date));
  } else if (scope === 'monthly') {
    const dates = Array.from(new Set(allTherapistHours.map((r) => r.record_date)))
      .sort()
      .slice(-30);
    filtered = filtered.filter((r) => dates.includes(r.record_date));
  } else if (scope === 'range') {
    filtered = filtered.filter((r) => {
      if (startDate && r.record_date < startDate) return false;
      if (endDate && r.record_date > endDate) return false;
      return true;
    });
  }

  if (branchFilter !== 'all') {
    filtered = filtered.filter((r) => r.branch === branchFilter);
  }

  scopedTherapistRecords = filtered.sort((a, b) => b.record_date.localeCompare(a.record_date));

  // Calculate Branch Breakdown
  const branches = {
    'Grand Baie': { hours: 0, overtime: 0, salary: 0 },
    'Curepipe': { hours: 0, overtime: 0, salary: 0 },
    'Moka': { hours: 0, overtime: 0, salary: 0 },
  };

  let grandHours = 0;
  let grandRegular = 0;
  let grandOvertime = 0;
  let grandSalary = 0;

  scopedTherapistRecords.forEach((r) => {
    const h = Number(r.hours) || 0;
    const reg = Number(r.regular_hours) || 0;
    const ot = Number(r.overtime_hours) || 0;
    const sal = Number(r.overtime_salary) || 0;

    grandHours += h;
    grandRegular += reg;
    grandOvertime += ot;
    grandSalary += sal;

    if (branches[r.branch]) {
      branches[r.branch].hours += h;
      branches[r.branch].overtime += ot;
      branches[r.branch].salary += sal;
    }
  });

  document.getElementById('ot-summary-grandbaie').textContent =
    `${branches['Grand Baie'].hours.toFixed(1)}h • MUR ${branches['Grand Baie'].salary.toFixed(2)}`;
  document.getElementById('ot-summary-curepipe').textContent =
    `${branches['Curepipe'].hours.toFixed(1)}h • MUR ${branches['Curepipe'].salary.toFixed(2)}`;
  document.getElementById('ot-summary-moka').textContent =
    `${branches['Moka'].hours.toFixed(1)}h • MUR ${branches['Moka'].salary.toFixed(2)}`;
  document.getElementById('ot-summary-total-pay').textContent = `MUR ${grandSalary.toFixed(2)}`;
  document.getElementById('ot-summary-total-hours').textContent =
    `${grandOvertime.toFixed(1)} OT Hours (>5h) across active clinics`;

  document.getElementById('export-summary-text').textContent =
    `Therapist Overtime Roster (${branchFilter.toUpperCase()})`;
  document.getElementById('export-metrics-text').textContent =
    `Shifts Logged: ${scopedTherapistRecords.length} | Total Hours: ${grandHours.toFixed(1)} | Overtime Hours: ${grandOvertime.toFixed(1)} | Overtime Pay: MUR ${grandSalary.toFixed(2)}`;

  // Update Table Header
  const thead = document.getElementById('export-preview-head');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Therapist Name</th>
        <th>Branch</th>
        <th class="numeric">Working Hours</th>
        <th class="numeric">Regular (≤ 5h)</th>
        <th class="numeric">Overtime (> 5h)</th>
        <th class="numeric">Rate</th>
        <th class="numeric">Overtime Pay (MUR)</th>
        <th>Logged By</th>
      </tr>
    `;
  }

  const tbody = document.getElementById('export-preview-body');
  const tfoot = document.getElementById('export-preview-foot');

  if (scopedTherapistRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--slate-400);">No therapist hours logged for the selected scope. Use "Therapist Hours" in sidebar to enter shifts.</td></tr>`;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  tbody.innerHTML = scopedTherapistRecords
    .map((r) => {
      const isOt = r.overtime_hours > 0;
      return `
        <tr>
          <td style="font-weight: 600; color: var(--forest-900);">${window.formatDateDisplay(r.record_date)}</td>
          <td style="font-weight: 700; color: var(--forest-900);">${r.therapist_name}</td>
          <td><span class="badge">${r.branch}</span></td>
          <td class="numeric" style="font-weight: 700;">${Number(r.hours).toFixed(1)}</td>
          <td class="numeric">${Number(r.regular_hours).toFixed(1)}</td>
          <td class="numeric" style="font-weight: 700; color: ${isOt ? '#b45309' : 'inherit'};">
            ${isOt ? `+${Number(r.overtime_hours).toFixed(1)}` : '0.0'}
          </td>
          <td class="numeric" style="color: var(--slate-500);">MUR 75</td>
          <td class="numeric" style="font-weight: 800; color: ${isOt ? 'var(--forest-900)' : 'var(--slate-400)'};">
            MUR ${Number(r.overtime_salary).toFixed(2)}
          </td>
          <td style="font-size: 0.75rem; color: var(--slate-500);">${r.updated_by_name || r.created_by_name || 'Staff'}</td>
        </tr>
      `;
    })
    .join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background-color: #fef3c7; border-top: 2px solid #b45309;">
        <td colspan="3" style="font-weight: 800; color: #92400e; padding: 0.75rem 0.875rem;">
          COMBINED OVERTIME TOTAL (> 5h @ 75 MUR/hr)
        </td>
        <td class="numeric" style="font-weight: 800; color: #92400e;">${grandHours.toFixed(1)}</td>
        <td class="numeric" style="font-weight: 800; color: #92400e;">${grandRegular.toFixed(1)}</td>
        <td class="numeric" style="font-weight: 800; color: #b45309;">+${grandOvertime.toFixed(1)}</td>
        <td class="numeric" style="font-weight: 800; color: #92400e;">MUR 75</td>
        <td class="numeric" style="font-weight: 800; color: #78350f; font-size: 1rem;">MUR ${grandSalary.toFixed(2)}</td>
        <td>-</td>
      </tr>
    `;
  }
}

// ==========================================
// Export Router: Excel
// ==========================================
async function handleExportExcel() {
  const category = document.getElementById('report-category')?.value || 'operations';
  if (category === 'therapist_overtime') {
    await exportTherapistExcel();
  } else {
    await exportOperationsExcel();
  }
}

// ==========================================
// Export Router: PDF
// ==========================================
function handleExportPdf() {
  const category = document.getElementById('report-category')?.value || 'operations';
  if (category === 'therapist_overtime') {
    exportTherapistPdf();
  } else {
    exportOperationsPdf();
  }
}

// --------------------------------------------------------------------
// Export Operations to Excel
// --------------------------------------------------------------------
async function exportOperationsExcel() {
  if (scopedRecords.length === 0) {
    window.showToast('Export Notice', 'No records match current scope to export.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-export-excel');
  btn.disabled = true;
  btn.innerHTML = 'Generating Excel...';

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AyurDesk - Ayuryoga International';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Operations Report', {
      pageSetup: { orientation: 'landscape', paperSize: 9 },
      views: [{ showGridLines: true }],
    });

    const breakdown = calculateStaffBreakdown(scopedRecords);

    // 1. Header Banner
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'AYURYOGA INTERNATIONAL';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF103B37' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 28;

    worksheet.mergeCells('A2:I2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `AyurDesk Final Operations Report – Reception Combined (Shilpa & Gokul)`;
    subtitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF23675B' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    worksheet.addRow([]);

    // Header Row
    const headerRow = worksheet.addRow([
      'Report Date',
      'Receptionist On Duty',
      'Inquiries Received',
      'Responses Provided',
      'Turnaround %',
      'Confirmed Bookings',
      'Intake Confirmations',
      'WhatsApp Inquiries',
      'Phone Call Inquiries',
    ]);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    scopedRecords.forEach((r) => {
      const turnaround =
        r.total_enquiries && r.total_responses
          ? +(r.total_responses / r.total_enquiries).toFixed(2)
          : null;
      const staff = getStaffAttribution(r);

      const row = worksheet.addRow([
        r.report_date,
        staff,
        r.total_enquiries,
        r.total_responses,
        turnaround,
        r.total_bookings,
        r.total_confirmations,
        r.whatsapp_calls_messages,
        r.normal_calls,
      ]);
      row.height = 20;
      row.getCell(5).numFmt = '0.0%';
    });

    // Combined Total Row
    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      'COMBINED TOTAL (Shilpa & Gokul)',
      'Both Reception Shifts',
      breakdown.combined.inquiries,
      breakdown.combined.responses,
      breakdown.combined.turnaround,
      breakdown.combined.bookings,
      breakdown.combined.confirmations,
      breakdown.combined.whatsapp,
      breakdown.combined.normalCalls,
    ]);
    totalRow.height = 24;
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF103B37' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4EA' } };
    });

    worksheet.columns = [
      { width: 14 },
      { width: 26 },
      { width: 18 },
      { width: 18 },
      { width: 16 },
      { width: 18 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AyurDesk_Operations_Combined_${window.getTodayMauritiusDate()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    window.showToast('Excel Downloaded', 'Exported combined operations report.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating Excel', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="file-spreadsheet"></i><span>Download Excel (.xlsx)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

// --------------------------------------------------------------------
// Export Therapist Overtime to Excel
// --------------------------------------------------------------------
async function exportTherapistExcel() {
  if (scopedTherapistRecords.length === 0) {
    window.showToast('Export Notice', 'No therapist records match current scope to export.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-export-excel');
  btn.disabled = true;
  btn.innerHTML = 'Generating Excel...';

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AyurDesk - Ayuryoga International';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Therapist Overtime Payroll', {
      views: [{ showGridLines: true }],
    });

    sheet.mergeCells('A1:I1');
    sheet.getCell('A1').value = 'AYURYOGA INTERNATIONAL - THERAPIST WORKING HOURS & OVERTIME PAYROLL';
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 34;

    sheet.mergeCells('A2:I2');
    sheet.getCell('A2').value =
      'Overtime Rule: > 5.0 hours daily @ 75 MUR/hour | Branches: Grand Baie, Curepipe, Moka';
    sheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
    sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Date',
      'Therapist Name',
      'Branch',
      'Working Hours',
      'Regular Hours (≤ 5h)',
      'Overtime Hours (> 5h)',
      'Overtime Rate (MUR)',
      'Overtime Pay (MUR)',
      'Recorded By',
    ]);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF23675B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let grandHours = 0, grandReg = 0, grandOt = 0, grandSal = 0;

    scopedTherapistRecords.forEach((r) => {
      const h = Number(r.hours) || 0;
      const reg = Number(r.regular_hours) || 0;
      const ot = Number(r.overtime_hours) || 0;
      const sal = Number(r.overtime_salary) || 0;

      grandHours += h;
      grandReg += reg;
      grandOt += ot;
      grandSal += sal;

      const row = sheet.addRow([
        r.record_date,
        r.therapist_name,
        r.branch,
        h,
        reg,
        ot,
        75,
        sal,
        r.updated_by_name || r.created_by_name || 'Staff',
      ]);
      row.height = 20;
      row.getCell(4).numFmt = '#,##0.0';
      row.getCell(5).numFmt = '#,##0.0';
      row.getCell(6).numFmt = '#,##0.0';
      row.getCell(7).numFmt = '"MUR " #,##0.00';
      row.getCell(8).numFmt = '"MUR " #,##0.00';
    });

    // Grand Total Row
    sheet.addRow([]);
    const grandRow = sheet.addRow([
      'GRAND TOTAL',
      'ALL 12 THERAPISTS',
      '3 BRANCHES',
      grandHours,
      grandReg,
      grandOt,
      75,
      grandSal,
      'System Validated',
    ]);
    grandRow.height = 26;
    grandRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF103B37' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    });
    grandRow.getCell(4).numFmt = '#,##0.0';
    grandRow.getCell(5).numFmt = '#,##0.0';
    grandRow.getCell(6).numFmt = '#,##0.0';
    grandRow.getCell(7).numFmt = '"MUR " #,##0.00';
    grandRow.getCell(8).numFmt = '"MUR " #,##0.00';

    sheet.columns = [
      { width: 14 },
      { width: 20 },
      { width: 16 },
      { width: 16 },
      { width: 18 },
      { width: 20 },
      { width: 20 },
      { width: 24 },
      { width: 18 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ayuryoga_Therapist_Overtime_Payroll_${window.getTodayMauritiusDate()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    window.showToast('Excel Downloaded', 'Exported therapist overtime payroll spreadsheet.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating Excel', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="file-spreadsheet"></i><span>Download Excel (.xlsx)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

// --------------------------------------------------------------------
// PDF Exports
// --------------------------------------------------------------------
function exportOperationsPdf() {
  if (scopedRecords.length === 0) {
    window.showToast('Export Notice', 'No records match current scope to export.', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(16, 59, 55);
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 59, 55);
  doc.text('AYURYOGA INTERNATIONAL', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Official Operations Report - Generated on ${window.getTodayMauritiusDate()}`, 14, 21);

  const breakdown = calculateStaffBreakdown(scopedRecords);

  const tableData = scopedRecords.map((r) => [
    r.report_date,
    getStaffAttribution(r),
    r.total_enquiries ?? '-',
    r.total_responses ?? '-',
    r.total_bookings ?? '-',
    r.total_confirmations ?? '-',
    r.whatsapp_calls_messages ?? '-',
    r.normal_calls ?? '-',
  ]);

  tableData.push([
    'COMBINED TOTAL',
    'Shilpa & Gokul',
    String(breakdown.combined.inquiries),
    String(breakdown.combined.responses),
    String(breakdown.combined.bookings),
    String(breakdown.combined.confirmations),
    String(breakdown.combined.whatsapp),
    String(breakdown.combined.normalCalls),
  ]);

  doc.autoTable({
    startY: 26,
    head: [['Date', 'Staff', 'Inquiries', 'Responses', 'Bookings', 'Confirmations', 'WhatsApp', 'Calls']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 59, 55], textColor: 255 },
  });

  doc.save(`AyurDesk_Operations_Report_${window.getTodayMauritiusDate()}.pdf`);
  window.showToast('PDF Export Ready', 'Downloaded official operations report PDF.', 'success');
}

function exportTherapistPdf() {
  if (scopedTherapistRecords.length === 0) {
    window.showToast('Export Notice', 'No records match current scope to export.', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(16, 59, 55);
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 59, 55);
  doc.text('AYURYOGA INTERNATIONAL', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Therapist Working Hours & Overtime Remuneration (>5h @ 75 MUR/hr)', 14, 21);

  let grandHours = 0, grandOt = 0, grandSal = 0;

  const tableData = scopedTherapistRecords.map((r) => {
    const h = Number(r.hours) || 0;
    const ot = Number(r.overtime_hours) || 0;
    const sal = Number(r.overtime_salary) || 0;
    grandHours += h;
    grandOt += ot;
    grandSal += sal;

    return [
      r.record_date,
      r.therapist_name,
      r.branch,
      h.toFixed(1),
      Number(r.regular_hours || 0).toFixed(1),
      ot > 0 ? `+${ot.toFixed(1)}` : '0.0',
      'MUR 75',
      `MUR ${sal.toFixed(2)}`,
      r.updated_by_name || 'Staff',
    ];
  });

  tableData.push([
    'COMBINED TOTAL',
    '12 Therapists',
    '3 Branches',
    grandHours.toFixed(1),
    '-',
    `+${grandOt.toFixed(1)}`,
    'MUR 75',
    `MUR ${grandSal.toFixed(2)}`,
    'Verified',
  ]);

  doc.autoTable({
    startY: 26,
    head: [['Date', 'Therapist', 'Branch', 'Hours', 'Regular (≤5h)', 'Overtime (>5h)', 'Rate', 'Overtime Pay', 'Recorded By']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 59, 55], textColor: 255 },
  });

  doc.save(`Ayuryoga_Therapist_Overtime_Payroll_${window.getTodayMauritiusDate()}.pdf`);
  window.showToast('PDF Export Ready', 'Downloaded therapist overtime payroll PDF.', 'success');
}
