// ====================================================================
// AyurDesk - Core Type Definitions
// Organization: Ayuryoga International
// ====================================================================

export type UserRole = 'admin' | 'staff';
export type BranchName = 'Grand Baie' | 'Curepipe' | 'Moka';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface TherapistDailyHours {
  id: string;
  record_date: string; // YYYY-MM-DD
  branch: BranchName;
  therapist_name: string;
  hours: number;
  regular_hours: number;
  overtime_hours: number;
  is_overtime: boolean;
  overtime_rate: number; // 75 MUR
  overtime_salary: number; // overtime_hours * 75
  is_off_day?: boolean;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TherapistMonthlySummary {
  therapist_name: string;
  branch: BranchName;
  days_worked: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_salary: number;
}

export interface DailyReport {
  id: string;
  report_date: string; // YYYY-MM-DD
  total_enquiries: number | null;
  total_responses: number | null;
  total_confirmations: number | null;
  total_bookings: number | null;
  tomorrow_bookings: number | null;
  whatsapp_calls_messages: number | null;
  normal_calls: number | null;
  created_by?: string | null;
  created_by_name?: string | null;
  updated_by?: string | null;
  updated_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DailyReportFormData = {
  report_date: string;
  total_enquiries: string;
  total_responses: string;
  total_confirmations: string;
  total_bookings: string;
  tomorrow_bookings: string;
  whatsapp_calls_messages: string;
  normal_calls: string;
};

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: Record<string, unknown> | null;
  performed_by: string | null;
  performed_by_name: string | null;
  performed_by_role: string | null;
  performed_at: string;
}

export type ReportScope = 'single' | 'range' | 'daily' | 'weekly' | 'monthly';

export interface ExportFilterParams {
  scope: ReportScope;
  singleDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface KpiSummary {
  totalEnquiries: number;
  totalResponses: number;
  totalConfirmations: number;
  totalBookings: number;
  tomorrowBookings: number;
  totalWhatsApp: number;
  totalNormalCalls: number;
  avgEnquiriesPerDay: number;
  avgBookingsPerDay: number;
  responseRate: number; // percentage
  bookingConversionRate: number; // percentage
  confirmationRate: number; // percentage
  recordCount: number;
}

