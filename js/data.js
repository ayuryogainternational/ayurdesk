// ====================================================================
// AyurDesk - Data Management & Operations Store
// Organization: Ayuryoga International
// ====================================================================

// Clean operational baseline - dummy records removed for fresh production data entry
const INITIAL_RECORDS = [];

const INITIAL_AUDIT_LOGS = [];

const INITIAL_USERS = [
  {
    id: 'admin-1',
    email: 'admin@ayuryoga.example.com',
    full_name: 'Owner / Administrator',
    role: 'admin',
    must_change_password: false,
    created_at: '2026-10-20T08:00:00Z',
  },
  {
    id: 'staff-1',
    email: 'shilpa@ayuryoga.example.com',
    full_name: 'Shilpa',
    role: 'staff',
    must_change_password: true,
    created_at: '2026-10-22T09:00:00Z',
  },
  {
    id: 'staff-2',
    email: 'gokul@ayuryoga.example.com',
    full_name: 'Gokul',
    role: 'staff',
    must_change_password: true,
    created_at: '2026-10-22T09:15:00Z',
  },
];

const STORAGE_KEYS = {
  REPORTS: 'ayurdesk_reports_v3',
  AUDIT_LOGS: 'ayurdesk_audit_logs_v3',
  USERS: 'ayurdesk_users_v3',
  THERAPIST_HOURS: 'ayurdesk_therapist_hours_v3',
};

// 3 Branches & 12 Official Ayurvedic Therapists
const THERAPIST_BRANCHES = {
  'Grand Baie': ['Anagha', 'Prasanth'],
  'Curepipe': ['Abhiram', 'Adithya', 'Sandhya'],
  'Moka': ['Shilpa', 'Abhirami', 'Megha', 'Aleena', 'Jilna', 'Vishnu', 'Randeep'],
};

const ALL_THERAPISTS = [
  { name: 'Anagha', branch: 'Grand Baie' },
  { name: 'Prasanth', branch: 'Grand Baie' },
  { name: 'Abhiram', branch: 'Curepipe' },
  { name: 'Adithya', branch: 'Curepipe' },
  { name: 'Sandhya', branch: 'Curepipe' },
  { name: 'Shilpa', branch: 'Moka' },
  { name: 'Abhirami', branch: 'Moka' },
  { name: 'Megha', branch: 'Moka' },
  { name: 'Aleena', branch: 'Moka' },
  { name: 'Jilna', branch: 'Moka' },
  { name: 'Vishnu', branch: 'Moka' },
  { name: 'Randeep', branch: 'Moka' },
];

const OVERTIME_HOURS_THRESHOLD = 5.0;
const OVERTIME_HOURLY_RATE = 75; // 75 MUR per hour above 5h

function calculateTherapistOvertime(hours, minutes = 0) {
  const hInput = Math.max(0, Number(hours) || 0);
  const mInput = Math.max(0, Number(minutes) || 0);

  // If decimal hours provided without separate minutes (e.g. 5.5, 0)
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

const USER_PROFILES_MAP = {
  '36c696a3-bd86-46e2-8ff8-06bec48f37f4': { full_name: 'Owner / Administrator', role: 'admin' },
  'ad5cf6a7-175e-4e41-a97a-a2621e1fe2df': { full_name: 'Shilpa', role: 'staff' },
  'b110aeeb-dc4d-42d5-b1fb-6eb4dece1267': { full_name: 'Gokul', role: 'staff' },
  'staff-1': { full_name: 'Shilpa', role: 'staff' },
  'staff-2': { full_name: 'Gokul', role: 'staff' },
  'admin-1': { full_name: 'Owner / Administrator', role: 'admin' },
};

function isUuid(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

let syncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('ayurdesk_sync');
  } catch (e) {
    // BroadcastChannel unsupported or blocked
  }
}

function broadcastDataChange(type, payload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ayurdesk:data-updated', { detail: { type, payload } }));
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, payload });
      } catch (e) {}
    }
  }
}

