// ====================================================================
// AyurDesk - Daily Operational Entry Form
// Organization: Ayuryoga International
// ====================================================================

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { validateDailyReportForm } from '../../lib/validation';
import { getTodayMauritiusDate } from '../../lib/timezone';
import { DailyReport, DailyReportFormData } from '../../types';
import {
  Calendar,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  CheckCircle,
  CalendarCheck,
  BookmarkCheck,
  Save,
  RotateCcw,
} from 'lucide-react';

interface DailyEntryFormProps {
  onSuccess?: () => void;
  onSave: (data: {
    report_date: string;
    total_enquiries: number | null;
    total_responses: number | null;
    total_confirmations: number | null;
    total_bookings: number | null;
    tomorrow_bookings: number | null;
    whatsapp_calls_messages: number | null;
    normal_calls: number | null;
  }) => Promise<DailyReport | void>;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ onSuccess, onSave }) => {
  const { success, error, warning } = useToast();

  const [formData, setFormData] = useState<DailyReportFormData>({
    report_date: getTodayMauritiusDate(),
    total_enquiries: '',
    total_responses: '',
    total_confirmations: '',
    total_bookings: '',
    tomorrow_bookings: '',
    whatsapp_calls_messages: '',
    normal_calls: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof DailyReportFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData({
      report_date: getTodayMauritiusDate(),
      total_enquiries: '',
      total_responses: '',
      total_confirmations: '',
      total_bookings: '',
      tomorrow_bookings: '',
      whatsapp_calls_messages: '',
      normal_calls: '',
    });
    setValidationErrors({});
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateDailyReportForm(formData);

    if (!result.isValid) {
      setValidationErrors(result.errors);
      error('Validation Failed', 'Please fix the errors highlighted below.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedSave = async () => {
    const result = validateDailyReportForm(formData);
    if (!result.isValid) {
      setShowConfirmModal(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(result.parsedValues);
      setShowConfirmModal(false);
      success(
        'Daily Report Saved',
        `Operational metrics for ${result.parsedValues.report_date} logged successfully.`
      );
      handleReset();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save record';
      error('Save Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card
        title="Daily Operations Entry Form"
        subtitle="Log operational metrics for Ayuryoga International. Leave unknown fields blank to store as NULL."
      >
        <form onSubmit={handleSubmitAttempt} className="space-y-6">
          {/* Date Picker (Top Highlight) */}
          <div className="bg-warm-100/70 p-4 rounded-xl border border-[#E5E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-forest-900 text-white">
                <Calendar className="w-5 h-5 text-warm-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider">
                  Report Date (Mauritius Time) *
                </label>
                <p className="text-[11px] text-slate-500">
                  Select the operational day being recorded
                </p>
              </div>
            </div>

            <div className="w-full sm:w-60">
              <input
                type="date"
                required
                value={formData.report_date}
                onChange={(e) => handleChange('report_date', e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
              {validationErrors.report_date && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {validationErrors.report_date}
                </p>
              )}
            </div>
          </div>

          {/* Operational Metrics Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Total Enquiries */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <HelpCircle className="w-3.5 h-3.5 text-forest-600" />
                <span>Total no. of Enquiries</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.total_enquiries}
                onChange={(e) => handleChange('total_enquiries', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.total_enquiries
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.total_enquiries && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.total_enquiries}
                </p>
              )}
            </div>

            {/* 2. Total Responses */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-forest-600" />
                <span>Total no. of Responses</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.total_responses}
                onChange={(e) => handleChange('total_responses', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.total_responses
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.total_responses && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.total_responses}
                </p>
              )}
            </div>

            {/* 3. Total Confirmations */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total no. of Confirmations</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.total_confirmations}
                onChange={(e) => handleChange('total_confirmations', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.total_confirmations
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.total_confirmations && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.total_confirmations}
                </p>
              )}
            </div>

            {/* 4. Total Bookings */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-brand" />
                <span>Total no. of Bookings</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.total_bookings}
                onChange={(e) => handleChange('total_bookings', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.total_bookings
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.total_bookings && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.total_bookings}
                </p>
              )}
            </div>

            {/* 5. Tomorrow Bookings */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarCheck className="w-3.5 h-3.5 text-teal-brand" />
                <span>Total no. of Bookings (Tomorrow)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.tomorrow_bookings}
                onChange={(e) => handleChange('tomorrow_bookings', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.tomorrow_bookings
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.tomorrow_bookings && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.tomorrow_bookings}
                </p>
              )}
            </div>

            {/* 6. WhatsApp Calls / Messages */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>No. of WhatsApp Calls/Messages</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.whatsapp_calls_messages}
                onChange={(e) => handleChange('whatsapp_calls_messages', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.whatsapp_calls_messages
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.whatsapp_calls_messages && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.whatsapp_calls_messages}
                </p>
              )}
            </div>

            {/* 7. Normal Calls */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <PhoneCall className="w-3.5 h-3.5 text-forest-600" />
                <span>No. of Normal Calls</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for NULL"
                value={formData.normal_calls}
                onChange={(e) => handleChange('normal_calls', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.normal_calls
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-forest-600'
                }`}
              />
              {validationErrors.normal_calls && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationErrors.normal_calls}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E5E5DC] flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset Form
            </Button>
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-1.5" />
              Save Daily Report
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedSave}
        title="Confirm Daily Report Submission"
        message={`Please confirm logging operational metrics for ${formData.report_date}. Blank fields will be recorded as NULL.`}
        confirmLabel="Confirm & Save"
        cancelLabel="Review Entry"
        isLoading={isSubmitting}
      />
    </>
  );
};
