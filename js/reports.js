// ====================================================================
// AyurDesk - Admin Reports Export Center Script
// Final Report: Calculates Combined Totals Including Shilpa & Gokul
// ====================================================================

let allReports = [];
let scopedRecords = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth(true)) return;

  window.initAppLayout('reports');

  const today = window.getTodayMauritiusDate();
  document.getElementById('report-single-date').value = today;
  document.getElementById('report-end-date').value = today;

  // Setup Scope Change
  const scopeSelect = document.getElementById('report-scope');
  scopeSelect.addEventListener('change', updateScopeInputs);

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
      window.showToast('Database Synchronized', 'Loaded latest operational entries from reception desk.', 'success');
      syncBtn.disabled = false;
      syncBtn.innerHTML = '<i data-lucide="refresh-cw"></i><span>Sync Database</span>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Reactive listeners for instant real-time updates when staff saves or edits
  window.addEventListener('ayurdesk:data-updated', async () => {
    await refreshReportsData(false);
  });
  window.addEventListener('storage', async (e) => {
    if (e.key === 'ayurdesk_reports_v2') {
      await refreshReportsData(false);
    }
  });
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('ayurdesk_sync');
      channel.onmessage = async () => {
        await refreshReportsData(false);
      };
    } catch (e) {}
  }

  await refreshReportsData(false);
  updateScopeInputs();
});