class DataStore {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    // 1. Purge legacy v2 cache containing old dummy seed data & removed therapist keys
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ayurdesk_reports_v2');
        localStorage.removeItem('ayurdesk_audit_logs_v2');
        localStorage.removeItem('ayurdesk_therapists_v2');
        localStorage.removeItem('ayurdesk_therapist_records_v2');
      }
    } catch (e) {
      console.warn('[AyurDesk] Cache cleanup notice:', e);
    }

    // 2. Initialize current v3 storage with empty dataset for fresh entries
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    } else {
      // Clean any lingering seed-tagged records from active storage
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
        const cleaned = existing.filter((r) => !String(r.id || '').startsWith('seed-'));
        if (cleaned.length !== existing.length) {
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(cleaned));
        }
      } catch (e) {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    } else {
      try {
        const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
        const cleanedLogs = existingLogs.filter((l) => !String(l.id || '').startsWith('log-seed-'));
        if (cleanedLogs.length !== existingLogs.length) {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(cleanedLogs));
        }
      } catch (e) {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.THERAPIST_HOURS)) {
      localStorage.setItem(STORAGE_KEYS.THERAPIST_HOURS, JSON.stringify([]));
    }
  }

  // Get all reports sorted by report_date descending with intelligent sync
  async getReports() {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    let localReports = raw ? JSON.parse(raw) : [];

    // If Supabase client configured, try remote fetch and smart-merge
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('daily_reports')
          .select('*')
          .order('report_date', { ascending: false });

        if (!error && Array.isArray(data)) {
          const localByDate = new Map();
          localReports.forEach((r) => localByDate.set(r.report_date, r));

          data.forEach((remoteRow) => {
            const existingLocal = localByDate.get(remoteRow.report_date);
            const createdName =
              existingLocal?.created_by_name ||
              USER_PROFILES_MAP[remoteRow.created_by]?.full_name ||
              (remoteRow.created_by ? 'Reception Staff' : 'Shilpa & Gokul');
            const updatedName =
              existingLocal?.updated_by_name ||
              USER_PROFILES_MAP[remoteRow.updated_by]?.full_name ||
              (remoteRow.updated_by ? 'Reception Staff' : null);

            const merged = {
              ...existingLocal,
              ...remoteRow,
              created_by_name: createdName,
              updated_by_name: updatedName,
            };
            localByDate.set(remoteRow.report_date, merged);
          });

          localReports = Array.from(localByDate.values());
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(localReports));
        }
      } catch (e) {
        console.warn('[AyurDesk] Supabase fetch fallback to local storage:', e);
      }
    }

    return localReports.sort((a, b) => b.report_date.localeCompare(a.report_date));
  }

  async getReportById(id) {
    const reports = await this.getReports();
    return reports.find((r) => r.id === id) || null;
  }

  async getReportByDate(date) {
    const reports = await this.getReports();
    return reports.find((r) => r.report_date === date) || null;
  }

  // Permission Check: 24-hour edit window
  // Staff (Shilpa, Gokul) can overwrite/edit reports within 24 hours of creation.
  // After 24 hours, editing is locked and only administrators can edit.
  canEditReport(report, user = null) {
    const activeUser = user || (window.authManager ? window.authManager.getCurrentUser() : null);
    if (!activeUser) return { canEdit: false, reason: 'Authentication required' };
    if (activeUser.role === 'admin') return { canEdit: true };

    const now = Date.now();
    // 1. If created_at timestamp exists, check if > 24 hours
    if (report && report.created_at) {
      const createdMs = new Date(report.created_at).getTime();
      if (!isNaN(createdMs)) {
        const elapsedHours = (now - createdMs) / (1000 * 60 * 60);
        if (elapsedHours > 24) {
          return {
            canEdit: false,
            reason: `Editing locked: This record was submitted ${Math.floor(elapsedHours)} hours ago (>24h). Only administrators can modify historical records older than 24 hours.`,
          };
        }
        return { canEdit: true };
      }
    }

    // 2. If no created_at timestamp, compare report_date with today in Mauritius
    const today = window.getTodayMauritiusDate ? window.getTodayMauritiusDate() : new Date().toISOString().split('T')[0];
    if (report && report.report_date === today) {
      return { canEdit: true };
    }

    if (report && report.report_date) {
      const recordDateMs = new Date(`${report.report_date}T23:59:59Z`).getTime();
      if (now - recordDateMs > 24 * 60 * 60 * 1000) {
        return {
          canEdit: false,
          reason: 'Editing locked: Historical records older than 24 hours can only be modified by an administrator.',
        };
      }
    }

    return { canEdit: true };
  }

  // Fast synchronous local update with immediate background database upsert
  async saveReport(reportData) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = raw ? JSON.parse(raw) : [];

    // Check if report with same date exists
    const existingIndex = reports.findIndex((r) => r.report_date === reportData.report_date);
    let finalRecord = null;
    const isNew = existingIndex < 0;

    if (!isNew) {
      // Overwrite / Update existing daily report (Reception Handover Shilpa/Gokul)
      const oldRecord = reports[existingIndex];
      const check = this.canEditReport(oldRecord, user);
      if (!check.canEdit) {
        throw new Error(check.reason);
      }

      finalRecord = {
        ...oldRecord,
        ...reportData,
        updated_by: user ? user.id : 'system',
        updated_by_name: user ? user.full_name : 'Reception Staff',
        updated_at: new Date().toISOString(),
      };
      reports[existingIndex] = finalRecord;

      this.addAuditLog('UPDATE', 'daily_reports', finalRecord.id, oldRecord, finalRecord, {
        event: 'reception_overwrite',
        overwritten_by: user ? user.full_name : 'Reception Staff',
        modified_fields: Object.keys(reportData),
      });
    } else {
      // Insert new daily report
      finalRecord = {
        id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        ...reportData,
        created_by: user ? user.id : 'system',
        created_by_name: user ? user.full_name : 'Reception Staff',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      reports.unshift(finalRecord);

      this.addAuditLog('INSERT', 'daily_reports', finalRecord.id, null, finalRecord, {
        event: 'created',
        created_by: user ? user.full_name : 'Reception Staff',
      });
    }

    // 1. Instant local persistence & event broadcast (<1ms)
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    broadcastDataChange('SAVE_REPORT', finalRecord);

    // 2. Fast background database upsert to Supabase
    if (window.supabaseClient) {
      const dbPayload = {
        report_date: finalRecord.report_date,
        total_enquiries: finalRecord.total_enquiries != null ? Number(finalRecord.total_enquiries) : null,
        total_responses: finalRecord.total_responses != null ? Number(finalRecord.total_responses) : null,
        total_confirmations: finalRecord.total_confirmations != null ? Number(finalRecord.total_confirmations) : null,
        total_bookings: finalRecord.total_bookings != null ? Number(finalRecord.total_bookings) : null,
        tomorrow_bookings: finalRecord.tomorrow_bookings != null ? Number(finalRecord.tomorrow_bookings) : null,
        whatsapp_calls_messages: finalRecord.whatsapp_calls_messages != null ? Number(finalRecord.whatsapp_calls_messages) : null,
        normal_calls: finalRecord.normal_calls != null ? Number(finalRecord.normal_calls) : null,
        updated_at: new Date().toISOString(),
      };

      if (user && isUuid(user.id)) {
        if (isNew) {
          dbPayload.created_by = user.id;
        }
        dbPayload.updated_by = user.id;
      }

      // Upsert by report_date
      window.supabaseClient
        .from('daily_reports')
        .upsert([dbPayload], { onConflict: 'report_date' })
        .select()
        .then(({ data, error }) => {
          if (!error && data && data[0]) {
            // Update local ID if remote UUID generated
            const freshRaw = localStorage.getItem(STORAGE_KEYS.REPORTS);
            if (freshRaw) {
              const freshReports = JSON.parse(freshRaw);
              const idx = freshReports.findIndex((r) => r.report_date === finalRecord.report_date);
              if (idx >= 0 && data[0].id) {
                freshReports[idx].id = data[0].id;
                localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(freshReports));
              }
            }
          } else if (error) {
            console.warn('[AyurDesk] Supabase upsert notice:', error);
          }
        })
        .catch((e) => console.warn('[AyurDesk] Supabase network notice:', e));
    }

    return finalRecord;
  }

  async updateReport(id, patch) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = raw ? JSON.parse(raw) : [];
    const index = reports.findIndex((r) => r.id === id || r.report_date === patch.report_date);
    if (index === -1) throw new Error('Record not found');

    const oldRecord = reports[index];
    const check = this.canEditReport(oldRecord, user);
    if (!check.canEdit) {
      throw new Error(check.reason);
    }

    const updated = {
      ...oldRecord,
      ...patch,
      updated_by: user ? user.id : 'system',
      updated_by_name: user ? user.full_name : 'Reception Staff',
      updated_at: new Date().toISOString(),
    };
    reports[index] = updated;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    broadcastDataChange('UPDATE_REPORT', updated);

    this.addAuditLog('UPDATE', 'daily_reports', id, oldRecord, updated, {
      ...patch,
      modified_by: user ? user.full_name : 'Reception Staff',
    });

    if (window.supabaseClient) {
      const dbPayload = {
        report_date: updated.report_date,
        total_enquiries: updated.total_enquiries != null ? Number(updated.total_enquiries) : null,
        total_responses: updated.total_responses != null ? Number(updated.total_responses) : null,
        total_confirmations: updated.total_confirmations != null ? Number(updated.total_confirmations) : null,
        total_bookings: updated.total_bookings != null ? Number(updated.total_bookings) : null,
        tomorrow_bookings: updated.tomorrow_bookings != null ? Number(updated.tomorrow_bookings) : null,
        whatsapp_calls_messages: updated.whatsapp_calls_messages != null ? Number(updated.whatsapp_calls_messages) : null,
        normal_calls: updated.normal_calls != null ? Number(updated.normal_calls) : null,
        updated_at: new Date().toISOString(),
      };
      if (user && isUuid(user.id)) {
        dbPayload.updated_by = user.id;
      }

      window.supabaseClient
        .from('daily_reports')
        .upsert([dbPayload], { onConflict: 'report_date' })
        .then(() => {})
        .catch((e) => console.warn('[AyurDesk] Supabase update notice:', e));
    }

    return updated;
  }

  async deleteReport(id) {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = raw ? JSON.parse(raw) : [];
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Record not found');

    const deletedRecord = reports[index];
    reports.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    broadcastDataChange('DELETE_REPORT', deletedRecord);

    this.addAuditLog('DELETE', 'daily_reports', id, deletedRecord, null, {
      event: 'deleted',
    });

    if (window.supabaseClient) {
      window.supabaseClient
        .from('daily_reports')
        .delete()
        .eq('report_date', deletedRecord.report_date)
        .then(() => {})
        .catch((e) => console.warn('[AyurDesk] Supabase delete notice:', e));
    }

    return true;
  }

  async resolveAnomaly(targetDate = '2026-10-26') {
    const reports = await this.getReports();
    const anomaly = reports.find((r) => r.report_date === '2027-10-26');
    if (!anomaly) return false;

    return await this.updateReport(anomaly.id, { report_date: targetDate });
  }

  // Audit Logs
  async getAuditLogs() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('audit_logs')
          .select('*')
          .order('performed_at', { ascending: false })
          .limit(100);
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('[AyurDesk] Supabase audit fetch fallback to local:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const logs = raw ? JSON.parse(raw) : [];
    return logs.sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at));
  }

  async addAuditLog(action, tableName, recordId, oldData, newData, changedFields) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    const log = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      table_name: tableName,
      record_id: recordId,
      action: action,
      old_data: oldData,
      new_data: newData,
      changed_fields: changedFields,
      performed_by: user ? user.id : 'system',
      performed_by_name: user ? user.full_name : 'System Automated',
      performed_by_role: user ? user.role : 'system',
      performed_at: new Date().toISOString(),
    };

    const logs = await this.getAuditLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('audit_logs').insert([log]);
      } catch (e) {
        console.warn('[AyurDesk] Supabase audit insert notice:', e);
      }
    }

    return log;
  }

  // Users Management
  async getUsers() {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .order('role', { ascending: true })
          .order('full_name', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('[AyurDesk] Supabase profiles fetch fallback:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [...INITIAL_USERS];
  }

  async addUser(userData) {
    const users = await this.getUsers();
    const newUser = {
      id: 'usr-' + Date.now(),
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role || 'staff',
      must_change_password: true,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    await this.addAuditLog('INSERT', 'profiles', newUser.id, null, newUser, { event: 'user_created' });
    return newUser;
  }

  async toggleUserPasswordRequirement(userId) {
    const users = await this.getUsers();
    const u = users.find((x) => x.id === userId);
    if (u) {
      u.must_change_password = !u.must_change_password;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return u;
  }

  // Aggregate Metrics & KPI summary calculations
  calculateKpiSummary(records) {
    let enquiries = 0;
    let responses = 0;
    let confirmations = 0;
    let bookings = 0;
    let tomorrow = 0;
    let whatsapp = 0;
    let normal = 0;

    (records || []).forEach((r) => {
      if (r.total_enquiries !== null && r.total_enquiries !== undefined) enquiries += Number(r.total_enquiries);
      if (r.total_responses !== null && r.total_responses !== undefined) responses += Number(r.total_responses);
      if (r.total_confirmations !== null && r.total_confirmations !== undefined) confirmations += Number(r.total_confirmations);
      if (r.total_bookings !== null && r.total_bookings !== undefined) bookings += Number(r.total_bookings);
      if (r.tomorrow_bookings !== null && r.tomorrow_bookings !== undefined) tomorrow += Number(r.tomorrow_bookings);
      if (r.whatsapp_calls_messages !== null && r.whatsapp_calls_messages !== undefined) whatsapp += Number(r.whatsapp_calls_messages);
      if (r.normal_calls !== null && r.normal_calls !== undefined) normal += Number(r.normal_calls);
    });

    const count = (records || []).length;
    const responseRate = enquiries > 0 ? (responses / enquiries) * 100 : 0;
    const bookingConversionRate = enquiries > 0 ? (bookings / enquiries) * 100 : 0;
    const confirmationRate = bookings > 0 ? (confirmations / bookings) * 100 : 0;

    return {
      totalEnquiries: enquiries,
      totalResponses: responses,
      totalConfirmations: confirmations,
      totalBookings: bookings,
      tomorrowBookings: tomorrow,
      totalWhatsApp: whatsapp,
      totalNormalCalls: normal,
      avgEnquiriesPerDay: count > 0 ? (enquiries / count).toFixed(1) : '0',
      avgBookingsPerDay: count > 0 ? (bookings / count).toFixed(1) : '0',
      responseRate: responseRate.toFixed(1),
      bookingConversionRate: bookingConversionRate.toFixed(1),
      confirmationRate: confirmationRate.toFixed(1),
      recordCount: count,
    };
  }

  // ====================================================================
  // THERAPIST WORKING HOURS & OVERTIME MANAGEMENT
  // Categorized across 3 Branches: Grand Baie, Curepipe, Moka
  // Overtime rule: > 5 hours => 75 MUR per hour
  // Editable by staff (Shilpa, Gokul) and Admin
  // ====================================================================

  getTherapistBranches() {
    return {
      branches: THERAPIST_BRANCHES,
      therapists: ALL_THERAPISTS,
      threshold: OVERTIME_HOURS_THRESHOLD,
      rate: OVERTIME_HOURLY_RATE,
    };
  }

  calculateTherapistOvertime(hours, minutes = 0) {
    return calculateTherapistOvertime(hours, minutes);
  }

  // Get all therapist hours with optional filtering (date, month, branch, therapist_name)
  async getTherapistHours(filters = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST_HOURS);
    let records = raw ? JSON.parse(raw) : [];

    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('therapist_hours')
          .select('*')
          .order('record_date', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const map = new Map();
          records.forEach((r) => map.set(`${r.record_date}_${r.therapist_name}`, r));
          data.forEach((remote) => {
            const key = `${remote.record_date}_${remote.therapist_name}`;
            map.set(key, { ...(map.get(key) || {}), ...remote });
          });
          records = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.THERAPIST_HOURS, JSON.stringify(records));
        }
      } catch (e) {
        // Fallback to local storage
      }
    }

    if (filters.date) {
      records = records.filter((r) => r.record_date === filters.date);
    }
    if (filters.month) {
      records = records.filter((r) => (r.record_date || '').startsWith(filters.month));
    }
    if (filters.branch && filters.branch !== 'all') {
      records = records.filter((r) => r.branch === filters.branch);
    }
    if (filters.therapist_name) {
      records = records.filter(
        (r) => r.therapist_name.toLowerCase() === filters.therapist_name.toLowerCase()
      );
    }

    return records.sort((a, b) => b.record_date.localeCompare(a.record_date));
  }

  // Get daily records for all 12 therapists on a given date (with default empty values if not yet entered)
  async getTherapistHoursForDate(dateStr) {
    const records = await this.getTherapistHours({ date: dateStr });
    const recordsMap = new Map();
    records.forEach((r) => recordsMap.set(r.therapist_name, r));

    return ALL_THERAPISTS.map((t) => {
      const existing = recordsMap.get(t.name);
      if (existing) {
        if (existing.minutes === undefined || existing.formatted_time === undefined) {
          const calc = calculateTherapistOvertime(existing.hours || 0, existing.minutes || 0);
          existing.hours = calc.hours;
          existing.minutes = calc.minutes;
          existing.total_hours = calc.total_hours;
          existing.formatted_time = calc.formatted_time;
          existing.regular_hours = calc.regular_hours;
          existing.overtime_hours = calc.overtime_hours;
          existing.overtime_minutes = calc.overtime_minutes;
          existing.formatted_overtime = calc.formatted_overtime;
          existing.is_overtime = calc.is_overtime;
          existing.overtime_salary = calc.overtime_salary;
        }
        return existing;
      }

      return {
        id: `th-${t.name.toLowerCase()}-${dateStr}`,
        record_date: dateStr,
        branch: t.branch,
        therapist_name: t.name,
        hours: 0,
        minutes: 0,
        total_hours: 0,
        formatted_time: '0h 0m',
        regular_hours: 0,
        overtime_hours: 0,
        overtime_minutes: 0,
        formatted_overtime: '0h 0m',
        is_overtime: false,
        overtime_rate: OVERTIME_HOURLY_RATE,
        overtime_salary: 0,
        is_off_day: false,
        notes: '',
        created_by_name: null,
        updated_by_name: null,
        updated_at: null,
      };
    });
  }

  // Save therapist hours for a date (editable by Shilpa, Gokul, or Admin)
  async saveTherapistHoursForDate(dateStr, hoursList) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    if (!user) throw new Error('Authentication required');

    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST_HOURS);
    let allRecords = raw ? JSON.parse(raw) : [];

    const nowIso = new Date().toISOString();
    const updatedEntries = [];

    hoursList.forEach((entry) => {
      const h = Math.max(0, parseInt(entry.hours, 10) || 0);
      const m = Math.max(0, parseInt(entry.minutes, 10) || 0);
      const isOff = !!entry.is_off_day;
      const effectiveHours = isOff ? 0 : h;
      const effectiveMinutes = isOff ? 0 : m;
      const calc = calculateTherapistOvertime(effectiveHours, effectiveMinutes);

      const record = {
        id: entry.id || `th-${entry.therapist_name.toLowerCase()}-${dateStr}`,
        record_date: dateStr,
        branch: entry.branch,
        therapist_name: entry.therapist_name,
        hours: calc.hours,
        minutes: calc.minutes,
        total_hours: calc.total_hours,
        formatted_time: calc.formatted_time,
        regular_hours: calc.regular_hours,
        overtime_hours: calc.overtime_hours,
        overtime_minutes: calc.overtime_minutes,
        formatted_overtime: calc.formatted_overtime,
        is_overtime: calc.is_overtime,
        overtime_rate: calc.overtime_rate,
        overtime_salary: calc.overtime_salary,
        is_off_day: isOff,
        notes: entry.notes || '',
        updated_by: user.id,
        updated_by_name: user.full_name || (user.email ? user.email.split('@')[0] : 'Staff'),
        updated_at: nowIso,
      };

      const existingIndex = allRecords.findIndex(
        (r) => r.record_date === dateStr && r.therapist_name === entry.therapist_name
      );

      if (existingIndex >= 0) {
        record.created_by = allRecords[existingIndex].created_by || user.id;
        record.created_by_name = allRecords[existingIndex].created_by_name || record.updated_by_name;
        record.created_at = allRecords[existingIndex].created_at || nowIso;
        allRecords[existingIndex] = record;
      } else {
        record.created_by = user.id;
        record.created_by_name = record.updated_by_name;
        record.created_at = nowIso;
        allRecords.push(record);
      }

      updatedEntries.push(record);
    });

    localStorage.setItem(STORAGE_KEYS.THERAPIST_HOURS, JSON.stringify(allRecords));
    broadcastDataChange('THERAPIST_HOURS_SAVED', { date: dateStr, entries: updatedEntries });

    // Try Supabase background upsert
    if (window.supabaseClient) {
      window.supabaseClient
        .from('therapist_hours')
        .upsert(updatedEntries, { onConflict: 'record_date,therapist_name' })
        .then(() => {})
        .catch((e) => console.warn('[AyurDesk] Supabase therapist_hours notice:', e));
    }

    return updatedEntries;
  }

  // Calculate Monthly Therapist Summary for Payroll / Reports
  calculateTherapistMonthlyReport(records, monthKey, branchFilter = 'all') {
    const filtered = records.filter((r) => {
      const matchMonth = (r.record_date || '').startsWith(monthKey);
      const matchBranch = branchFilter === 'all' || r.branch === branchFilter;
      return matchMonth && matchBranch;
    });

    const groups = new Map();

    ALL_THERAPISTS.forEach((t) => {
      if (branchFilter !== 'all' && t.branch !== branchFilter) return;
      groups.set(t.name, {
        therapist_name: t.name,
        branch: t.branch,
        days_worked: 0,
        off_days: 0,
        total_hours: 0,
        formatted_time: '0h 0m',
        regular_hours: 0,
        overtime_hours: 0,
        formatted_overtime: '0h 0m',
        overtime_rate: OVERTIME_HOURLY_RATE,
        overtime_salary: 0,
        records: [],
      });
    });

    filtered.forEach((r) => {
      if (!groups.has(r.therapist_name)) {
        groups.set(r.therapist_name, {
          therapist_name: r.therapist_name,
          branch: r.branch,
          days_worked: 0,
          off_days: 0,
          total_hours: 0,
          formatted_time: '0h 0m',
          regular_hours: 0,
          overtime_hours: 0,
          formatted_overtime: '0h 0m',
          overtime_rate: OVERTIME_HOURLY_RATE,
          overtime_salary: 0,
          records: [],
        });
      }
      const g = groups.get(r.therapist_name);
      g.records.push(r);

      if (r.is_off_day) {
        g.off_days += 1;
      } else {
        const itemTotHours = r.total_hours !== undefined && r.total_hours !== null
          ? Number(r.total_hours)
          : (Number(r.hours) || 0) + (Number(r.minutes) || 0) / 60;

        if (itemTotHours > 0) {
          g.days_worked += 1;
          g.total_hours = +(g.total_hours + itemTotHours).toFixed(2);
          g.regular_hours = +(g.regular_hours + (Number(r.regular_hours) || 0)).toFixed(2);
          g.overtime_hours = +(g.overtime_hours + (Number(r.overtime_hours) || 0)).toFixed(2);
          g.overtime_salary = +(g.overtime_salary + (Number(r.overtime_salary) || 0)).toFixed(2);
        }
      }
    });

    const summaries = Array.from(groups.values());

    // Branch breakdown
    const branchTotals = {
      'Grand Baie': { hours: 0, formatted_time: '0h 0m', regular: 0, overtime: 0, formatted_overtime: '0h 0m', salary: 0, count: 0 },
      'Curepipe': { hours: 0, formatted_time: '0h 0m', regular: 0, overtime: 0, formatted_overtime: '0h 0m', salary: 0, count: 0 },
      'Moka': { hours: 0, formatted_time: '0h 0m', regular: 0, overtime: 0, formatted_overtime: '0h 0m', salary: 0, count: 0 },
    };

    let grandTotalHours = 0;
    let grandRegularHours = 0;
    let grandOvertimeHours = 0;
    let grandOvertimeSalary = 0;
    let grandDaysWorked = 0;

    summaries.forEach((s) => {
      const totMins = Math.round(s.total_hours * 60);
      s.formatted_time = `${Math.floor(totMins / 60)}h ${totMins % 60}m`;
      const otMins = Math.round(s.overtime_hours * 60);
      s.formatted_overtime = `${Math.floor(otMins / 60)}h ${otMins % 60}m`;

      grandTotalHours = +(grandTotalHours + s.total_hours).toFixed(2);
      grandRegularHours = +(grandRegularHours + s.regular_hours).toFixed(2);
      grandOvertimeHours = +(grandOvertimeHours + s.overtime_hours).toFixed(2);
      grandOvertimeSalary = +(grandOvertimeSalary + s.overtime_salary).toFixed(2);
      grandDaysWorked += s.days_worked;

      if (branchTotals[s.branch]) {
        branchTotals[s.branch].hours = +(branchTotals[s.branch].hours + s.total_hours).toFixed(2);
        branchTotals[s.branch].regular = +(branchTotals[s.branch].regular + s.regular_hours).toFixed(2);
        branchTotals[s.branch].overtime = +(branchTotals[s.branch].overtime + s.overtime_hours).toFixed(2);
        branchTotals[s.branch].salary = +(branchTotals[s.branch].salary + s.overtime_salary).toFixed(2);
        branchTotals[s.branch].count += 1;
      }
    });

    Object.keys(branchTotals).forEach((bName) => {
      const bt = branchTotals[bName];
      const totM = Math.round(bt.hours * 60);
      bt.formatted_time = `${Math.floor(totM / 60)}h ${totM % 60}m`;
      const otM = Math.round(bt.overtime * 60);
      bt.formatted_overtime = `${Math.floor(otM / 60)}h ${otM % 60}m`;
    });

    const grandTotM = Math.round(grandTotalHours * 60);
    const grandOtM = Math.round(grandOvertimeHours * 60);
    const grandTotals = {
      total_hours: grandTotalHours,
      formatted_time: `${Math.floor(grandTotM / 60)}h ${grandTotM % 60}m`,
      regular_hours: grandRegularHours,
      overtime_hours: grandOvertimeHours,
      formatted_overtime: `${Math.floor(grandOtM / 60)}h ${grandOtM % 60}m`,
      overtime_salary: grandOvertimeSalary,
      days_worked: grandDaysWorked,
    };
    });

    return {
      monthKey,
      branchFilter,
      therapists: summaries,
      branchTotals,
      grandTotals: {
        total_hours: grandTotalHours,
        regular_hours: grandRegularHours,
        overtime_hours: grandOvertimeHours,
        overtime_rate: OVERTIME_HOURLY_RATE,
        overtime_salary: grandOvertimeSalary,
        days_worked: grandDaysWorked,
        therapists_count: summaries.length,
      },
    };
  }

  // Clear all operational reports & audit logs for a fresh, clean start
  async clearAllData() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.THERAPIST_HOURS, JSON.stringify([]));
    broadcastDataChange('ALL_DATA_CLEARED', null);

    if (window.supabaseClient) {
      try {
        await window.supabaseClient
          .from('daily_reports')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        await window.supabaseClient
          .from('audit_logs')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        await window.supabaseClient
          .from('therapist_hours')
          .delete()
          .neq('id', 'placeholder');
      } catch (err) {
        console.warn('[AyurDesk] Supabase clean notice:', err);
      }
    }
    return true;
  }

  resetDataToSeed() {
    return this.clearAllData();
  }
}

window.dataStore = new DataStore();
