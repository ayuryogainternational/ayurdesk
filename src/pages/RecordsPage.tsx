// ====================================================================
// AyurDesk - All Records Page
// Organization: Ayuryoga International
// ====================================================================

import React from 'react';
import { useDailyReports } from '../hooks/useDailyReports';
import { useAuth } from '../context/AuthContext';
import { RecordsTable } from '../components/reports/RecordsTable';
import { AnomalyAlert } from '../components/reports/AnomalyAlert';
import { Button } from '../components/common/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';

export const RecordsPage: React.FC = () => {
  const { reports, loading, updateReport, deleteReport } = useDailyReports();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const hasAnomaly = reports.some((r) => r.report_date === '2027-10-26');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest-900">
            Daily Operational Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full ledger of daily enquiries, responses, bookings, and communication metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/daily-entry">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Daily Record
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/reports">
              <Button variant="secondary" size="md">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Export Reports
              </Button>
            </Link>
          )}
        </div>
      </div>

      <AnomalyAlert hasAnomalyRecord={hasAnomaly} />

      <RecordsTable
        records={reports}
        loading={loading}
        onUpdate={updateReport}
        onDelete={isAdmin ? deleteReport : undefined}
      />
    </div>
  );
};

