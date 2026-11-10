// ====================================================================
// AyurDesk - Unit Tests: Indian Ocean / Mauritius Timezone
// ====================================================================

import { describe, it, expect } from 'vitest';
import {
  formatDateDisplay,
  formatDateTimeMauritius,
  MAURITIUS_TIMEZONE,
} from '../lib/timezone';

describe('Mauritius Timezone Utilities', () => {
  it('should use Indian/Mauritius timezone constant', () => {
    expect(MAURITIUS_TIMEZONE).toBe('Indian/Mauritius');
  });

  it('should format YYYY-MM-DD for readable display without day-shifting', () => {
    const formatted = formatDateDisplay('2026-10-25');
    expect(formatted).toBe('25 Oct 2026');
  });

  it('should format ISO timestamp accurately in Mauritius Time (MUT / UTC+4)', () => {
    // 2026-11-09T08:00:00Z in UTC is 12:00:00 in Mauritius (+4)
    const utcIso = '2026-11-09T08:00:00.000Z';
    const formatted = formatDateTimeMauritius(utcIso);
    expect(formatted).toContain('09 Nov 2026');
    expect(formatted).toContain('12:00:00');
  });

  it('should handle null or invalid date gracefully', () => {
    expect(formatDateDisplay(null)).toBe('-');
    expect(formatDateTimeMauritius(null)).toBe('-');
    expect(formatDateTimeMauritius('invalid-date')).toBe('-');
  });
});

