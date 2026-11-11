// ====================================================================
// AyurDesk - Therapist Hours & Overtime Rules Test Suite
// Organization: Ayuryoga International
// ====================================================================

import { describe, it, expect } from 'vitest';

export const THERAPIST_BRANCHES = {
  'Grand Baie': ['Anagha', 'Prasanth'],
  'Curepipe': ['Abhiram', 'Adithya', 'Sandhya'],
  'Moka': ['Shilpa', 'Abhirami', 'Megha', 'Aleena', 'Jilna', 'Vishnu', 'Randeep'],
};

export const OVERTIME_HOURS_THRESHOLD = 5.0;
export const OVERTIME_HOURLY_RATE = 75; // MUR

export function calculateTherapistOvertime(hours: number, minutes = 0) {
  const hInput = Math.max(0, Number(hours) || 0);
  const mInput = Math.max(0, Number(minutes) || 0);

  // If decimal hours provided without separate minutes (e.g., 5.5, 0)
  let totalMinutes = 0;
  if (mInput === 0 && hInput % 1 !== 0) {
    totalMinutes = Math.round(hInput * 60);
  } else {
    totalMinutes = Math.floor(hInput) * 60 + Math.round(mInput);
  }

  const hDisplay = Math.floor(totalMinutes / 60);
  const mDisplay = totalMinutes % 60;
  const totalHoursDecimal = +(totalMinutes / 60).toFixed(2);

  const regularMinutes = Math.min(OVERTIME_HOURS_THRESHOLD * 60, totalMinutes);
  const regularHoursDecimal = +(regularMinutes / 60).toFixed(2);

  const overtimeMinutes = Math.max(0, totalMinutes - OVERTIME_HOURS_THRESHOLD * 60);
  const overtimeHoursDecimal = +(overtimeMinutes / 60).toFixed(2);
  const isOvertime = totalMinutes > OVERTIME_HOURS_THRESHOLD * 60;

  const otH = Math.floor(overtimeMinutes / 60);
  const otM = overtimeMinutes % 60;

  const salary = +(overtimeHoursDecimal * OVERTIME_HOURLY_RATE).toFixed(2);

  return {
    hours: hDisplay,
    minutes: mDisplay,
    total_hours: totalHoursDecimal,
    formatted_time: `${hDisplay}h ${mDisplay}m`,
    regular_hours: regularHoursDecimal,
    overtime_hours: overtimeHoursDecimal,
    overtime_minutes: overtimeMinutes,
    formatted_overtime: isOvertime ? `${otH}h ${otM}m` : '0h 0m',
    is_overtime: isOvertime,
    overtime_rate: OVERTIME_HOURLY_RATE,
    overtime_salary: salary,
  };
}

export function canStaffEditTherapistHours(user: { role: string; email?: string } | null) {
  if (!user) return false;
  // Shilpa, Gokul (staff), and Admin all have edit access
  return user.role === 'staff' || user.role === 'admin';
}

describe('Therapist Branch Categorization', () => {
  it('correctly categorizes Grand Baie therapists (2)', () => {
    expect(THERAPIST_BRANCHES['Grand Baie']).toEqual(['Anagha', 'Prasanth']);
    expect(THERAPIST_BRANCHES['Grand Baie'].length).toBe(2);
  });

  it('correctly categorizes Curepipe therapists (3)', () => {
    expect(THERAPIST_BRANCHES['Curepipe']).toEqual(['Abhiram', 'Adithya', 'Sandhya']);
    expect(THERAPIST_BRANCHES['Curepipe'].length).toBe(3);
  });

  it('correctly categorizes Moka therapists (7)', () => {
    expect(THERAPIST_BRANCHES['Moka']).toEqual([
      'Shilpa',
      'Abhirami',
      'Megha',
      'Aleena',
      'Jilna',
      'Vishnu',
      'Randeep',
    ]);
    expect(THERAPIST_BRANCHES['Moka'].length).toBe(7);
  });

  it('contains exactly 12 therapists in total across all 3 branches', () => {
    const total =
      THERAPIST_BRANCHES['Grand Baie'].length +
      THERAPIST_BRANCHES['Curepipe'].length +
      THERAPIST_BRANCHES['Moka'].length;
    expect(total).toBe(12);
  });
});

describe('Overtime & Remuneration Calculation (>5h threshold @ 75 MUR/hr)', () => {
  it('calculates 0 overtime and 0 MUR for <= 5.0 hours', () => {
    const zero = calculateTherapistOvertime(0);
    expect(zero.regular_hours).toBe(0);
    expect(zero.overtime_hours).toBe(0);
    expect(zero.is_overtime).toBe(false);
    expect(zero.overtime_salary).toBe(0);

    const fourHours = calculateTherapistOvertime(4);
    expect(fourHours.regular_hours).toBe(4);
    expect(fourHours.overtime_hours).toBe(0);
    expect(fourHours.is_overtime).toBe(false);
    expect(fourHours.overtime_salary).toBe(0);

    const exactlyFive = calculateTherapistOvertime(5, 0);
    expect(exactlyFive.regular_hours).toBe(5.0);
    expect(exactlyFive.overtime_hours).toBe(0);
    expect(exactlyFive.is_overtime).toBe(false);
    expect(exactlyFive.overtime_salary).toBe(0);
  });

  it('calculates 1.0 hour overtime = 75 MUR for 6 hours work', () => {
    const result = calculateTherapistOvertime(6, 0);
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(1.0);
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(75.0);
  });

  it('calculates 1.5 hours overtime = 112.50 MUR for 6.5 hours work', () => {
    const result = calculateTherapistOvertime(6.5);
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(1.5);
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(112.5);
  });

  it('calculates 2.5 hours overtime = 187.50 MUR for 7.5 hours work', () => {
    const result = calculateTherapistOvertime(7, 30);
    expect(result.formatted_time).toBe('7h 30m');
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(2.5);
    expect(result.formatted_overtime).toBe('2h 30m');
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(187.5);
  });

  it('calculates 3.0 hours overtime = 225.00 MUR for 8.0 hours work', () => {
    const result = calculateTherapistOvertime(8, 0);
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(3.0);
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(225.0);
  });
});

