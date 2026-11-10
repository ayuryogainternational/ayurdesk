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
  THERAPISTS: 'ayurdesk_therapists_v2',
  THERAPIST_RECORDS: 'ayurdesk_therapist_records_v2',
};

const USER_PROFILES_MAP = {
  '36c696a3-bd86-46e2-8ff8-06bec48f37f4': { full_name: 'Owner / Administrator', role: 'admin' },
  'ad5cf6a7-175e-4e41-a97a-a2621e1fe2df': { full_name: 'Shilpa', role: 'staff' },
  'b110aeeb-dc4d-42d5-b1fb-6eb4dece1267': { full_name: 'Gokul', role: 'staff' },
  '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3': { full_name: 'Dr. Vishnu', role: 'therapist' },
  'therapist-priya-uuid': { full_name: 'Priya Nair', role: 'therapist' },
  'staff-1': { full_name: 'Shilpa', role: 'staff' },
  'staff-2': { full_name: 'Gokul', role: 'staff' },
  'admin-1': { full_name: 'Owner / Administrator', role: 'admin' },
};

const INITIAL_THERAPISTS = [
  {
    id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    full_name: 'Dr. Vishnu',
    email: 'vishnu@ayuryoga.com',
    specialty: 'Senior Ayurvedic Therapist & Panchakarma Specialist',
    phone: '+230 5250 8891',
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'therapist-priya-uuid',
    full_name: 'Priya Nair',
    email: 'priya@ayuryoga.com',
    specialty: 'Marma Therapy & Abhyanga Specialist',
    phone: '+230 5250 8892',
    created_at: '2026-10-15T08:00:00Z',
  },
];

function calculateShiftHours(inStr, outStr) {
  if (!inStr || !outStr) return 0;
  if (inStr.includes(':') && outStr.includes(':')) {
    const [inH, inM] = inStr.split(':').map(Number);
    const [outH, outM] = outStr.split(':').map(Number);
    if (!isNaN(inH) && !isNaN(outH)) {
      const startMins = inH * 60 + (inM || 0);
      const endMins = outH * 60 + (outM || 0);
      if (endMins >= startMins) {
        return +( (endMins - startMins) / 60 ).toFixed(2);
      }
    }
  }
  const startMs = new Date(inStr).getTime();
  const endMs = new Date(outStr).getTime();
  if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
    return +( (endMs - startMs) / (1000 * 60 * 60) ).toFixed(2);
  }
  return 0;
}

function calculateTherapistDailyTotals(rec) {
  if (rec.is_off_day) {
    return {
      shift_1_hours: 0,
      shift_2_hours: 0,
      total_working_hours: 0,
      regular_hours: 0,
      overtime_hours: 0,
      is_overtime: false,
      overtime_rate: 75,
      overtime_salary: 0,
      works_count: 0,
      total_treatment_hours: 0,
    };
  }

  const s1 = calculateShiftHours(rec.check_in_1, rec.check_out_1);
  const s2 = calculateShiftHours(rec.check_in_2, rec.check_out_2);
  const total = +(s1 + s2).toFixed(2);

  const regular = Math.min(5.0, total);
  const overtime = +(Math.max(0, total - 5.0)).toFixed(2);
  const isOvertime = total > 5.0;
  const rate = 75;
  const salary = +(overtime * rate).toFixed(2);

  const works = Array.isArray(rec.works) ? rec.works : [];
  const worksCount = works.length;
  const treatmentHours = +works.reduce((acc, w) => acc + (Number(w.duration_hours) || 0), 0).toFixed(2);

  return {
    shift_1_hours: s1,
    shift_2_hours: s2,
    total_working_hours: total,
    regular_hours: regular,
    overtime_hours: overtime,
    is_overtime: isOvertime,
    overtime_rate: rate,
    overtime_salary: salary,
    works_count: worksCount,
    total_treatment_hours: treatmentHours,
  };
}

