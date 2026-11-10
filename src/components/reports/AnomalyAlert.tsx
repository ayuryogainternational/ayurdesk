// ====================================================================
// AyurDesk - Anomaly & Audit Discrepancy Verification Alert
// Organization: Ayuryoga International
// ====================================================================

import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnomalyAlertProps {
  hasAnomalyRecord?: boolean;
  onReviewClick?: () => void;
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  hasAnomalyRecord = true,
  onReviewClick,
}) => {
  if (!hasAnomalyRecord) return null;

  return (
    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-950">
                Audit Notice: Date Verification Required
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900 uppercase tracking-wide">
                Preserved As-Is
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 max-w-2xl leading-relaxed">
              Historical record for date <code className="px-1.5 py-0.5 rounded bg-amber-200/60 font-mono font-semibold">2027-10-26</code> appears 
              out of sequence with surrounding October–November 2026 operational logs. Per compliance 
              rules, this record has been preserved without silent modification.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 self-end sm:self-center">
          {onReviewClick ? (
            <button
              onClick={onReviewClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify / Edit Record</span>
            </button>
          ) : (
            <Link
              to="/records?search=2027-10-26"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition shadow-sm"
            >
              <span>Inspect in Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

