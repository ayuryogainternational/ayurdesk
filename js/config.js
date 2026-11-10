// ====================================================================
// AyurDesk - Core Configuration & Timezone Utilities
// Organization: Ayuryoga International
// Standard Timezone: Indian Ocean / Mauritius (UTC+04:00)
// ====================================================================

const CONFIG = {
  ORG_NAME: 'Ayuryoga International',
  APP_NAME: 'AyurDesk',
  TIMEZONE: 'Indian/Mauritius',
  SUPABASE_URL: 'https://obnjydkldmfbtkiomtux.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibmp5ZGtsZG1mYnRraW9tdHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxODU5MjMsImV4cCI6MjEwOTc2MTkyM30.02YxOLCa8QGz488B78oeG0_AqW_qhimK4rfC_AT0zos',
};

// Initialize Supabase Client if library is available
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[AyurDesk] Supabase initialization notice:', err);
  }
}

// Timezone & Date Formatting Utilities
function getTodayMauritiusDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CONFIG.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function formatDateTimeMauritius(dateOrIso, includeSeconds = true) {
  if (!dateOrIso) return '-';
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CONFIG.TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getReportGenerationTimestamp() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CONFIG.TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

window.CONFIG = CONFIG;
window.supabaseClient = supabaseClient;
window.getTodayMauritiusDate = getTodayMauritiusDate;
window.formatDateTimeMauritius = formatDateTimeMauritius;
window.formatDateDisplay = formatDateDisplay;
window.getReportGenerationTimestamp = getReportGenerationTimestamp;