async function refreshReportsData(forceRemote = false) {
  allReports = await window.dataStore.getReports();

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
  // Default for historical reception entries:
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

function updateScopedRecords() {
  const scope = document.getElementById('report-scope').value;
  const singleDate = document.getElementById('report-single-date').value;
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;

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
    // range
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

  // Update Preview Table Body
  const tbody = document.getElementById('export-preview-body');
  const tfoot = document.getElementById('export-preview-foot');

  if (scopedRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--slate-400);">No records match the selected scope.</td></tr>`;
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

  // Update Preview Table Footer with Combined Total (Shilpa & Gokul)
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

// ==========================================
// Excel Export via ExcelJS (Calculates Combined Shilpa & Gokul)
// ==========================================
async function handleExportExcel() {
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
    const user = window.authManager.getCurrentUser();

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
    subtitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF23675B' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 22;

    // 2. Metadata
    worksheet.getCell('A3').value = 'Report Period:';
    worksheet.getCell('A3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('B3').value = document.getElementById('export-summary-text').textContent;

    worksheet.getCell('E3').value = 'Generated At:';
    worksheet.getCell('E3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('F3').value = window.getReportGenerationTimestamp();

    worksheet.getCell('A4').value = 'Authorized Officer:';
    worksheet.getCell('A4').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('B4').value = user ? user.full_name : 'Administrator';

    worksheet.getCell('E4').value = 'Reception Team:';
    worksheet.getCell('E4').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('F4').value = 'Shilpa & Gokul (Combined Reception Desk)';

    // Empty separator
    worksheet.getRow(5).height = 8;

    // 3. Reception Breakdown Box in Excel (Rows 6-9)
    worksheet.mergeCells('A6:D6');
    const boxTitle = worksheet.getCell('A6');
    boxTitle.value = 'RECEPTION PERSONNEL SUMMARY (SHILPA & GOKUL)';
    boxTitle.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    boxTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF23675B' } };

    const subHeader = worksheet.getRow(7);
    subHeader.values = ['Personnel', 'Active Days', 'Inquiries Attributed', 'Confirmed Bookings'];
    subHeader.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF103B37' } };

    const rowShilpa = worksheet.getRow(8);
    rowShilpa.values = ['Shilpa (Reception)', breakdown.shilpa.days, breakdown.shilpa.inquiries, breakdown.shilpa.bookings];
    rowShilpa.font = { name: 'Arial', size: 9 };

    const rowGokul = worksheet.getRow(9);
    rowGokul.values = ['Gokul (Reception)', breakdown.gokul.days, breakdown.gokul.inquiries, breakdown.gokul.bookings];
    rowGokul.font = { name: 'Arial', size: 9 };

    const rowCombSummary = worksheet.getRow(10);
    rowCombSummary.values = ['COMBINED RECEPTION TOTAL (Both Shilpa & Gokul)', scopedRecords.length, breakdown.combined.inquiries, breakdown.combined.bookings];
    rowCombSummary.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF103B37' } };
    rowCombSummary.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7EF' } };

    // Empty separator
    worksheet.getRow(11).height = 12;

    // 4. Main Data Table Header Row (Row 12)
    const headers = [
      'Report Date',
      'Receptionist / Shift',
      'Inquiries',
      'Responses',
      'Turnaround %',
      'Confirmed Bookings',
      'Confirmations',
      'WhatsApp Volume',
      'Normal Calls',
    ];
    const headerRow = worksheet.getRow(12);
    headerRow.values = headers;
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF103B37' } };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 5. Data Rows
    let currentRowIdx = 13;
    let sumInq = 0, sumResp = 0, sumBook = 0, sumConf = 0, sumWa = 0, sumCall = 0;

    scopedRecords.forEach((r) => {
      const row = worksheet.getRow(currentRowIdx);
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.round((r.total_responses / r.total_enquiries) * 100) + '%'
          : '-';
      const staff = getStaffAttribution(r);

      row.values = [
        r.report_date,
        staff,
        r.total_enquiries ?? '-',
        r.total_responses ?? '-',
        turnaround,
        r.total_bookings ?? '-',
        r.total_confirmations ?? '-',
        r.whatsapp_calls_messages ?? '-',
        r.normal_calls ?? '-',
      ];

      if (r.total_enquiries) sumInq += r.total_enquiries;
      if (r.total_responses) sumResp += r.total_responses;
      if (r.total_bookings) sumBook += r.total_bookings;
      if (r.total_confirmations) sumConf += r.total_confirmations;
      if (r.whatsapp_calls_messages) sumWa += r.whatsapp_calls_messages;
      if (r.normal_calls) sumCall += r.normal_calls;

      row.height = 18;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 2 ? 'left' : 'right' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E5DC' } } };
      });
      currentRowIdx++;
    });

    // 6. Final COMBINED TOTAL Row (Includes both Shilpa and Gokul)
    const totalRow = worksheet.getRow(currentRowIdx);
    const overallTurnaround = sumInq > 0 ? Math.round((sumResp / sumInq) * 100) + '%' : '-';
    totalRow.values = ['COMBINED TOTAL (Shilpa & Gokul)', 'Both Included', sumInq, sumResp, overallTurnaround, sumBook, sumConf, sumWa, sumCall];
    totalRow.height = 24;
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF103B37' } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber <= 2 ? 'left' : 'right' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Light teal/blue tint
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF103B37' } },
        bottom: { style: 'double', color: { argb: 'FF103B37' } },
      };
    });

    // Column widths
    worksheet.columns = [
      { width: 15 },
      { width: 26 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 20 },
      { width: 16 },
      { width: 18 },
      { width: 16 },
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

    window.showToast('Excel Export Ready', 'Downloaded spreadsheet with combined Shilpa & Gokul totals.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating Excel', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="file-spreadsheet"></i><span>Download Excel (.xlsx)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

// ==========================================
// PDF Export via jsPDF & autoTable (Combined Shilpa & Gokul)
// ==========================================
function handleExportPdf() {
  if (scopedRecords.length === 0) {
    window.showToast('Export Notice', 'No records match current scope to export.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-export-pdf');
  btn.disabled = true;
  btn.innerHTML = 'Generating PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top brand bar
    doc.setFillColor(16, 59, 55);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(16, 59, 55);
    doc.text('AYURYOGA INTERNATIONAL', 14, 16);

    doc.setFontSize(11);
    doc.setTextColor(35, 103, 91);
    doc.text(`AyurDesk Operations Report – Reception Combined (Shilpa & Gokul)`, 14, 22);

    doc.setDrawColor(229, 229, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 25, pageWidth - 14, 25);

    // Metadata
    const user = window.authManager.getCurrentUser();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated At: ${window.getReportGenerationTimestamp()}`, 14, 30);
    doc.text(`Authorized Officer: ${user ? user.full_name : 'Administrator'}`, 120, 30);
    doc.text(`Reception Team: Shilpa & Gokul (Both Included in Totals)`, 200, 30);

    // Table Data
    const headers = [
      ['Date', 'Receptionist', 'Inquiries', 'Responses', 'Turnaround', 'Bookings', 'Confirmations', 'WhatsApp', 'Normal Calls'],
    ];

    let sumInq = 0, sumResp = 0, sumBook = 0, sumConf = 0, sumWa = 0, sumCall = 0;

    const rows = scopedRecords.map((r) => {
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.round((r.total_responses / r.total_enquiries) * 100) + '%'
          : '-';
      const staff = getStaffAttribution(r);

      if (r.total_enquiries) sumInq += r.total_enquiries;
      if (r.total_responses) sumResp += r.total_responses;
      if (r.total_bookings) sumBook += r.total_bookings;
      if (r.total_confirmations) sumConf += r.total_confirmations;
      if (r.whatsapp_calls_messages) sumWa += r.whatsapp_calls_messages;
      if (r.normal_calls) sumCall += r.normal_calls;

      return [
        r.report_date,
        staff,
        r.total_enquiries ?? '-',
        r.total_responses ?? '-',
        turnaround,
        r.total_bookings ?? '-',
        r.total_confirmations ?? '-',
        r.whatsapp_calls_messages ?? '-',
        r.normal_calls ?? '-',
      ];
    });

    // Add Combined Totals row (Both Shilpa & Gokul)
    const overallTurnaround = sumInq > 0 ? Math.round((sumResp / sumInq) * 100) + '%' : '-';
    rows.push(['COMBINED TOTAL (Shilpa & Gokul)', 'Both Included', sumInq, sumResp, overallTurnaround, sumBook, sumConf, sumWa, sumCall]);

    doc.autoTable({
      startY: 34,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 59, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.8,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 26 },
        1: { cellWidth: 44 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [224, 242, 254]; // soft blue-teal
          data.cell.styles.textColor = [16, 59, 55];
        }
      },
    });

    doc.save(`AyurDesk_Operations_Combined_${window.getTodayMauritiusDate()}.pdf`);
    window.showToast('PDF Export Ready', 'Downloaded official PDF report with combined Shilpa & Gokul totals.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating PDF', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="download"></i><span>Download PDF (.pdf)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}
