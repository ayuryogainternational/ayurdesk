// ====================================================================
// AyurDesk - Records Table Component
// Search, Date Filtering, Audit Editing & Verification Badges
// ====================================================================

import React, { useState, useMemo } from 'react';
import { DailyReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RecordEditModal } from './RecordEditModal';
import { isDateAnomaly, getAnomalyReason, canEditDailyReport } from '../../lib/validation';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

interface RecordsTableProps {
  records: DailyReport[];
  loading?: boolean;
  onUpdate: (id: string, updates: Partial<DailyReport>) => Promise<DailyReport | void>;
  onDelete?: (id: string) => Promise<void>;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  loading = false,
  onUpdate,
  onDelete,
}) => {
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortAsc, setSortAsc] = useState(false); // Default descending

  // Edit modal state
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);

  // Delete dialog state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Date range filter
        if (filterStartDate && rec.report_date < filterStartDate) return false;
        if (filterEndDate && rec.report_date > filterEndDate) return false;

        // Search term (matches date or numbers)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const dateMatch = rec.report_date.includes(term);
          const fieldsMatch = [
            rec.total_enquiries,
            rec.total_responses,
            rec.total_confirmations,
            rec.total_bookings,
            rec.tomorrow_bookings,
            rec.whatsapp_calls_messages,
            rec.normal_calls,
          ].some((val) => val !== null && String(val).includes(term));

          if (!dateMatch && !fieldsMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortAsc) {
          return a.report_date.localeCompare(b.report_date);
        } else {
          return b.report_date.localeCompare(a.report_date);
        }
      });
  }, [records, searchTerm, filterStartDate, filterEndDate, sortAsc]);

  const handleConfirmDelete = async () => {
    if (!deletingId || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD) or metric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Date Filter & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Range:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          {(searchTerm || filterStartDate || filterEndDate) && (
            <button
              onClick={clearFilters}
              className="text-xs text-forest-700 hover:text-forest-900 font-semibold px-2 py-1"
            >
              Clear
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortAsc(!sortAsc)}
            className="ml-auto"
          >
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
            {sortAsc ? 'Date: Ascending' : 'Date: Descending'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-forest-900 text-white font-semibold border-b border-forest-950">
                <th className="py-3 px-4 whitespace-nowrap">Report Date</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Enquiries</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Responses</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Confirmations</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Bookings</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Tomorrow</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">WhatsApp</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Normal Calls</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading records from Supabase...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No daily reports match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const anomaly = isDateAnomaly(rec.report_date);
                  return (
                    <tr
                      key={rec.id || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        anomaly ? 'bg-amber-50/50' : idx % 2 === 1 ? 'bg-warm-100/30' : 'bg-white'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800">
                            {rec.report_date}
                          </span>
                          {anomaly && (
                            <span
                              title={getAnomalyReason(rec.report_date)}
                              className="cursor-help"
                            >
                              <Badge variant="amber" className="text-[10px] py-0 px-1.5">
                                <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-600" />
                                Verify
                              </Badge>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 1. Enquiries */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.total_enquiries !== null ? rec.total_enquiries : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 2. Responses */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.total_responses !== null ? rec.total_responses : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 3. Confirmations */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.total_confirmations !== null ? (
                          <span className="text-emerald-700 font-semibold">
                            {rec.total_confirmations}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 4. Bookings */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.total_bookings !== null ? (
                          <span className="text-teal-dark font-semibold">
                            {rec.total_bookings}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 5. Tomorrow Bookings */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.tomorrow_bookings !== null ? (
                          rec.tomorrow_bookings
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 6. WhatsApp */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.whatsapp_calls_messages !== null ? (
                          rec.whatsapp_calls_messages
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 7. Normal Calls */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {rec.normal_calls !== null ? (
                          rec.normal_calls
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {(() => {
                            const editCheck = canEditDailyReport(rec, isAdmin ? 'admin' : 'staff');
                            if (editCheck.canEdit) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => setEditingReport(rec)}
                                  title="Edit / Overwrite Record (Audited)"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-forest-900 hover:bg-forest-100 transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              );
                            } else {
                              return (
                                <button
                                  type="button"
                                  disabled
                                  title={editCheck.reason || 'Locked: Only administrators can modify records older than 24 hours.'}
                                  className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              );
                            }
                          })()}

                          {isAdmin && onDelete && (
                            <button
                              type="button"
                              onClick={() => setDeletingId(rec.id)}
                              title="Delete Record (Admin Only)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-warm-100/60 px-4 py-3 border-t border-[#E5E5DC] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong>{' '}
            total daily reports
          </span>
          {!isAdmin && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Lock className="w-3 h-3" /> Report export and deletion reserved for administrators.
            </span>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <RecordEditModal
        isOpen={Boolean(editingReport)}
        onClose={() => setEditingReport(null)}
        report={editingReport}
        onUpdate={onUpdate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Operational Record"
        message="Are you sure you want to permanently delete this daily report? This action is restricted to administrators and will be logged in the audit ledger."
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
