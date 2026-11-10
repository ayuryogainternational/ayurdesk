// ====================================================================
// AyurDesk - KPI Metric Card
// Palette: Forest Green (#103B37), Teal (#23675B)
// ====================================================================

import React, { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  accent?: 'forest' | 'teal' | 'emerald' | 'amber';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = 'forest',
}) => {
  const accentStyles = {
    forest: 'bg-forest-900 text-white',
    teal: 'bg-forest-600 text-white',
    emerald: 'bg-emerald-700 text-white',
    amber: 'bg-amber-600 text-white',
  };

  return (
    <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${accentStyles[accent]} shadow-inner`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            {subtitle && <span>{subtitle}</span>}
            {trend && <span className="font-medium text-forest-700">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

