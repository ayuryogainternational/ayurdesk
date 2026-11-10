// ====================================================================
// AyurDesk - Unit Tests: Therapist Attendance & Overtime Remuneration
// Standard Shift: 5.0h • Overtime Rate: 75 MUR / hour for hours > 5h
// ====================================================================

import { describe, it, expect } from 'vitest';

function calculateShiftHours(inStr?: string | null, outStr?: string | null): number {
  if (!inStr || !outStr) return 0;
  if (inStr.includes(':') && outStr.includes(':')) {
    const [inH, inM] = inStr.split(':').map(Number);
    const [outH, outM] = outStr.split(':').map(Number);
    if (!isNaN(inH) && !isNaN(outH)) {
      const startMins = inH * 60 + (inM || 0);
      const endMins = outH * 60 + (outM || 0);
      if (endMins >= startMins) {
        return +((endMins - startMins) / 60).toFixed(2);
      }
    }
  }
  return 0;
}

function calculateDailyOvertime(shift1Hours: number, shift2Hours: number, isOffDay = false) {
  if (isOffDay) {
    return {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      isOvertime: false,
      overtimeSalary: 0,
    };
  }

  const total = +(shift1Hours + shift2Hours).toFixed(2);
  const regular = Math.min(5.0, total);
  const overtime = +(Math.max(0, total - 5.0)).toFixed(2);
  const isOvertime = total > 5.0;
  const rate = 75; // 75 MUR / hour
  const salary = +(overtime * rate).toFixed(2);

  return {
    totalHours: total,
    regularHours: regular,
    overtimeHours: overtime,
    isOvertime,
    overtimeSalary: salary,
  };
}

describe('Therapist Attendance & 2-Shift Marking', () => {
  it('correctly calculates hours for Shift 1 and Shift 2', () => {
    const shift1 = calculateShiftHours('08:30', '12:30'); // 4.0h
    const shift2 = calculateShiftHours('14:00', '18:00'); // 4.0h
    expect(shift1).toBe(4.0);
    expect(shift2).toBe(4.0);
  });

  it('handles partial fractions of hours correctly', () => {
    const shift = calculateShiftHours('09:00', '10:15'); // 1h 15m = 1.25h
    expect(shift).toBe(1.25);
  });

  it('returns 0 for missing or invalid timestamps', () => {
    expect(calculateShiftHours(null, '12:00')).toBe(0);
    expect(calculateShiftHours('09:00', null)).toBe(0);
    expect(calculateShiftHours(null, null)).toBe(0);
  });
});

describe('Therapist Overtime Remuneration Rules (5h Threshold, 75 MUR/hr)', () => {
  it('identifies standard shifts within 5 hours without overtime', () => {
    // 5.0 hours total
    const result = calculateDailyOvertime(5.0, 0);
    expect(result.totalHours).toBe(5.0);
    expect(result.regularHours).toBe(5.0);
    expect(result.overtimeHours).toBe(0);
    expect(result.isOvertime).toBe(false);
    expect(result.overtimeSalary).toBe(0);
  });

  it('identifies shifts under 5 hours without overtime', () => {
    // 4.5 hours total
    const result = calculateDailyOvertime(2.5, 2.0);
    expect(result.totalHours).toBe(4.5);
    expect(result.regularHours).toBe(4.5);
    expect(result.overtimeHours).toBe(0);
    expect(result.isOvertime).toBe(false);
    expect(result.overtimeSalary).toBe(0);
  });

  it('calculates overtime correctly when total hours exceed 5 hours', () => {
    // 8.0 hours total: 5.0 regular + 3.0 overtime
    const result = calculateDailyOvertime(4.0, 4.0);
    expect(result.totalHours).toBe(8.0);
    expect(result.regularHours).toBe(5.0);
    expect(result.overtimeHours).toBe(3.0);
    expect(result.isOvertime).toBe(true);
    // 3.0 hours * 75 MUR/hour = 225.00 MUR
    expect(result.overtimeSalary).toBe(225.0);
  });

  it('accurately charges 75 MUR for each 1 hour of overtime with fractional hours', () => {
    // 7.5 hours total: 5.0 regular + 2.5 overtime
    const result = calculateDailyOvertime(4.5, 3.0);
    expect(result.totalHours).toBe(7.5);
    expect(result.regularHours).toBe(5.0);
    expect(result.overtimeHours).toBe(2.5);
    expect(result.isOvertime).toBe(true);
    // 2.5 hours * 75 MUR = 187.50 MUR
    expect(result.overtimeSalary).toBe(187.5);
  });

  it('zeroes hours and overtime when day is marked as Off Day', () => {
    const result = calculateDailyOvertime(4.0, 4.0, true);
    expect(result.totalHours).toBe(0);
    expect(result.regularHours).toBe(0);
    expect(result.overtimeHours).toBe(0);
    expect(result.isOvertime).toBe(false);
    expect(result.overtimeSalary).toBe(0);
  });
});
