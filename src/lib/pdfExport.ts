// ====================================================================
// AyurDesk - PDF Export Engine (jsPDF + autoTable)
// Organization: Ayuryoga International
// Standard: Landscape A4 with fitted columns
// ====================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyReport } from '../types';
import { getReportGenerationTimestamp } from './timezone';

export interface PdfExportOptions {
  records: DailyReport[];
  scopeTitle: string;
  periodText: string;
  adminName: string;
  fileName?: string;
}

export function exportToPdf({
  records,
  scopeTitle,
  periodText,
  adminName,
  fileName,
}: PdfExportOptions): void {
  // A4 Landscape is 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Decorative Brand Bar
  doc.setFillColor(16, 59, 55); // #103B37 Dark Forest Green
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Organization & Platform Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 59, 55);
  doc.text('AYURYOGA INTERNATIONAL', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(35, 103, 91); // #23675B Teal
  doc.text(`AyurDesk – Daily Operations Management System | ${scopeTitle}`, 14, 22);

  // Divider line
  doc.setDrawColor(229, 229, 220); // #E5E5DC
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  // 3. Metadata block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  doc.text(`Report Period: ${periodText}`, 14, 31);
  doc.text(`Generated At: ${getReportGenerationTimestamp()}`, 14, 36);

  doc.text(`Authorized Administrator: ${adminName}`, pageWidth - 14, 31, { align: 'right' });
  doc.text(`Reception Staff: Shilpa & Gokul (Both Included in Totals)`, pageWidth - 14, 36, { align: 'right' });

  // 4. Calculate Totals for Footer Row
  let sumEnquiries = 0;
  let sumResponses = 0;
  let sumConfirmations = 0;
  let sumBookings = 0;
  let sumTomorrow = 0;
  let sumWhatsApp = 0;
  let sumNormal = 0;

  const tableBody = records.map((rec) => {
    if (rec.total_enquiries !== null) sumEnquiries += rec.total_enquiries;
    if (rec.total_responses !== null) sumResponses += rec.total_responses;
    if (rec.total_confirmations !== null) sumConfirmations += rec.total_confirmations;
    if (rec.total_bookings !== null) sumBookings += rec.total_bookings;
    if (rec.tomorrow_bookings !== null) sumTomorrow += rec.tomorrow_bookings;
    if (rec.whatsapp_calls_messages !== null) sumWhatsApp += rec.whatsapp_calls_messages;
    if (rec.normal_calls !== null) sumNormal += rec.normal_calls;

    const c = (rec.created_by_name || '').toLowerCase();
    const u = (rec.updated_by_name || '').toLowerCase();
    const hasShilpa = c.includes('shilpa') || u.includes('shilpa');
    const hasGokul = c.includes('gokul') || u.includes('gokul');
    let staffName = 'Shilpa & Gokul (Reception)';
    if (hasShilpa && hasGokul) staffName = 'Shilpa & Gokul (Handover)';
    else if (hasShilpa) staffName = 'Shilpa (Reception)';
    else if (hasGokul) staffName = 'Gokul (Reception)';

    return [
      rec.report_date,
      staffName,
      rec.total_enquiries !== null ? String(rec.total_enquiries) : '-',
      rec.total_responses !== null ? String(rec.total_responses) : '-',
      rec.total_confirmations !== null ? String(rec.total_confirmations) : '-',
      rec.total_bookings !== null ? String(rec.total_bookings) : '-',
      rec.tomorrow_bookings !== null ? String(rec.tomorrow_bookings) : '-',
      rec.whatsapp_calls_messages !== null ? String(rec.whatsapp_calls_messages) : '-',
      rec.normal_calls !== null ? String(rec.normal_calls) : '-',
    ];
  });

  // Append Combined Totals row (Both Shilpa & Gokul)
  tableBody.push([
    'COMBINED TOTAL (Shilpa & Gokul)',
    'Both Included',
    String(sumEnquiries),
    String(sumResponses),
    String(sumConfirmations),
    String(sumBookings),
    String(sumTomorrow),
    String(sumWhatsApp),
    String(sumNormal),
  ]);

  // 5. Render Fitted Table
  autoTable(doc, {
    startY: 40,
    head: [[
      'Date (YYYY-MM-DD)',
      'Receptionist / Shift',
      'Total no. of Enquiries',
      'Total no. of Responses',
      'Total no. of Confirmations',
      'Total no. of Bookings',
      'Total no. of Bookings (Tomorrow)',
      'No. of WhatsApp Calls/Msgs',
      'No. of Normal Calls',
    ]],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [229, 229, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [16, 59, 55], // #103B37 Dark Forest Green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'left', cellWidth: 36 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 32 },
      5: { halign: 'right', cellWidth: 30 },
      6: { halign: 'right', cellWidth: 36 },
      7: { halign: 'right', cellWidth: 32 },
      8: { halign: 'right', cellWidth: 26 },
    },
    didParseCell: (data) => {
      // Highlight the last totals row
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [234, 243, 241]; // Light teal tint
        data.cell.styles.textColor = [16, 59, 55];
      }
    },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
  });

  // 6. Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'CONFIDENTIAL - For internal operational use at Ayuryoga International only.',
      14,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // 7. Save file
  doc.save(fileName || `AyurDesk_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

