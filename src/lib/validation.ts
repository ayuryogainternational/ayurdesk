// ====================================================================
// AyurDesk - Form Validation & Anomaly Detection
// Organization: Ayuryoga International
// ====================================================================

import { DailyReportFormData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  parsedValues: {
    report_date: string;
    total_enquiries: number | null;
    total_responses: number | null;
    total_confirmations: number | null;
    total_bookings: number | null;
    tomorrow_bookings: number | null;
    whatsapp_calls_messages: number | null;
    normal_calls: number | null;
  };
}

/**
 * Validates daily report form values.
 * Strictly adheres to:
 * 1. Non-negative integers or NULL.
 * 2. Blank fields are treated as NULL and NEVER automatically converted to zero.
 */
export function validateDailyReportForm(formData: DailyReportFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.report_date || !formData.report_date.trim()) {
    errors.report_date = 'Report date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.report_date)) {
    errors.report_date = 'Invalid date format (must be YYYY-MM-DD).';
  }

  const numericFields: Array<keyof Omit<DailyReportFormData, 'report_date'>> = [
    'total_enquiries',
    'total_responses',
    'total_confirmations',
    'total_bookings',
    'tomorrow_bookings',
    'whatsapp_calls_messages',
    'normal_calls',
  ];

  const parsedValues: ValidationResult['parsedValues'] = {
    report_date: formData.report_date.trim(),
    total_enquiries: null,
    total_responses: null,
    total_confirmations: null,
    total_bookings: null,
    tomorrow_bookings: null,
    whatsapp_calls_messages: null,
    normal_calls: null,
  };

  for (const field of numericFields) {
    const rawVal = formData[field];
    
    // Blank/empty string must remain NULL, never 0
    if (rawVal === undefined || rawVal === null || rawVal.trim() === '') {
      parsedValues[field] = null;
      continue;
    }

    const num = Number(rawVal.trim());
    if (isNaN(num)) {
      errors[field] = 'Must be a valid number.';
    } else if (!Number.isInteger(num)) {
      errors[field] = 'Must be a whole integer.';
    } else if (num < 0) {
      errors[field] = 'Cannot be negative (must be >= 0).';
    } else {
      parsedValues[field] = num;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsedValues,
  };
}

/**
 * Checks if a record date represents a known anomaly.
 * Specifically flags 2027-10-26 (source screenshot typo) or future dates outside current operational window.
 */
export function isDateAnomaly(dateStr: string): boolean {
  if (!dateStr) return false;
  // Specific known date from prompt
  if (dateStr === '2027-10-26') return true;

  // Generic heuristic: date in year 2027+ while surrounding dates are in 2026
  const year = parseInt(dateStr.substring(0, 4), 10);
  return year > 2026;
}

/**
 * Return detailed anomaly reason for alerts and badges
 */
export function getAnomalyReason(dateStr: string): string {
  if (dateStr === '2027-10-26') {
    return 'Discrepancy Flag: Date reads 26-10-2027 (2027-10-26) while all surrounding records are in October-November 2026. Preserved per source audit requirement for administrator verification.';
  }
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (year > 2026) {
    return `Future Date Alert: Year ${year} exceeds historical operational window. Requires administrator review.`;
  }
  return 'Flagged for administrator review.';
}
