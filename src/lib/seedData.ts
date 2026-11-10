// ====================================================================
// AyurDesk - Historical Operational Seed Data
// Organization: Ayuryoga International
// ====================================================================

export interface InitialSeedRecord {
  report_date: string;
  total_enquiries: number | null;
  total_responses: number | null;
  total_confirmations: number | null;
  total_bookings: number | null;
  tomorrow_bookings: number | null;
  whatsapp_calls_messages: number | null;
  normal_calls: number | null;
}

export const INITIAL_RECORDS: InitialSeedRecord[] = [
  { report_date: '2026-10-25', total_enquiries: 29, total_responses: 29, total_confirmations: null, total_bookings: 11, tomorrow_bookings: null, whatsapp_calls_messages: 32, normal_calls: 15 },
  { report_date: '2027-10-26', total_enquiries: 31, total_responses: 31, total_confirmations: null, total_bookings: 7,  tomorrow_bookings: null, whatsapp_calls_messages: 28, normal_calls: 28 }, // Preserved & Flagged for Admin Verification
  { report_date: '2026-10-27', total_enquiries: 47, total_responses: 47, total_confirmations: null, total_bookings: 26, tomorrow_bookings: null, whatsapp_calls_messages: 34, normal_calls: 12 },
  { report_date: '2026-10-28', total_enquiries: 37, total_responses: 37, total_confirmations: null, total_bookings: 28, tomorrow_bookings: null, whatsapp_calls_messages: 26, normal_calls: 11 },
  { report_date: '2026-10-29', total_enquiries: 25, total_responses: 25, total_confirmations: null, total_bookings: 21, tomorrow_bookings: null, whatsapp_calls_messages: 48, normal_calls: 10 },
  { report_date: '2026-10-30', total_enquiries: 34, total_responses: 34, total_confirmations: null, total_bookings: 12, tomorrow_bookings: null, whatsapp_calls_messages: 29, normal_calls: 7 },
  { report_date: '2026-10-31', total_enquiries: 30, total_responses: 30, total_confirmations: null, total_bookings: 14, tomorrow_bookings: null, whatsapp_calls_messages: 20, normal_calls: 11 },
  { report_date: '2026-11-01', total_enquiries: 42, total_responses: 42, total_confirmations: null, total_bookings: null, tomorrow_bookings: null, whatsapp_calls_messages: 42, normal_calls: 10 },
  { report_date: '2026-11-02', total_enquiries: 42, total_responses: 42, total_confirmations: null, total_bookings: 14, tomorrow_bookings: null, whatsapp_calls_messages: 29, normal_calls: 12 },
  { report_date: '2026-11-03', total_enquiries: 46, total_responses: 46, total_confirmations: null, total_bookings: 22, tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 25 },
  { report_date: '2026-11-04', total_enquiries: 32, total_responses: 32, total_confirmations: null, total_bookings: 18, tomorrow_bookings: null, whatsapp_calls_messages: 27, normal_calls: 5 },
  { report_date: '2026-11-05', total_enquiries: 27, total_responses: 27, total_confirmations: null, total_bookings: 10, tomorrow_bookings: null, whatsapp_calls_messages: 21, normal_calls: null },
  { report_date: '2026-11-06', total_enquiries: 14, total_responses: 14, total_confirmations: null, total_bookings: 10, tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 7 },
  { report_date: '2026-11-07', total_enquiries: 21, total_responses: 21, total_confirmations: null, total_bookings: 11, tomorrow_bookings: 28,   whatsapp_calls_messages: 15, normal_calls: 7 },
  { report_date: '2026-11-08', total_enquiries: 24, total_responses: 24, total_confirmations: 13,   total_bookings: null, tomorrow_bookings: null, whatsapp_calls_messages: 21, normal_calls: 3 },
  { report_date: '2026-11-09', total_enquiries: 2,  total_responses: 2,  total_confirmations: 2,    total_bookings: 2,    tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 1 },
];

