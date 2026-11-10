// ====================================================================
// AyurDesk - Daily Entry Page
// Available to Staff and Admin
// ====================================================================

import React from 'react';
import { DailyEntryForm } from '../components/reports/DailyEntryForm';
import { useDailyReports } from '../hooks/useDailyReports';
import { useNavigate } from 'react-router-dom';

export const DailyEntryPage: React.FC = () => {
  const { saveReport } = useDailyReports();
  const navigate = useNavigate();

  const handleSaved = () => {
    // Navigate back to records or keep on page for next entry
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-forest-900">
          Record Daily Operations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit official operational statistics for Ayuryoga International
        </p>
      </div>

      <DailyEntryForm onSave={saveReport} onSuccess={handleSaved} />
    </div>
  );
};

