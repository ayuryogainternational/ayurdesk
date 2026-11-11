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

export function calculateTherapistOvertime(hours: number) {
  const h = Math.max(0, Number(hours) || 0);
  const regular = Math.min(OVERTIME_HOURS_THRESHOLD, h);
  const overtime = +(Math.max(0, h - OVERTIME_HOURS_THRESHOLD)).toFixed(2);
  const isOvertime = h > OVERTIME_HOURS_THRESHOLD;
  const salary = +(overtime * OVERTIME_HOURLY_RATE).toFixed(2);

  return {
    hours: h,
    regular_hours: regular,
    overtime_hours: overtime,
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

    const exactlyFive = calculateTherapistOvertime(5.0);
    expect(exactlyFive.regular_hours).toBe(5.0);
    expect(exactlyFive.overtime_hours).toBe(0);
    expect(exactlyFive.is_overtime).toBe(false);
    expect(exactlyFive.overtime_salary).toBe(0);
  });

  it('calculates 1.0 hour overtime = 75 MUR for 6 hours work', () => {
    const result = calculateTherapistOvertime(6.0);
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
    const result = calculateTherapistOvertime(7.5);
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(2.5);
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(187.5);
  });

  it('calculates 3.0 hours overtime = 225.00 MUR for 8.0 hours work', () => {
    const result = calculateTherapistOvertime(8.0);
    expect(result.regular_hours).toBe(5.0);
    expect(result.overtime_hours).toBe(3.0);
    expect(result.is_overtime).toBe(true);
    expect(result.overtime_salary).toBe(225.0);
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
