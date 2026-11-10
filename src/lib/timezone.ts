// ====================================================================
// AyurDesk - Timezone Utilities
// Standard: Indian Ocean / Mauritius (UTC+04:00)
// Organization: Ayuryoga International
// ====================================================================

export const MAURITIUS_TIMEZONE = 'Indian/Mauritius';

/**
 * Returns today's date in YYYY-MM-DD format according to Indian Ocean/Mauritius timezone.
 */
export function getTodayMauritiusDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MAURITIUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Format an ISO timestamp or Date object into human-readable Mauritius local date and time.
 */
export function formatDateTimeMauritius(
  dateOrIso: string | Date | null | undefined,
  includeSeconds: boolean = true
): string {
  if (!dateOrIso) return '-';
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: MAURITIUS_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date);
}

/**
 * Format a YYYY-MM-DD report date for clean display in UI tables & cards.
 */
export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  // Parse year, month, day to avoid any UTC shift
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns current timestamp formatted for official reports.
 */
export function getReportGenerationTimestamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: MAURITIUS_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date()) + ' (Mauritius Time MUT / UTC+4)';
}

