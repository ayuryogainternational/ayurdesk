// ====================================================================
// AyurDesk - Analytics Deep Dive Script
// ====================================================================

let trendChart = null;
let channelChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('analytics');

  const reports = await window.dataStore.getReports();
  renderAnalytics(reports);
});

function renderAnalytics(reports) {
  // 1. Funnel Metrics
  const summary = window.dataStore.calculateKpiSummary(reports);
  document.getElementById('funnel-enquiries').textContent = summary.totalEnquiries.toLocaleString();
  document.getElementById('funnel-responses').textContent = summary.totalResponses.toLocaleString();
  document.getElementById('funnel-response-rate').textContent = `${summary.responseRate}% Response Rate`;

  document.getElementById('funnel-bookings').textContent = summary.totalBookings.toLocaleString();
  document.getElementById('funnel-booking-rate').textContent = `${summary.bookingConversionRate}% Intake Conversion`;

  document.getElementById('funnel-confirmations').textContent = summary.totalConfirmations.toLocaleString();
  document.getElementById('funnel-confirm-rate').textContent = `${summary.confirmationRate}% of Bookings`;

  // 2. Trend Area Chart
  renderAnalyticsTrend(reports);

  // 3. Channel Grouped Bar Chart
  renderAnalyticsChannels(reports);

  // 4. Day of Week Breakdown
  renderDayOfWeek(reports);
}

function renderAnalyticsTrend(reports) {
  const ctx = document.getElementById('analyticsTrendChart');
  if (!ctx) return;

  const chron = [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date));
  const labels = chron.map((r) => window.formatDateDisplay(r.report_date));
  const inquiries = chron.map((r) => r.total_enquiries || 0);
  const bookings = chron.map((r) => r.total_bookings || 0);

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Inbound Inquiries',
          data: inquiries,
          borderColor: '#103B37',
          backgroundColor: 'rgba(16, 59, 55, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Completed Bookings',
          data: bookings,
          borderColor: '#23675B',
          backgroundColor: 'rgba(35, 103, 91, 0.2)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function renderAnalyticsChannels(reports) {
  const ctx = document.getElementById('analyticsChannelChart');
  if (!ctx) return;

  const chron = [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date));
  const labels = chron.map((r) => window.formatDateDisplay(r.report_date));
  const waData = chron.map((r) => r.whatsapp_calls_messages || 0);
  const callData = chron.map((r) => r.normal_calls || 0);

  if (channelChart) channelChart.destroy();

  channelChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'WhatsApp Volume',
          data: waData,
          backgroundColor: '#23675B',
          borderRadius: 4,
        },
        {
          label: 'Normal Phone Calls',
          data: callData,
          backgroundColor: '#d97706',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function renderDayOfWeek(reports) {
  const tbody = document.getElementById('day-of-week-body');
  if (!tbody) return;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const buckets = days.map((day) => ({
    name: day,
    inquiries: 0,
    bookings: 0,
    count: 0,
  }));

  reports.forEach((r) => {
    const parts = r.report_date.split('-').map(Number);
    if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      const dayIndex = d.getUTCDay();
      if (buckets[dayIndex]) {
        buckets[dayIndex].count++;
        if (r.total_enquiries) buckets[dayIndex].inquiries += r.total_enquiries;
        if (r.total_bookings) buckets[dayIndex].bookings += r.total_bookings;
      }
    }
  });

  tbody.innerHTML = buckets
    .map((b) => {
      const avgInq = b.count > 0 ? (b.inquiries / b.count).toFixed(1) : '0.0';
      const avgBook = b.count > 0 ? (b.bookings / b.count).toFixed(1) : '0.0';
      const conv = b.inquiries > 0 ? Math.round((b.bookings / b.inquiries) * 100) + '%' : '-';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--forest-900);">${b.name}</td>
          <td class="numeric">${b.count}</td>
          <td class="numeric">${avgInq}</td>
          <td class="numeric">${avgBook}</td>
          <td class="numeric"><span class="badge badge-forest">${conv}</span></td>
        </tr>
      `;
    })
    .join('');
}

