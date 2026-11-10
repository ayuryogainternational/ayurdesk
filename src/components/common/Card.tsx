// ====================================================================
// AyurDesk - Card Component
// ====================================================================

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
}) => {
  return (
    <div className={`bg-white border border-[#E5E5DC] rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            headerBorder ? 'border-b border-[#E5E5DC]' : ''
          }`}
        >
          <div>
            {title && <h3 className="text-base font-semibold text-forest-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

