// ====================================================================
// AyurDesk - Admin Reports Export Center Script
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

  allReports = await window.dataStore.getReports();
  updateScopeInputs();
});

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

  const kpis = window.dataStore.calculateKpiSummary(scopedRecords);
  document.getElementById('export-metrics-text').textContent =
    `Records: ${scopedRecords.length} | Inquiries: ${kpis.totalEnquiries} | Bookings: ${kpis.totalBookings} | Confirmations: ${kpis.totalConfirmations}`;

  // Update Preview Table
  const tbody = document.getElementById('export-preview-body');
  if (scopedRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-400);">No records match the selected scope.</td></tr>`;
    return;
  }

  tbody.innerHTML = scopedRecords
    .map((r) => {
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.min(100, Math.round((r.total_responses / r.total_enquiries) * 100)) + '%'
          : '-';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--forest-900);">${window.formatDateDisplay(r.report_date)}</td>
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
}

// ==========================================
// Excel Export via ExcelJS
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

    // 1. Header Banner
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'AYURYOGA INTERNATIONAL';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF103B37' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 28;

    worksheet.mergeCells('A2:H2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `AyurDesk Operations Report - ${document.getElementById('export-summary-text').textContent}`;
    subtitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF23675B' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 22;

    // 2. Metadata
    const user = window.authManager.getCurrentUser();
    worksheet.getCell('A3').value = 'Generated By:';
    worksheet.getCell('A3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('B3').value = user ? user.full_name : 'Administrator';
    worksheet.getCell('D3').value = 'Generated At:';
    worksheet.getCell('D3').font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    worksheet.getCell('E3').value = window.getReportGenerationTimestamp();

    // Empty row
    worksheet.getRow(4).height = 10;

    // 3. Table Header
    const headers = [
      'Report Date',
      'Inquiries',
      'Responses',
      'Turnaround %',
      'Confirmed Bookings',
      'Confirmations',
      'WhatsApp Volume',
      'Normal Calls',
    ];
    const headerRow = worksheet.getRow(5);
    headerRow.values = headers;
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF103B37' },
      };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 4. Data Rows
    let currentRowIdx = 6;
    let sumInq = 0, sumResp = 0, sumBook = 0, sumConf = 0, sumWa = 0, sumCall = 0;

    scopedRecords.forEach((r) => {
      const row = worksheet.getRow(currentRowIdx);
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.round((r.total_responses / r.total_enquiries) * 100) + '%'
          : '-';

      row.values = [
        r.report_date,
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
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'right' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE5E5DC' } },
        };
      });
      currentRowIdx++;
    });

    // 5. Totals Row
    const totalRow = worksheet.getRow(currentRowIdx);
    const overallTurnaround = sumInq > 0 ? Math.round((sumResp / sumInq) * 100) + '%' : '-';
    totalRow.values = ['TOTALS', sumInq, sumResp, overallTurnaround, sumBook, sumConf, sumWa, sumCall];
    totalRow.height = 22;
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'right' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF7F7EF' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF103B37' } },
        bottom: { style: 'double', color: { argb: 'FF103B37' } },
      };
    });

    // Column widths
    worksheet.columns = [
      { width: 16 },
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
    a.download = `AyurDesk_Operations_${window.getTodayMauritiusDate()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    window.showToast('Excel Export Ready', 'Downloaded spreadsheet successfully.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating Excel', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="file-spreadsheet"></i><span>Download Excel (.xlsx)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}

// ==========================================
// PDF Export via jsPDF & autoTable
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
    doc.text(`AyurDesk Operations Report - ${document.getElementById('export-summary-text').textContent}`, 14, 22);

    doc.setDrawColor(229, 229, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 25, pageWidth - 14, 25);

    // Metadata
    const user = window.authManager.getCurrentUser();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated At: ${window.getReportGenerationTimestamp()}`, 14, 30);
    doc.text(`Authorized Officer: ${user ? user.full_name : 'Administrator'}`, 140, 30);

    // Table Data
    const headers = [
      ['Date', 'Inquiries', 'Responses', 'Turnaround', 'Bookings', 'Confirmations', 'WhatsApp', 'Normal Calls'],
    ];

    let sumInq = 0, sumResp = 0, sumBook = 0, sumConf = 0, sumWa = 0, sumCall = 0;

    const rows = scopedRecords.map((r) => {
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.round((r.total_responses / r.total_enquiries) * 100) + '%'
          : '-';

      if (r.total_enquiries) sumInq += r.total_enquiries;
      if (r.total_responses) sumResp += r.total_responses;
      if (r.total_bookings) sumBook += r.total_bookings;
      if (r.total_confirmations) sumConf += r.total_confirmations;
      if (r.whatsapp_calls_messages) sumWa += r.whatsapp_calls_messages;
      if (r.normal_calls) sumCall += r.normal_calls;

      return [
        r.report_date,
        r.total_enquiries ?? '-',
        r.total_responses ?? '-',
        turnaround,
        r.total_bookings ?? '-',
        r.total_confirmations ?? '-',
        r.whatsapp_calls_messages ?? '-',
        r.normal_calls ?? '-',
      ];
    });

    // Add totals row
    const overallTurnaround = sumInq > 0 ? Math.round((sumResp / sumInq) * 100) + '%' : '-';
    rows.push(['TOTALS', sumInq, sumResp, overallTurnaround, sumBook, sumConf, sumWa, sumCall]);

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
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [247, 247, 239];
        }
      },
    });

    doc.save(`AyurDesk_Operations_${window.getTodayMauritiusDate()}.pdf`);
    window.showToast('PDF Export Ready', 'Downloaded official PDF report.', 'success');
  } catch (err) {
    window.showToast('Export Error', err.message || 'Error generating PDF', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="download"></i><span>Download PDF (.pdf)</span>';
    if (window.lucide) window.lucide.createIcons();
  }
}
