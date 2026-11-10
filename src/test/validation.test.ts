// ====================================================================
// AyurDesk - Unit Tests: Form Validation & Anomaly Detection
// ====================================================================

import { describe, it, expect } from 'vitest';
import { validateDailyReportForm, isDateAnomaly, getAnomalyReason } from '../lib/validation';
import { DailyReportFormData } from '../types';

describe('Daily Report Form Validation', () => {
  it('should accept valid non-negative integer operational data', () => {
    const validData: DailyReportFormData = {
      report_date: '2026-10-25',
      total_enquiries: '29',
      total_responses: '29',
      total_confirmations: '',
      total_bookings: '11',
      tomorrow_bookings: '',
      whatsapp_calls_messages: '32',
      normal_calls: '15',
    };

    const result = validateDailyReportForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.parsedValues.total_enquiries).toBe(29);
    expect(result.parsedValues.total_responses).toBe(29);
    expect(result.parsedValues.total_bookings).toBe(11);
    expect(result.parsedValues.whatsapp_calls_messages).toBe(32);
    expect(result.parsedValues.normal_calls).toBe(15);
  });

  it('CRITICAL: must preserve blank fields as NULL and NEVER coerce to zero', () => {
    const blankData: DailyReportFormData = {
      report_date: '2026-11-01',
      total_enquiries: '42',
      total_responses: '42',
      total_confirmations: '', // blank
      total_bookings: '',      // blank
      tomorrow_bookings: '',   // blank
      whatsapp_calls_messages: '42',
      normal_calls: '10',
    };

    const result = validateDailyReportForm(blankData);
    expect(result.isValid).toBe(true);
    expect(result.parsedValues.total_confirmations).toBeNull();
    expect(result.parsedValues.total_bookings).toBeNull();
    expect(result.parsedValues.tomorrow_bookings).toBeNull();
    expect(result.parsedValues.total_confirmations).not.toBe(0);
    expect(result.parsedValues.total_bookings).not.toBe(0);
  });

  it('should reject negative values', () => {
    const negativeData: DailyReportFormData = {
      report_date: '2026-10-25',
      total_enquiries: '-5',
      total_responses: '10',
      total_confirmations: '',
      total_bookings: '',
      tomorrow_bookings: '',
      whatsapp_calls_messages: '',
      normal_calls: '',
    };

    const result = validateDailyReportForm(negativeData);
    expect(result.isValid).toBe(false);
    expect(result.errors.total_enquiries).toContain('Cannot be negative');
  });

  it('should reject non-integer decimal numbers', () => {
    const decimalData: DailyReportFormData = {
      report_date: '2026-10-25',
      total_enquiries: '12.5',
      total_responses: '10',
      total_confirmations: '',
      total_bookings: '',
      tomorrow_bookings: '',
      whatsapp_calls_messages: '',
      normal_calls: '',
    };

    const result = validateDailyReportForm(decimalData);
    expect(result.isValid).toBe(false);
    expect(result.errors.total_enquiries).toContain('whole integer');
  });

  it('should require a valid report date in YYYY-MM-DD format', () => {
    const invalidDateData: DailyReportFormData = {
      report_date: '25-10-2026', // wrong format
      total_enquiries: '10',
      total_responses: '10',
      total_confirmations: '',
      total_bookings: '',
      tomorrow_bookings: '',
      whatsapp_calls_messages: '',
      normal_calls: '',
    };

    const result = validateDailyReportForm(invalidDateData);
    expect(result.isValid).toBe(false);
    expect(result.errors.report_date).toBeDefined();
  });
});

describe('Anomaly Detection for 2027-10-26 (Source Discrepancy)', () => {
  it('should correctly flag 2027-10-26 as an audit anomaly', () => {
    expect(isDateAnomaly('2027-10-26')).toBe(true);
    const reason = getAnomalyReason('2027-10-26');
    expect(reason).toContain('Discrepancy Flag');
    expect(reason).toContain('2027-10-26');
  });

  it('should not flag standard historical 2026 dates', () => {
    expect(isDateAnomaly('2026-10-25')).toBe(false);
    expect(isDateAnomaly('2026-11-09')).toBe(false);
  });
});

