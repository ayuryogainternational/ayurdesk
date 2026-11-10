// ====================================================================
// AyurDesk - Record Edit Modal
// Fully audited via PostgreSQL triggers
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { DailyReport, DailyReportFormData } from '../../types';
import { validateDailyReportForm } from '../../lib/validation';
import { isDateAnomaly } from '../../lib/validation';
import { AlertTriangle, History } from 'lucide-react';

interface RecordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport | null;
  onUpdate: (id: string, updates: Partial<DailyReport>) => Promise<DailyReport | void>;
}

export const RecordEditModal: React.FC<RecordEditModalProps> = ({
  isOpen,
  onClose,
  report,
  onUpdate,
}) => {
  const { success, error } = useToast();

  const [formData, setFormData] = useState<DailyReportFormData>({
    report_date: '',
    total_enquiries: '',
    total_responses: '',
    total_confirmations: '',
    total_bookings: '',
    tomorrow_bookings: '',
    whatsapp_calls_messages: '',
    normal_calls: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (report) {
      setFormData({
        report_date: report.report_date || '',
        total_enquiries: report.total_enquiries !== null ? String(report.total_enquiries) : '',
        total_responses: report.total_responses !== null ? String(report.total_responses) : '',
        total_confirmations: report.total_confirmations !== null ? String(report.total_confirmations) : '',
        total_bookings: report.total_bookings !== null ? String(report.total_bookings) : '',
        tomorrow_bookings: report.tomorrow_bookings !== null ? String(report.tomorrow_bookings) : '',
        whatsapp_calls_messages: report.whatsapp_calls_messages !== null ? String(report.whatsapp_calls_messages) : '',
        normal_calls: report.normal_calls !== null ? String(report.normal_calls) : '',
      });
      setValidationErrors({});
    }
  }, [report]);

  const handleChange = (field: keyof DailyReportFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    const result = validateDailyReportForm(formData);
    if (!result.isValid) {
      setValidationErrors(result.errors);
      error('Validation Failed', 'Please fix the errors below.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(report.id, result.parsedValues);
      success('Record Updated', `Operational log for ${result.parsedValues.report_date} updated.`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      error('Update Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) return null;

  const isAnomaly = isDateAnomaly(formData.report_date);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Operations Log: ${report.report_date}`}
      subtitle="Changes will be recorded in the system audit history with your identity"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {isAnomaly && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Audit Notice:</strong> This record carries date{' '}
              <code>{formData.report_date}</code> (flagged for verification). You may adjust the date
              or operational figures; all adjustments will generate an immutable audit log entry.
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-warm-100/60 p-2.5 rounded-lg border border-[#E5E5DC]">
          <History className="w-4 h-4 text-forest-600" />
          <span>Audit trail is active. Every edit records before/after values and actor details.</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Report Date (YYYY-MM-DD)
          </label>
          <input
            type="date"
            required
            value={formData.report_date}
            onChange={(e) => handleChange('report_date', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Enquiries
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.total_enquiries}
              onChange={(e) => handleChange('total_enquiries', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Responses
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.total_responses}
              onChange={(e) => handleChange('total_responses', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Confirmations
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.total_confirmations}
              onChange={(e) => handleChange('total_confirmations', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Bookings
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.total_bookings}
              onChange={(e) => handleChange('total_bookings', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bookings (Tomorrow)
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.tomorrow_bookings}
              onChange={(e) => handleChange('tomorrow_bookings', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Calls/Msgs
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.whatsapp_calls_messages}
              onChange={(e) => handleChange('whatsapp_calls_messages', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Normal Calls
            </label>
            <input
              type="number"
              min="0"
              placeholder="NULL (blank)"
              value={formData.normal_calls}
              onChange={(e) => handleChange('normal_calls', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5DC] flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Changes (Audited)
          </Button>
        </div>
      </form>
    </Modal>
  );
};
