// ====================================================================
// AyurDesk - Audit Trail & System Ledger
// Administrator Only: Chronological change log
// ====================================================================

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';
import { formatDateTimeMauritius } from '../lib/timezone';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { History, Eye, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLogs([
        {
          id: 'log-1',
          table_name: 'daily_reports',
          record_id: 'seed-2',
          action: 'INSERT',
          old_data: null,
          new_data: { report_date: '2027-10-26', total_enquiries: 31, total_bookings: 7 },
          changed_fields: { event: 'created', note: 'Flagged for verification' },
          performed_by: 'system',
          performed_by_name: 'Database Migration Runner',
          performed_by_role: 'system',
          performed_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[AyurDesk] Error fetching audit logs:', error.message);
      } else {
        setLogs((data as AuditLog[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Badge variant="emerald">INSERT</Badge>;
      case 'UPDATE':
        return <Badge variant="teal">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="rose">DELETE</Badge>;
      default:
        return <Badge variant="slate">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-forest-900">
              Audit Trail & Operational History
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest-100 text-forest-800 border border-forest-300">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable database ledger recording every creation, update, and modification to operational logs
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh Ledger
        </Button>
      </div>

      <Card
        title="Chronological Audit Records"
        subtitle="Timestamps rendered in Indian Ocean / Mauritius standard (UTC+04:00)"
      >
        <div className="overflow-x-auto border border-[#E5E5DC] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-forest-900 text-white font-semibold">
                <th className="py-3 px-4">Timestamp (Mauritius Time)</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading audit ledger from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records recorded yet. Any edit to daily reports will appear here automatically.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {formatDateTimeMauritius(log.performed_at)}
                    </td>
                    <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.performed_by_name || 'System / Service'}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-600">
                      {log.performed_by_role || 'system'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.table_name} ({log.record_id.slice(0, 8)}...)
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-forest-900 hover:bg-forest-100 transition"
                        title="View payload changes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Entry Inspector"
        subtitle={`Action: ${selectedLog?.action} on ${selectedLog?.table_name}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-warm-100 p-3 rounded-xl border border-[#E5E5DC]">
              <div>
                <span className="text-slate-500 block">Actor:</span>
                <span className="font-semibold text-slate-900">
                  {selectedLog.performed_by_name} ({selectedLog.performed_by_role})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Mauritius Timestamp:</span>
                <span className="font-mono text-slate-800">
                  {formatDateTimeMauritius(selectedLog.performed_at)}
                </span>
              </div>
            </div>

            {selectedLog.changed_fields && (
              <div>
                <h5 className="font-bold text-slate-800 mb-1">Detected Field Changes:</h5>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLog.changed_fields, null, 2)}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-slate-800 mb-1">Before State (Old):</h5>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-700 max-h-48">
                  {selectedLog.old_data
                    ? JSON.stringify(selectedLog.old_data, null, 2)
                    : '(None / Initial Insert)'}
                </pre>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-1">After State (New):</h5>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-700 max-h-48">
                  {selectedLog.new_data
                    ? JSON.stringify(selectedLog.new_data, null, 2)
                    : '(None / Deleted)'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