const INITIAL_THERAPIST_RECORDS = [
  // Dr. Vishnu Records
  {
    id: 'th-rec-v1',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-01',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:00',
    check_out_2: '18:00',
    shift_1_hours: 4.0,
    shift_2_hours: 4.0,
    total_working_hours: 8.0,
    regular_hours: 5.0,
    overtime_hours: 3.0,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 225.00,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'w-1', patient_name: 'Jean Dupont', treatment_type: 'Abhyanga (Herbal Full Body Massage)', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Vata pacifying sesame oil' },
      { id: 'w-2', patient_name: 'Claire Martin', treatment_type: 'Shirodhara (Medicated Oil Therapy)', start_time: '10:45', end_time: '11:45', duration_hours: 1.0, notes: 'Stress reduction therapy' },
      { id: 'w-3', patient_name: 'Pierre Moreau', treatment_type: 'Navara Kizhi (Rejuvenation Bolus)', start_time: '14:30', end_time: '16:00', duration_hours: 1.5, notes: 'Joint strengthening' },
    ],
    updated_at: '2026-11-01T18:00:00Z',
  },
  {
    id: 'th-rec-v2',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-02',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '09:00',
    check_out_1: '14:00',
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 5.0,
    shift_2_hours: 0,
    total_working_hours: 5.0,
    regular_hours: 5.0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 2,
    total_treatment_hours: 2.25,
    works: [
      { id: 'w-4', patient_name: 'Sophie Blanc', treatment_type: 'Udwarthanam (Herbal Powder Scrub)', start_time: '09:30', end_time: '10:45', duration_hours: 1.25, notes: 'Metabolic stimulation' },
      { id: 'w-5', patient_name: 'David Lee', treatment_type: 'Kati Vasti (Lumbar Care)', start_time: '11:15', end_time: '12:15', duration_hours: 1.0, notes: 'Lower back relief' },
    ],
    updated_at: '2026-11-02T14:00:00Z',
  },
  {
    id: 'th-rec-v3',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-03',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:30',
    check_out_2: '17:30',
    shift_1_hours: 4.0,
    shift_2_hours: 3.0,
    total_working_hours: 7.0,
    regular_hours: 5.0,
    overtime_hours: 2.0,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 150.00,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'w-6', patient_name: 'Robert Brown', treatment_type: 'Nasyam Therapy', start_time: '09:00', end_time: '10:00', duration_hours: 1.0, notes: 'Sinus clearing' },
      { id: 'w-7', patient_name: 'Elena Rostova', treatment_type: 'Abhyanga with Herbal Steam', start_time: '10:30', end_time: '12:00', duration_hours: 1.5, notes: 'Detoxifying treatment' },
      { id: 'w-8', patient_name: 'Jacques Petit', treatment_type: 'Janu Vasti (Knee Therapy)', start_time: '15:00', end_time: '16:15', duration_hours: 1.25, notes: 'Knee inflammation care' },
    ],
    updated_at: '2026-11-03T17:30:00Z',
  },
  {
    id: 'th-rec-v4',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-04',
    is_off_day: true,
    off_day_reason: 'Weekly Off',
    check_in_1: null,
    check_out_1: null,
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 0,
    shift_2_hours: 0,
    total_working_hours: 0,
    regular_hours: 0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 0,
    total_treatment_hours: 0,
    works: [],
    updated_at: '2026-11-04T08:00:00Z',
  },
  {
    id: 'th-rec-v5',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-05',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '13:00',
    check_in_2: '14:30',
    check_out_2: '17:30',
    shift_1_hours: 4.5,
    shift_2_hours: 3.0,
    total_working_hours: 7.5,
    regular_hours: 5.0,
    overtime_hours: 2.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 187.50,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'w-9', patient_name: 'Julie Dupuis', treatment_type: 'Shirodhara Therapy', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Warm herbal decoction' },
      { id: 'w-10', patient_name: 'Michel Roy', treatment_type: 'Pizhichil Oil Bath Therapy', start_time: '10:45', end_time: '12:15', duration_hours: 1.5, notes: 'Royal ayurvedic treatment' },
      { id: 'w-11', patient_name: 'Anais Petit', treatment_type: 'Mukha Lepam (Ayurvedic Facial)', start_time: '15:00', end_time: '16:00', duration_hours: 1.0, notes: 'Herbal glow paste' },
    ],
    updated_at: '2026-11-05T17:30:00Z',
  },
  {
    id: 'th-rec-v6',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-06',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '09:00',
    check_out_1: '14:00',
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 5.0,
    shift_2_hours: 0,
    total_working_hours: 5.0,
    regular_hours: 5.0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 2,
    total_treatment_hours: 2.5,
    works: [
      { id: 'w-12', patient_name: 'Carlos Mendez', treatment_type: 'Abhyanga Full Body', start_time: '09:30', end_time: '10:45', duration_hours: 1.25, notes: 'Muscle tone' },
      { id: 'w-13', patient_name: 'Emma Watson', treatment_type: 'Kizhi Herbal Therapy', start_time: '11:15', end_time: '12:30', duration_hours: 1.25, notes: 'Herbal bundle fomentation' },
    ],
    updated_at: '2026-11-06T14:00:00Z',
  },
  {
    id: 'th-rec-v7',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-07',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '13:30',
    check_out_2: '18:00',
    shift_1_hours: 4.0,
    shift_2_hours: 4.5,
    total_working_hours: 8.5,
    regular_hours: 5.0,
    overtime_hours: 3.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 262.50,
    works_count: 4,
    total_treatment_hours: 4.75,
    works: [
      { id: 'w-14', patient_name: 'Liam Neeson', treatment_type: 'Navara Kizhi Rejuvenation', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Neuromuscular nutrition' },
      { id: 'w-15', patient_name: 'Hannah Abbott', treatment_type: 'Shirodhara Medicated Oil', start_time: '10:45', end_time: '11:45', duration_hours: 1.0, notes: 'Deep calm therapy' },
      { id: 'w-16', patient_name: 'Thomas Mueller', treatment_type: 'Abhyanga with Medicated Steam', start_time: '14:00', end_time: '15:30', duration_hours: 1.5, notes: 'Circulation booster' },
      { id: 'w-17', patient_name: 'Leila Benali', treatment_type: 'Kati Vasti Therapy', start_time: '16:00', end_time: '17:00', duration_hours: 1.0, notes: 'Lower spine relaxation' },
    ],
    updated_at: '2026-11-07T18:00:00Z',
  },
  {
    id: 'th-rec-v8',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-08',
    is_off_day: true,
    off_day_reason: 'Weekly Off',
    check_in_1: null,
    check_out_1: null,
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 0,
    shift_2_hours: 0,
    total_working_hours: 0,
    regular_hours: 0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 0,
    total_treatment_hours: 0,
    works: [],
    updated_at: '2026-11-08T08:00:00Z',
  },
  {
    id: 'th-rec-v9',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-09',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '09:00',
    check_out_1: '15:30',
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 6.5,
    shift_2_hours: 0,
    total_working_hours: 6.5,
    regular_hours: 5.0,
    overtime_hours: 1.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 112.50,
    works_count: 3,
    total_treatment_hours: 3.5,
    works: [
      { id: 'w-18', patient_name: 'Gilles Simon', treatment_type: 'Pizhichil Oil Bath', start_time: '09:30', end_time: '11:00', duration_hours: 1.5, notes: 'Full soothing therapy' },
      { id: 'w-19', patient_name: 'Monique Laurent', treatment_type: 'Shirodhara Therapy', start_time: '11:30', end_time: '12:30', duration_hours: 1.0, notes: 'Insomnia relief' },
      { id: 'w-20', patient_name: 'Samir Ghosh', treatment_type: 'Abhyanga Massage', start_time: '13:30', end_time: '14:30', duration_hours: 1.0, notes: 'Vital energy flow' },
    ],
    updated_at: '2026-11-09T15:30:00Z',
  },
  {
    id: 'th-rec-v10',
    therapist_id: '5a06a587-9d74-4de1-bc70-8ee5f9de5ac3',
    therapist_name: 'Dr. Vishnu',
    therapist_email: 'vishnu@ayuryoga.com',
    record_date: '2026-11-10',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:00',
    check_out_2: '18:30',
    shift_1_hours: 4.0,
    shift_2_hours: 4.5,
    total_working_hours: 8.5,
    regular_hours: 5.0,
    overtime_hours: 3.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 262.50,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'w-21', patient_name: 'Paul Girard', treatment_type: 'Abhyanga Full Body Massage', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Warm Dhanwantharam thailam' },
      { id: 'w-22', patient_name: 'Nina Patel', treatment_type: 'Shirodhara Treatment', start_time: '10:45', end_time: '11:45', duration_hours: 1.0, notes: 'Ksheeradhara with herbal milk' },
      { id: 'w-23', patient_name: 'Bernard Arnault', treatment_type: 'Navara Kizhi Bolus Therapy', start_time: '15:00', end_time: '16:30', duration_hours: 1.5, notes: 'Medicated rice bolus therapy' },
    ],
    updated_at: '2026-11-10T18:30:00Z',
  },

  // Priya Nair Records
  {
    id: 'th-rec-p1',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-01',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '09:00',
    check_out_1: '15:00',
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 6.0,
    shift_2_hours: 0,
    total_working_hours: 6.0,
    regular_hours: 5.0,
    overtime_hours: 1.0,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 75.00,
    works_count: 2,
    total_treatment_hours: 2.5,
    works: [
      { id: 'wp-1', patient_name: 'Lucas Bernard', treatment_type: 'Marma Therapy & Abhyanga', start_time: '09:30', end_time: '11:00', duration_hours: 1.5, notes: 'Energy points stimulation' },
      { id: 'wp-2', patient_name: 'Chloe Dubois', treatment_type: 'Udwarthanam Powder Therapy', start_time: '11:30', end_time: '12:30', duration_hours: 1.0, notes: 'Lymphatic drainage' },
    ],
    updated_at: '2026-11-01T15:00:00Z',
  },
  {
    id: 'th-rec-p2',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-02',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:00',
    check_out_2: '17:30',
    shift_1_hours: 4.0,
    shift_2_hours: 3.5,
    total_working_hours: 7.5,
    regular_hours: 5.0,
    overtime_hours: 2.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 187.50,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'wp-3', patient_name: 'Zoe Lambert', treatment_type: 'Abhyanga Full Body', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'General wellness' },
      { id: 'wp-4', patient_name: 'Antoine Roux', treatment_type: 'Kizhi Herbal Therapy', start_time: '10:45', end_time: '12:00', duration_hours: 1.25, notes: 'Stiff back relief' },
      { id: 'wp-5', patient_name: 'Nathalie Henry', treatment_type: 'Shirodhara Oil Therapy', start_time: '14:30', end_time: '15:45', duration_hours: 1.25, notes: 'Nervous system soothing' },
    ],
    updated_at: '2026-11-02T17:30:00Z',
  },
  {
    id: 'th-rec-p3',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-03',
    is_off_day: true,
    off_day_reason: 'Weekly Off',
    check_in_1: null,
    check_out_1: null,
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 0,
    shift_2_hours: 0,
    total_working_hours: 0,
    regular_hours: 0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 0,
    total_treatment_hours: 0,
    works: [],
    updated_at: '2026-11-03T08:00:00Z',
  },
  {
    id: 'th-rec-p4',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-04',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '09:00',
    check_out_1: '14:00',
    check_in_2: null,
    check_out_2: null,
    shift_1_hours: 5.0,
    shift_2_hours: 0,
    total_working_hours: 5.0,
    regular_hours: 5.0,
    overtime_hours: 0,
    is_overtime: false,
    overtime_rate: 75,
    overtime_salary: 0.00,
    works_count: 2,
    total_treatment_hours: 2.25,
    works: [
      { id: 'wp-6', patient_name: 'Fabien Morel', treatment_type: 'Mukha Lepam Ayurvedic Facial', start_time: '09:30', end_time: '10:30', duration_hours: 1.0, notes: 'Kumkumadi oil' },
      { id: 'wp-7', patient_name: 'Camille Leroy', treatment_type: 'Abhyanga Full Body Massage', start_time: '11:00', end_time: '12:15', duration_hours: 1.25, notes: 'Deep relaxation' },
    ],
    updated_at: '2026-11-04T14:00:00Z',
  },
  {
    id: 'th-rec-p5',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-05',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:00',
    check_out_2: '18:00',
    shift_1_hours: 4.0,
    shift_2_hours: 4.0,
    total_working_hours: 8.0,
    regular_hours: 5.0,
    overtime_hours: 3.0,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 225.00,
    works_count: 3,
    total_treatment_hours: 3.75,
    works: [
      { id: 'wp-8', patient_name: 'Isabelle Fabre', treatment_type: 'Kizhi Herbal Treatment', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Joint therapy' },
      { id: 'wp-9', patient_name: 'Marc Lefebvre', treatment_type: 'Shirodhara Medicated Therapy', start_time: '10:45', end_time: '11:45', duration_hours: 1.0, notes: 'Clarity formulation' },
      { id: 'wp-10', patient_name: 'Lucie Guerin', treatment_type: 'Abhyanga Body Therapy', start_time: '14:30', end_time: '16:00', duration_hours: 1.5, notes: 'Full recovery oil' },
    ],
    updated_at: '2026-11-05T18:00:00Z',
  },
  {
    id: 'th-rec-p6',
    therapist_id: 'therapist-priya-uuid',
    therapist_name: 'Priya Nair',
    therapist_email: 'priya@ayuryoga.com',
    record_date: '2026-11-10',
    is_off_day: false,
    off_day_reason: null,
    check_in_1: '08:30',
    check_out_1: '12:30',
    check_in_2: '14:00',
    check_out_2: '17:30',
    shift_1_hours: 4.0,
    shift_2_hours: 3.5,
    total_working_hours: 7.5,
    regular_hours: 5.0,
    overtime_hours: 2.5,
    is_overtime: true,
    overtime_rate: 75,
    overtime_salary: 187.50,
    works_count: 2,
    total_treatment_hours: 2.5,
    works: [
      { id: 'wp-11', patient_name: 'Serge Mercier', treatment_type: 'Marma Energy Therapy', start_time: '09:00', end_time: '10:15', duration_hours: 1.25, notes: 'Vigour stimulation' },
      { id: 'wp-12', patient_name: 'Elise Colin', treatment_type: 'Abhyanga Full Body Therapy', start_time: '14:30', end_time: '15:45', duration_hours: 1.25, notes: 'Relaxation' },
    ],
    updated_at: '2026-11-10T17:30:00Z',
  },
];

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
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THERAPISTS)) {
      localStorage.setItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(INITIAL_THERAPISTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THERAPIST_RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.THERAPIST_RECORDS, JSON.stringify(INITIAL_THERAPIST_RECORDS));
    }
  }

  // Get all reports sorted by report_date descending with intelligent sync
  async getReports() {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    let localReports = raw ? JSON.parse(raw) : [...INITIAL_RECORDS];

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
    const reports = raw ? JSON.parse(raw) : [...INITIAL_RECORDS];

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
    const reports = raw ? JSON.parse(raw) : [...INITIAL_RECORDS];
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
    const reports = raw ? JSON.parse(raw) : [...INITIAL_RECORDS];
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

  // ====================================================================
  // THERAPIST OPERATIONS & MONTHLY REPORTING
  // ====================================================================

  async getTherapists() {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPISTS);
    return raw ? JSON.parse(raw) : [...INITIAL_THERAPISTS];
  }

  async getTherapistRecords(filter = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST_RECORDS);
    let records = raw ? JSON.parse(raw) : [...INITIAL_THERAPIST_RECORDS];

    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('therapist_attendance')
          .select('*')
          .order('record_date', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const map = new Map();
          records.forEach((r) => map.set(`${r.therapist_id}_${r.record_date}`, r));
          data.forEach((remote) => {
            const key = `${remote.therapist_id}_${remote.record_date}`;
            map.set(key, {
              ...(map.get(key) || {}),
              ...remote,
            });
          });
          records = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.THERAPIST_RECORDS, JSON.stringify(records));
        }
      } catch (e) {
        // Fallback to local storage
      }
    }

    if (filter.therapist_id) {
      records = records.filter((r) => r.therapist_id === filter.therapist_id);
    }
    if (filter.therapist_email) {
      records = records.filter(
        (r) => (r.therapist_email || '').toLowerCase() === filter.therapist_email.toLowerCase()
      );
    }
    if (filter.month) {
      // YYYY-MM
      records = records.filter((r) => (r.record_date || '').startsWith(filter.month));
    }
    if (filter.date) {
      // YYYY-MM-DD
      records = records.filter((r) => r.record_date === filter.date);
    }

    return records.sort((a, b) => b.record_date.localeCompare(a.record_date));
  }

  async getTherapistRecordForDate(therapistId, dateStr) {
    const records = await this.getTherapistRecords();
    let found = records.find(
      (r) => (r.therapist_id === therapistId || r.therapist_email === therapistId) && r.record_date === dateStr
    );

    if (!found) {
      const therapists = await this.getTherapists();
      const therapist = therapists.find((t) => t.id === therapistId || t.email === therapistId);
      const user = window.authManager ? window.authManager.getCurrentUser() : null;

      found = {
        id: 'th-rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        therapist_id: therapist?.id || therapistId,
        therapist_name: therapist?.full_name || user?.full_name || 'Dr. Vishnu',
        therapist_email: therapist?.email || user?.email || 'vishnu@ayuryoga.com',
        record_date: dateStr,
        is_off_day: false,
        off_day_reason: null,
        check_in_1: null,
        check_out_1: null,
        check_in_2: null,
        check_out_2: null,
        shift_1_hours: 0,
        shift_2_hours: 0,
        total_working_hours: 0,
        regular_hours: 0,
        overtime_hours: 0,
        is_overtime: false,
        overtime_rate: 75,
        overtime_salary: 0,
        works_count: 0,
        total_treatment_hours: 0,
        works: [],
        updated_at: new Date().toISOString(),
      };
    }

    return found;
  }

  async saveTherapistRecord(rec) {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST_RECORDS);
    let records = raw ? JSON.parse(raw) : [...INITIAL_THERAPIST_RECORDS];

    // Compute live hours, overtime, and treatment totals
    const calculated = calculateTherapistDailyTotals(rec);
    const finalRecord = {
      ...rec,
      ...calculated,
      updated_at: new Date().toISOString(),
    };

    const index = records.findIndex(
      (r) => r.therapist_id === finalRecord.therapist_id && r.record_date === finalRecord.record_date
    );

    if (index >= 0) {
      records[index] = finalRecord;
    } else {
      records.unshift(finalRecord);
    }

    localStorage.setItem(STORAGE_KEYS.THERAPIST_RECORDS, JSON.stringify(records));
    broadcastDataChange('THERAPIST_RECORD_SAVED', finalRecord);

    if (window.supabaseClient) {
      window.supabaseClient
        .from('therapist_attendance')
        .upsert([finalRecord], { onConflict: 'therapist_id,record_date' })
        .then(() => {})
        .catch((e) => console.warn('[AyurDesk] Supabase therapist attendance notice:', e));
    }

    return finalRecord;
  }

  async addTherapistWork(therapistId, dateStr, workItem) {
    const rec = await this.getTherapistRecordForDate(therapistId, dateStr);
    const works = Array.isArray(rec.works) ? [...rec.works] : [];

    const newWork = {
      id: 'work-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      patient_name: workItem.patient_name || 'Patient',
      treatment_type: workItem.treatment_type || 'Ayurvedic Treatment',
      start_time: workItem.start_time || '09:00',
      end_time: workItem.end_time || '10:00',
      duration_hours: Number(workItem.duration_hours) || 1.0,
      notes: workItem.notes || '',
    };

    works.push(newWork);
    rec.works = works;
    return await this.saveTherapistRecord(rec);
  }

  async deleteTherapistWork(therapistId, dateStr, workId) {
    const rec = await this.getTherapistRecordForDate(therapistId, dateStr);
    const works = (rec.works || []).filter((w) => w.id !== workId);
    rec.works = works;
    return await this.saveTherapistRecord(rec);
  }

  async markTherapistOffDay(therapistId, dateStr, isOffDay, reason = 'Weekly Off') {
    const rec = await this.getTherapistRecordForDate(therapistId, dateStr);
    rec.is_off_day = !!isOffDay;
    rec.off_day_reason = isOffDay ? reason : null;
    if (isOffDay) {
      rec.check_in_1 = null;
      rec.check_out_1 = null;
      rec.check_in_2 = null;
      rec.check_out_2 = null;
    }
    return await this.saveTherapistRecord(rec);
  }

  // Calculate Monthly Therapist Report for Admin
  // Grouped by therapist with respected details and grand combined total
  calculateTherapistMonthlyReport(records, monthKey) {
    // monthKey: "YYYY-MM" (e.g. "2026-11")
    const filtered = records.filter((r) => (r.record_date || '').startsWith(monthKey));

    const groups = new Map();

    filtered.forEach((r) => {
      const key = r.therapist_id || r.therapist_email;
      if (!groups.has(key)) {
        groups.set(key, {
          therapist_id: r.therapist_id,
          therapist_name: r.therapist_name || 'Therapist',
          therapist_email: r.therapist_email || '',
          days_worked: 0,
          off_days: 0,
          total_works: 0,
          total_working_hours: 0,
          total_regular_hours: 0,
          total_overtime_hours: 0,
          overtime_rate: 75,
          total_overtime_salary: 0,
          daily_records: [],
        });
      }

      const grp = groups.get(key);
      grp.daily_records.push(r);

      if (r.is_off_day) {
        grp.off_days += 1;
      } else {
        if (r.total_working_hours > 0) {
          grp.days_worked += 1;
        }
        grp.total_works += r.works_count || (r.works ? r.works.length : 0);
        grp.total_working_hours = +(grp.total_working_hours + (r.total_working_hours || 0)).toFixed(2);
        grp.total_regular_hours = +(grp.total_regular_hours + (r.regular_hours || 0)).toFixed(2);
        grp.total_overtime_hours = +(grp.total_overtime_hours + (r.overtime_hours || 0)).toFixed(2);
        grp.total_overtime_salary = +(grp.total_overtime_salary + (r.overtime_salary || 0)).toFixed(2);
      }
    });

    const therapistSummaries = Array.from(groups.values()).sort((a, b) =>
      a.therapist_name.localeCompare(b.therapist_name)
    );

    // Grand Combined Totals across all therapists
    let combinedDaysWorked = 0;
    let combinedOffDays = 0;
    let combinedWorks = 0;
    let combinedHours = 0;
    let combinedRegular = 0;
    let combinedOvertimeHours = 0;
    let combinedOvertimeSalary = 0;

    therapistSummaries.forEach((s) => {
      combinedDaysWorked += s.days_worked;
      combinedOffDays += s.off_days;
      combinedWorks += s.total_works;
      combinedHours = +(combinedHours + s.total_working_hours).toFixed(2);
      combinedRegular = +(combinedRegular + s.total_regular_hours).toFixed(2);
      combinedOvertimeHours = +(combinedOvertimeHours + s.total_overtime_hours).toFixed(2);
      combinedOvertimeSalary = +(combinedOvertimeSalary + s.total_overtime_salary).toFixed(2);
    });

    return {
      monthKey,
      therapists: therapistSummaries,
      combined: {
        active_therapists: therapistSummaries.length,
        days_worked: combinedDaysWorked,
        off_days: combinedOffDays,
        total_works: combinedWorks,
        total_working_hours: combinedHours,
        total_regular_hours: combinedRegular,
        total_overtime_hours: combinedOvertimeHours,
        overtime_rate: 75,
        total_overtime_salary: combinedOvertimeSalary,
      },
    };
  }

  // Calculate Daily Analysis for Therapists on a Given Day
  calculateTherapistDailyAnalysis(records, dateKey) {
    const dayRecords = records.filter((r) => r.record_date === dateKey);

    let activeCount = 0;
    let offDayCount = 0;
    let totalHours = 0;
    let totalOvertimeHours = 0;
    let totalOvertimeSalary = 0;
    let totalWorks = 0;

    dayRecords.forEach((r) => {
      if (r.is_off_day) {
        offDayCount += 1;
      } else {
        if (r.total_working_hours > 0) activeCount += 1;
        totalHours = +(totalHours + (r.total_working_hours || 0)).toFixed(2);
        totalOvertimeHours = +(totalOvertimeHours + (r.overtime_hours || 0)).toFixed(2);
        totalOvertimeSalary = +(totalOvertimeSalary + (r.overtime_salary || 0)).toFixed(2);
        totalWorks += r.works_count || (r.works ? r.works.length : 0);
      }
    });

    return {
      dateKey,
      therapist_records: dayRecords,
      summary: {
        active_therapists: activeCount,
        off_day_therapists: offDayCount,
        total_working_hours: totalHours,
        total_overtime_hours: totalOvertimeHours,
        total_overtime_salary: totalOvertimeSalary,
        total_works: totalWorks,
      },
    };
  }

  resetDataToSeed() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(INITIAL_THERAPISTS));
    localStorage.setItem(STORAGE_KEYS.THERAPIST_RECORDS, JSON.stringify(INITIAL_THERAPIST_RECORDS));
  }
}

window.dataStore = new DataStore();

