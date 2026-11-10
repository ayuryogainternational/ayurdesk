// ====================================================================
// AyurDesk - Badge Component
// ====================================================================

import React, { ReactNode } from 'react';

export type BadgeVariant = 'forest' | 'teal' | 'amber' | 'emerald' | 'rose' | 'slate';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  className = '',
}) => {
  const variantStyles = {
    forest: 'bg-forest-100 text-forest-900 border-forest-300',
    teal: 'bg-teal-50 text-forest-700 border-forest-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    rose: 'bg-rose-50 text-rose-800 border-rose-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

