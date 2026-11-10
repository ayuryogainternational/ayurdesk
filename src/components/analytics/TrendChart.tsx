// ====================================================================
// AyurDesk - Trend Chart Component (Recharts)
// Enquiries vs Responses Trend
// ====================================================================

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DailyReport } from '../../types';

interface TrendChartProps {
  data: DailyReport[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  // Sort ascending for time series visualization
  const sortedData = [...data]
    .sort((a, b) => a.report_date.localeCompare(b.report_date))
    .map((r) => ({
      date: r.report_date.slice(5), // MM-DD
      fullDate: r.report_date,
      enquiries: r.total_enquiries ?? 0,
      responses: r.total_responses ?? 0,
    }));

  if (sortedData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
        No trend data available for current period.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#103B37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#103B37" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#23675B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#23675B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="enquiries"
            name="Enquiries"
            stroke="#103B37"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEnquiries)"
          />
          <Area
            type="monotone"
            dataKey="responses"
            name="Responses"
            stroke="#23675B"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorResponses)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

