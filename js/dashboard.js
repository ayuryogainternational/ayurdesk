// ====================================================================
// AyurDesk - Operations Dashboard Script
// ====================================================================

let trendChartInstance = null;
let channelChartInstance = null;
let allReports = [];
let currentPeriod = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.authManager.requireAuth()) return;

  window.initAppLayout('dashboard');

  const isAdmin = window.authManager.isAdmin();
  const exportBtn = document.getElementById('dashboard-export-btn');
  if (exportBtn && isAdmin) {
    exportBtn.style.display = 'inline-flex';
  }

  // Setup period tabs
  const tabs = document.querySelectorAll('#period-tabs .filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentPeriod = tab.getAttribute('data-period');
      renderDashboard();
    });
  });

  // Setup anomaly fix button
  const fixAnomalyBtn = document.getElementById('btn-fix-anomaly');
  if (fixAnomalyBtn) {
    fixAnomalyBtn.addEventListener('click', async () => {
      fixAnomalyBtn.disabled = true;
      fixAnomalyBtn.textContent = 'Resolving...';
      const ok = await window.dataStore.resolveAnomaly('2026-10-26');
      if (ok) {
        window.showToast('Anomaly Resolved', 'Date corrected to 2026-10-26 and logged in audit ledger.', 'success');
        await loadData();
      } else {
        window.showToast('Resolution Notice', 'Anomaly record not found or already fixed.', 'info');
      }
      fixAnomalyBtn.disabled = false;
      fixAnomalyBtn.textContent = 'Resolve to 2026-10-26';
    });
  }

  await loadData();
});

async function loadData() {
  allReports = await window.dataStore.getReports();
  renderDashboard();
}

function renderDashboard() {
  let filtered = [...allReports];
  if (currentPeriod === '7d') {
    filtered = filtered.slice(0, 7);
  } else if (currentPeriod === '30d') {
    filtered = filtered.slice(0, 30);
  }

  // 1. Check Anomaly Banner
  const hasAnomaly = allReports.some((r) => r.report_date === '2027-10-26');
  const banner = document.getElementById('anomaly-banner');
  if (banner) {
    banner.style.display = hasAnomaly ? 'flex' : 'none';
  }

  // 2. Compute KPIs
  const summary = window.dataStore.calculateKpiSummary(filtered);

  document.getElementById('kpi-enquiries').textContent = summary.totalEnquiries.toLocaleString();
  document.getElementById('kpi-avg-enquiries').textContent = summary.avgEnquiriesPerDay;

  document.getElementById('kpi-responses').textContent = summary.totalResponses.toLocaleString();
  document.getElementById('kpi-response-rate').textContent = `${summary.responseRate}%`;

  document.getElementById('kpi-bookings').textContent = summary.totalBookings.toLocaleString();
  document.getElementById('kpi-booking-rate').textContent = `${summary.bookingConversionRate}%`;

  document.getElementById('kpi-confirmations').textContent = summary.totalConfirmations.toLocaleString();
  document.getElementById('kpi-confirm-rate').textContent = `${summary.confirmationRate}%`;

  document.getElementById('kpi-tomorrow').textContent = summary.tomorrowBookings.toLocaleString();

  const totalComms = summary.totalWhatsApp + summary.totalNormalCalls;
  document.getElementById('kpi-comms').textContent = totalComms.toLocaleString();
  document.getElementById('kpi-wa-ratio').textContent = summary.totalWhatsApp.toLocaleString();
  document.getElementById('kpi-call-ratio').textContent = summary.totalNormalCalls.toLocaleString();

  // 3. Render Trend Chart
  renderTrendChart(filtered);

  // 4. Render Channel Chart
  renderChannelChart(summary);

  // 5. Render Recent Records Table
  renderRecentTable(filtered.slice(0, 7));
}

function renderTrendChart(reports) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  // Chronological order for chart
  const chron = [...reports].sort((a, b) => a.report_date.localeCompare(b.report_date));
  const labels = chron.map((r) => window.formatDateDisplay(r.report_date));
  const enquiries = chron.map((r) => r.total_enquiries || 0);
  const responses = chron.map((r) => r.total_responses || 0);
  const bookings = chron.map((r) => r.total_bookings || 0);

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Inquiries',
          data: enquiries,
          borderColor: '#103B37',
          backgroundColor: 'rgba(16, 59, 55, 0.08)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Responses',
          data: responses,
          borderColor: '#23675B',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 2,
        },
        {
          label: 'Bookings',
          data: bookings,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.15)',
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
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
          },
        },
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, maxRotation: 45 },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { size: 10 } },
        },
      },
    },
  });
}

function renderChannelChart(summary) {
  const ctx = document.getElementById('channelChart');
  if (!ctx) return;

  if (channelChartInstance) {
    channelChartInstance.destroy();
  }

  channelChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['WhatsApp (Messages/Calls)', 'Normal Phone Calls'],
      datasets: [
        {
          data: [summary.totalWhatsApp, summary.totalNormalCalls],
          backgroundColor: ['#23675B', '#d97706'],
          hoverBackgroundColor: ['#103B37', '#b45309'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          },
        },
      },
      cutout: '68%',
    },
  });
}

function renderRecentTable(records) {
  const tbody = document.getElementById('recent-records-body');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-400);">No records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = records
    .map((r) => {
      const isAnomaly = r.report_date === '2027-10-26';
      const turnaround =
        r.total_enquiries && r.total_responses
          ? Math.min(100, Math.round((r.total_responses / r.total_enquiries) * 100)) + '%'
          : '-';

      const conversion =
        r.total_enquiries && r.total_bookings
          ? Math.round((r.total_bookings / r.total_enquiries) * 100) + '%'
          : '-';

      return `
        <tr class="${isAnomaly ? 'anomaly-row' : ''}">
          <td>
            <div style="font-weight: 600; color: var(--forest-900); display: flex; align-items: center; gap: 0.5rem;">
              <span>${window.formatDateDisplay(r.report_date)}</span>
              ${isAnomaly ? '<span class="badge badge-warning" style="font-size: 0.6rem;">Anomaly</span>' : ''}
            </div>
            <div style="font-size: 0.6875rem; color: var(--slate-400);">${r.report_date}</div>
          </td>
          <td class="numeric">${r.total_enquiries ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.total_responses ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric"><span class="badge ${turnaround === '100%' ? 'badge-success' : 'badge-neutral'}">${turnaround}</span></td>
          <td class="numeric" style="font-weight: 700; color: var(--forest-900);">${r.total_bookings ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric"><span class="badge badge-forest">${conversion}</span></td>
          <td class="numeric">${r.whatsapp_calls_messages ?? '<span class="empty-cell">-</span>'}</td>
          <td class="numeric">${r.normal_calls ?? '<span class="empty-cell">-</span>'}</td>
        </tr>
      `;
    })
    .join('');
}
