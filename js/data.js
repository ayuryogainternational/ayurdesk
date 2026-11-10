// ====================================================================
// AyurDesk - Data Management & Operations Store
// Organization: Ayuryoga International
// ====================================================================

const INITIAL_RECORDS = [
  { id: 'seed-1', report_date: '2026-10-25', total_enquiries: 29, total_responses: 29, total_confirmations: null, total_bookings: 11, tomorrow_bookings: null, whatsapp_calls_messages: 32, normal_calls: 15 },
  { id: 'seed-2', report_date: '2027-10-26', total_enquiries: 31, total_responses: 31, total_confirmations: null, total_bookings: 7,  tomorrow_bookings: null, whatsapp_calls_messages: 28, normal_calls: 28 }, // Anomaly record
  { id: 'seed-3', report_date: '2026-10-27', total_enquiries: 47, total_responses: 47, total_confirmations: null, total_bookings: 26, tomorrow_bookings: null, whatsapp_calls_messages: 34, normal_calls: 12 },
  { id: 'seed-4', report_date: '2026-10-28', total_enquiries: 37, total_responses: 37, total_confirmations: null, total_bookings: 28, tomorrow_bookings: null, whatsapp_calls_messages: 26, normal_calls: 11 },
  { id: 'seed-5', report_date: '2026-10-29', total_enquiries: 25, total_responses: 25, total_confirmations: null, total_bookings: 21, tomorrow_bookings: null, whatsapp_calls_messages: 48, normal_calls: 10 },
  { id: 'seed-6', report_date: '2026-10-30', total_enquiries: 34, total_responses: 34, total_confirmations: null, total_bookings: 12, tomorrow_bookings: null, whatsapp_calls_messages: 29, normal_calls: 7 },
  { id: 'seed-7', report_date: '2026-10-31', total_enquiries: 30, total_responses: 30, total_confirmations: null, total_bookings: 14, tomorrow_bookings: null, whatsapp_calls_messages: 20, normal_calls: 11 },
  { id: 'seed-8', report_date: '2026-11-01', total_enquiries: 42, total_responses: 42, total_confirmations: null, total_bookings: null, tomorrow_bookings: null, whatsapp_calls_messages: 42, normal_calls: 10 },
  { id: 'seed-9', report_date: '2026-11-02', total_enquiries: 42, total_responses: 42, total_confirmations: null, total_bookings: 14, tomorrow_bookings: null, whatsapp_calls_messages: 29, normal_calls: 12 },
  { id: 'seed-10', report_date: '2026-11-03', total_enquiries: 46, total_responses: 46, total_confirmations: null, total_bookings: 22, tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 25 },
  { id: 'seed-11', report_date: '2026-11-04', total_enquiries: 32, total_responses: 32, total_confirmations: null, total_bookings: 18, tomorrow_bookings: null, whatsapp_calls_messages: 27, normal_calls: 5 },
  { id: 'seed-12', report_date: '2026-11-05', total_enquiries: 27, total_responses: 27, total_confirmations: null, total_bookings: 10, tomorrow_bookings: null, whatsapp_calls_messages: 21, normal_calls: null },
  { id: 'seed-13', report_date: '2026-11-06', total_enquiries: 14, total_responses: 14, total_confirmations: null, total_bookings: 10, tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 7 },
  { id: 'seed-14', report_date: '2026-11-07', total_enquiries: 21, total_responses: 21, total_confirmations: null, total_bookings: 11, tomorrow_bookings: 28,   whatsapp_calls_messages: 15, normal_calls: 7 },
  { id: 'seed-15', report_date: '2026-11-08', total_enquiries: 24, total_responses: 24, total_confirmations: 13,   total_bookings: null, tomorrow_bookings: null, whatsapp_calls_messages: 21, normal_calls: 3 },
  { id: 'seed-16', report_date: '2026-11-09', total_enquiries: 2,  total_responses: 2,  total_confirmations: 2,    total_bookings: 2,    tomorrow_bookings: null, whatsapp_calls_messages: null, normal_calls: 1 },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-seed-1',
    table_name: 'daily_reports',
    record_id: 'seed-2',
    action: 'INSERT',
    old_data: null,
    new_data: { report_date: '2027-10-26', total_enquiries: 31, total_bookings: 7 },
    changed_fields: { event: 'created', note: 'Historical record imported. Flagged for verification.' },
    performed_by: 'system',
    performed_by_name: 'Database Migration Runner',
    performed_by_role: 'system',
    performed_at: '2026-11-09T08:00:00Z',
  },
  {
    id: 'log-seed-2',
    table_name: 'daily_reports',
    record_id: 'seed-16',
    action: 'INSERT',
    old_data: null,
    new_data: { report_date: '2026-11-09', total_enquiries: 2, total_bookings: 2 },
    changed_fields: { event: 'created' },
    performed_by: 'staff-1',
    performed_by_name: 'Shilpa',
    performed_by_role: 'staff',
    performed_at: '2026-11-09T18:30:00Z',
  }
];

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
  REPORTS: 'ayurdesk_reports_v2',
  AUDIT_LOGS: 'ayurdesk_audit_logs_v2',
  USERS: 'ayurdesk_users_v2',
};