describe('Custom Minutes Precision & Overtime Handling', () => {
  it('calculates exact overtime for 5 hours 15 minutes (15 mins OT = 18.75 MUR)', () => {
    const res = calculateTherapistOvertime(5, 15);
    expect(res.formatted_time).toBe('5h 15m');
    expect(res.total_hours).toBe(5.25);
    expect(res.overtime_hours).toBe(0.25);
    expect(res.overtime_minutes).toBe(15);
    expect(res.formatted_overtime).toBe('0h 15m');
    expect(res.is_overtime).toBe(true);
    expect(res.overtime_salary).toBe(18.75); // 0.25 * 75 = 18.75
  });

  it('calculates exact overtime for 5 hours 30 minutes (30 mins OT = 37.50 MUR)', () => {
    const res = calculateTherapistOvertime(5, 30);
    expect(res.formatted_time).toBe('5h 30m');
    expect(res.total_hours).toBe(5.5);
    expect(res.overtime_hours).toBe(0.5);
    expect(res.overtime_minutes).toBe(30);
    expect(res.formatted_overtime).toBe('0h 30m');
    expect(res.is_overtime).toBe(true);
    expect(res.overtime_salary).toBe(37.5); // 0.5 * 75 = 37.50
  });

  it('calculates exact overtime for 5 hours 45 minutes (45 mins OT = 56.25 MUR)', () => {
    const res = calculateTherapistOvertime(5, 45);
    expect(res.formatted_time).toBe('5h 45m');
    expect(res.total_hours).toBe(5.75);
    expect(res.overtime_hours).toBe(0.75);
    expect(res.overtime_minutes).toBe(45);
    expect(res.formatted_overtime).toBe('0h 45m');
    expect(res.is_overtime).toBe(true);
    expect(res.overtime_salary).toBe(56.25); // 0.75 * 75 = 56.25
  });

  it('calculates exact overtime for 6 hours 15 minutes (1h 15m OT = 93.75 MUR)', () => {
    const res = calculateTherapistOvertime(6, 15);
    expect(res.formatted_time).toBe('6h 15m');
    expect(res.total_hours).toBe(6.25);
    expect(res.overtime_hours).toBe(1.25);
    expect(res.overtime_minutes).toBe(75);
    expect(res.formatted_overtime).toBe('1h 15m');
    expect(res.is_overtime).toBe(true);
    expect(res.overtime_salary).toBe(93.75); // 1.25 * 75 = 93.75
  });

  it('calculates exact overtime for 7 hours 45 minutes (2h 45m OT = 206.25 MUR)', () => {
    const res = calculateTherapistOvertime(7, 45);
    expect(res.formatted_time).toBe('7h 45m');
    expect(res.total_hours).toBe(7.75);
    expect(res.overtime_hours).toBe(2.75);
    expect(res.overtime_minutes).toBe(165);
    expect(res.formatted_overtime).toBe('2h 45m');
    expect(res.is_overtime).toBe(true);
    expect(res.overtime_salary).toBe(206.25); // 2.75 * 75 = 206.25
  });

  it('handles fractional minutes under 5 hours without overtime (e.g. 4h 50m)', () => {
    const res = calculateTherapistOvertime(4, 50);
    expect(res.formatted_time).toBe('4h 50m');
    expect(res.total_hours).toBe(4.83);
    expect(res.overtime_hours).toBe(0);
    expect(res.is_overtime).toBe(false);
    expect(res.overtime_salary).toBe(0);
  });
});

describe('Staff Access Control (Shilpa & Gokul Collaboration)', () => {
  it('allows Shilpa (staff) to edit and add therapist hours', () => {
    const shilpa = { role: 'staff', email: 'shilpa@ayuryoga.example.com' };
    expect(canStaffEditTherapistHours(shilpa)).toBe(true);
  });

  it('allows Gokul (staff) to edit and add therapist hours', () => {
    const gokul = { role: 'staff', email: 'gokul@ayuryoga.example.com' };
    expect(canStaffEditTherapistHours(gokul)).toBe(true);
  });

  it('allows Admin to edit and add therapist hours', () => {
    const admin = { role: 'admin', email: 'admin@ayuryoga.example.com' };
    expect(canStaffEditTherapistHours(admin)).toBe(true);
  });

  it('denies unauthenticated users', () => {
    expect(canStaffEditTherapistHours(null)).toBe(false);
  });
});
