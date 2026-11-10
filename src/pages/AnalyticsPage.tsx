// ====================================================================
// AyurDesk - Analytics Deep Dive
// Recharts visualizations and business insights
// ====================================================================

import React, { useMemo, useState } from 'react';
import { useDailyReports } from '../hooks/useDailyReports';
import { TrendChart } from '../components/analytics/TrendChart';
import { ComparisonChart } from '../components/analytics/ComparisonChart';
import { ConversionFunnel } from '../components/analytics/ConversionFunnel';
import { Card } from '../components/common/Card';

export const AnalyticsPage: React.FC = () => {
  const { reports, loading } = useDailyReports();
  const [metricTab, setMetricTab] = useState<'trends' | 'channels'>('trends');

  // Day-of-week breakdown
  const dayOfWeekStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: Record<string, { enquiries: number; bookings: number; count: number }> = {
      Sun: { enquiries: 0, bookings: 0, count: 0 },
      Mon: { enquiries: 0, bookings: 0, count: 0 },
      Tue: { enquiries: 0, bookings: 0, count: 0 },
      Wed: { enquiries: 0, bookings: 0, count: 0 },
      Thu: { enquiries: 0, bookings: 0, count: 0 },
      Fri: { enquiries: 0, bookings: 0, count: 0 },
      Sat: { enquiries: 0, bookings: 0, count: 0 },
    };

    reports.forEach((r) => {
      // Avoid date anomaly 2027 from skewing day of week if needed or parse cleanly
      const [year, month, day] = r.report_date.split('-').map(Number);
      if (year && month && day) {
        const d = new Date(Date.UTC(year, month - 1, day));
        const dayName = days[d.getUTCDay()];
        if (buckets[dayName]) {
          buckets[dayName].count += 1;
          if (r.total_enquiries) buckets[dayName].enquiries += r.total_enquiries;
          if (r.total_bookings) buckets[dayName].bookings += r.total_bookings;
        }
      }
    });

    return Object.entries(buckets).map(([day, val]) => ({
      day,
      avgEnquiries: val.count > 0 ? (val.enquiries / val.count).toFixed(1) : '0',
      avgBookings: val.count > 0 ? (val.bookings / val.count).toFixed(1) : '0',
      totalDays: val.count,
    }));
  }, [reports]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-forest-900">
          Analytics & Performance Insights
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed metrics, conversion trends, and channel efficiency for Ayuryoga International
        </p>
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnel records={reports} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Turnaround Dynamics: Enquiries vs. Responses"
          subtitle="Evaluates operational responsiveness against incoming interest"
        >
          <TrendChart data={reports} />
        </Card>

        <Card
          title="Communications Channel Comparison"
          subtitle="WhatsApp calls/messages compared against standard direct telephony"
        >
          <ComparisonChart data={reports} type="calls" />
        </Card>
      </div>

      {/* Day of Week Analysis Table */}
      <Card
        title="Weekly Rhythm & Demand Patterns"
        subtitle="Average operational load distributed across days of the week"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Day of Week</th>
                <th className="py-2.5 px-3 text-right">Operational Days Logged</th>
                <th className="py-2.5 px-3 text-right">Avg. Enquiries</th>
                <th className="py-2.5 px-3 text-right">Avg. Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dayOfWeekStats.map((stat) => (
                <tr key={stat.day} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{stat.day}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {stat.totalDays}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-forest-900">
                    {stat.avgEnquiries}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-forest-700">
                    {stat.avgBookings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

