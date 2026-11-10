// ====================================================================
// AyurDesk - Operations Dashboard
// Role-aware: Staff & Admin views, KPI Cards, Filters & Anomaly Alerts
// ====================================================================

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDailyReports } from '../hooks/useDailyReports';
import { KpiCard } from '../components/analytics/KpiCard';
import { TrendChart } from '../components/analytics/TrendChart';
import { ComparisonChart } from '../components/analytics/ComparisonChart';
import { ConversionFunnel } from '../components/analytics/ConversionFunnel';
import { RecordsTable } from '../components/reports/RecordsTable';
import { AnomalyAlert } from '../components/reports/AnomalyAlert';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle,
  BookmarkCheck,
  CalendarCheck,
  PhoneCall,
  PlusCircle,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const { reports, loading, updateReport, deleteReport } = useDailyReports();

  // Period Filter: 'all' | '30d' | '7d'
  const [periodFilter, setPeriodFilter] = useState<'all' | '30d' | '7d'>('all');

  const filteredReports = useMemo(() => {
    if (periodFilter === 'all') return reports;

    // Filter using reports date
    const count = periodFilter === '7d' ? 7 : 30;
    return reports.slice(0, count);
  }, [reports, periodFilter]);

  // Aggregate KPI Calculations
  const kpis = useMemo(() => {
    let enquiries = 0;
    let responses = 0;
    let confirmations = 0;
    let bookings = 0;
    let tomorrow = 0;
    let whatsapp = 0;
    let normal = 0;

    filteredReports.forEach((r) => {
      if (r.total_enquiries !== null) enquiries += r.total_enquiries;
      if (r.total_responses !== null) responses += r.total_responses;
      if (r.total_confirmations !== null) confirmations += r.total_confirmations;
      if (r.total_bookings !== null) bookings += r.total_bookings;
      if (r.tomorrow_bookings !== null) tomorrow += r.tomorrow_bookings;
      if (r.whatsapp_calls_messages !== null) whatsapp += r.whatsapp_calls_messages;
      if (r.normal_calls !== null) normal += r.normal_calls;
    });

    return {
      enquiries,
      responses,
      confirmations,
      bookings,
      tomorrow,
      whatsapp,
      normal,
      count: filteredReports.length,
    };
  }, [filteredReports]);

  // Check if anomaly record is present in dataset
  const hasAnomaly = reports.some((r) => r.report_date === '2027-10-26');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest-900">
            Operations Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily operations intelligence for Ayuryoga International
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="bg-white border border-[#E5E5DC] rounded-xl p-1 flex items-center gap-1 shadow-sm text-xs">
            <button
              onClick={() => setPeriodFilter('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodFilter === '7d'
                  ? 'bg-forest-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriodFilter('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodFilter === '30d'
                  ? 'bg-forest-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                periodFilter === 'all'
                  ? 'bg-forest-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time ({reports.length})
            </button>
          </div>

          <Link to="/daily-entry">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Daily Entry
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/reports">
              <Button variant="secondary" size="md">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Reports Export
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Anomaly Notice for 2027-10-26 Record */}
      <AnomalyAlert hasAnomalyRecord={hasAnomaly} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Total Enquiries */}
        <KpiCard
          title="Enquiries"
          value={kpis.enquiries}
          icon={<HelpCircle className="w-4 h-4" />}
          subtitle={`${kpis.count} days`}
          accent="forest"
        />

        {/* 2. Total Responses */}
        <KpiCard
          title="Responses"
          value={kpis.responses}
          icon={<MessageSquare className="w-4 h-4" />}
          subtitle={`${kpis.enquiries ? ((kpis.responses / kpis.enquiries) * 100).toFixed(0) : 0}% rate`}
          accent="teal"
        />

        {/* 3. Confirmations */}
        <KpiCard
          title="Confirmations"
          value={kpis.confirmations}
          icon={<CheckCircle className="w-4 h-4" />}
          subtitle="Confirmed"
          accent="emerald"
        />

        {/* 4. Bookings */}
        <KpiCard
          title="Bookings"
          value={kpis.bookings}
          icon={<BookmarkCheck className="w-4 h-4" />}
          subtitle="Booked"
          accent="forest"
        />

        {/* 5. Bookings Tomorrow */}
        <KpiCard
          title="Tomorrow"
          value={kpis.tomorrow}
          icon={<CalendarCheck className="w-4 h-4" />}
          subtitle="Next day load"
          accent="teal"
        />

        {/* 6. WhatsApp Messages */}
        <KpiCard
          title="WhatsApp"
          value={kpis.whatsapp}
          icon={<MessageSquare className="w-4 h-4" />}
          subtitle="Inbound msgs"
          accent="emerald"
        />

        {/* 7. Normal Calls */}
        <KpiCard
          title="Normal Calls"
          value={kpis.normal}
          icon={<PhoneCall className="w-4 h-4" />}
          subtitle="Direct phone"
          accent="forest"
        />
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries vs Responses Trend */}
        <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-forest-900">Enquiries vs. Responses Trend</h3>
              <p className="text-xs text-slate-500">Inbound volume vs operational turnaround</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-50 text-forest-700">
              Daily Sequence
            </span>
          </div>
          <TrendChart data={filteredReports} />
        </div>

        {/* Bookings vs Tomorrow Bookings */}
        <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-forest-900">Booking Pipeline Volume</h3>
              <p className="text-xs text-slate-500">Daily bookings compared to next-day commitments</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-forest-700">
              Capacity Tracking
            </span>
          </div>
          <ComparisonChart data={filteredReports} type="bookings" />
        </div>
      </div>

      {/* Conversion Funnel & Channel Breakdown */}
      <ConversionFunnel records={filteredReports} />

      {/* Operational Records Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-forest-900">Daily Operations Log</h3>
            <p className="text-xs text-slate-500">
              Audit-tracked historical records for Ayuryoga International
            </p>
          </div>
          <Link
            to="/records"
            className="text-xs text-forest-700 hover:text-forest-900 font-semibold"
          >
            View Full Records &rarr;
          </Link>
        </div>

        <RecordsTable
          records={filteredReports}
          loading={loading}
          onUpdate={updateReport}
          onDelete={isAdmin ? deleteReport : undefined}
        />
      </div>
    </div>
  );
};