class DataStore {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
  }

  // Get all reports sorted by report_date descending
  async getReports() {
    // If Supabase client configured, try remote fetch
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('daily_reports')
          .select('*')
          .order('report_date', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('[AyurDesk] Supabase fetch fallback to local storage:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = raw ? JSON.parse(raw) : [...INITIAL_RECORDS];
    return reports.sort((a, b) => b.report_date.localeCompare(a.report_date));
  }

  async getReportById(id) {
    const reports = await this.getReports();
    return reports.find((r) => r.id === id) || null;
  }

  async getReportByDate(date) {
    const reports = await this.getReports();
    return reports.find((r) => r.report_date === date) || null;
  }

  async saveReport(reportData) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    const reports = await this.getReports();

    // Check if report with same date exists
    const existingIndex = reports.findIndex((r) => r.report_date === reportData.report_date);

    if (existingIndex >= 0) {
      // Update
      const oldRecord = reports[existingIndex];
      const updated = {
        ...oldRecord,
        ...reportData,
        updated_by: user ? user.id : 'system',
        updated_at: new Date().toISOString(),
      };
      reports[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      await this.addAuditLog('UPDATE', 'daily_reports', updated.id, oldRecord, updated, {
        modified_fields: Object.keys(reportData),
      });

      // Try Supabase sync
      if (window.supabaseClient) {
        try {
          await window.supabaseClient
            .from('daily_reports')
            .update(reportData)
            .eq('id', updated.id);
        } catch (e) {
          console.warn('[AyurDesk] Supabase update notice:', e);
        }
      }

      return updated;
    } else {
      // Insert
      const newRecord = {
        id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        ...reportData,
        created_by: user ? user.id : 'system',
        created_at: new Date().toISOString(),
      };
      reports.unshift(newRecord);
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      await this.addAuditLog('INSERT', 'daily_reports', newRecord.id, null, newRecord, {
        event: 'created',
      });

      // Try Supabase sync
      if (window.supabaseClient) {
        try {
          await window.supabaseClient.from('daily_reports').insert([newRecord]);
        } catch (e) {
          console.warn('[AyurDesk] Supabase insert notice:', e);
        }
      }

      return newRecord;
    }
  }

  async updateReport(id, patch) {
    const user = window.authManager ? window.authManager.getCurrentUser() : null;
    const reports = await this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Record not found');

    const oldRecord = reports[index];
    const updated = {
      ...oldRecord,
      ...patch,
      updated_by: user ? user.id : 'system',
      updated_at: new Date().toISOString(),
    };
    reports[index] = updated;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    await this.addAuditLog('UPDATE', 'daily_reports', id, oldRecord, updated, patch);

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('daily_reports').update(patch).eq('id', id);
      } catch (e) {
        console.warn('[AyurDesk] Supabase update notice:', e);
      }
    }

    return updated;
  }

  async deleteReport(id) {
    const reports = await this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Record not found');

    const deletedRecord = reports[index];
    reports.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    await this.addAuditLog('DELETE', 'daily_reports', id, deletedRecord, null, {
      event: 'deleted',
    });

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('daily_reports').delete().eq('id', id);
      } catch (e) {
        console.warn('[AyurDesk] Supabase delete notice:', e);
      }
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
    const logs = raw ? JSON.parse(raw) : [...INITIAL_AUDIT_LOGS];
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

    records.forEach((r) => {
      if (r.total_enquiries !== null) enquiries += r.total_enquiries;
      if (r.total_responses !== null) responses += r.total_responses;
      if (r.total_confirmations !== null) confirmations += r.total_confirmations;
      if (r.total_bookings !== null) bookings += r.total_bookings;
      if (r.tomorrow_bookings !== null) tomorrow += r.tomorrow_bookings;
      if (r.whatsapp_calls_messages !== null) whatsapp += r.whatsapp_calls_messages;
      if (r.normal_calls !== null) normal += r.normal_calls;
    });

    const count = records.length;
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

  resetDataToSeed() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
}

window.dataStore = new DataStore();

