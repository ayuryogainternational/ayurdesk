// ====================================================================
// AyurDesk - Comparison Bar Chart (Recharts)
// Bookings vs Tomorrow & Channels (WhatsApp vs Normal Calls)
// ====================================================================

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DailyReport } from '../../types';

interface ComparisonChartProps {
  data: DailyReport[];
  type?: 'bookings' | 'calls';
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  type = 'bookings',
}) => {
  const sortedData = [...data]
    .sort((a, b) => a.report_date.localeCompare(b.report_date))
    .slice(-10) // Show last 10 records for readability in bar charts
    .map((r) => ({
      date: r.report_date.slice(5),
      fullDate: r.report_date,
      bookings: r.total_bookings ?? 0,
      tomorrow: r.tomorrow_bookings ?? 0,
      whatsapp: r.whatsapp_calls_messages ?? 0,
      normal: r.normal_calls ?? 0,
    }));

  if (sortedData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
        No comparative data available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5DC" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E5DC' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E5DC' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E5DC',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
            }}
            labelFormatter={(_, payload) => {
              if (payload && payload.length > 0) {
                return `Date: ${payload[0].payload.fullDate}`;
              }
              return '';
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />

          {type === 'bookings' ? (
            <>
              <Bar dataKey="bookings" name="Confirmed Bookings" fill="#103B37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tomorrow" name="Tomorrow Bookings" fill="#44847a" radius={[4, 4, 0, 0]} />
            </>
          ) : (
            <>
              <Bar dataKey="whatsapp" name="WhatsApp Messages" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="normal" name="Normal Calls" fill="#23675B" radius={[4, 4, 0, 0]} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

