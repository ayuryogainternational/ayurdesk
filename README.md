# AyurDesk – Daily Operations Management System
### Ayuryoga International

AyurDesk is a production-grade daily operations tracking, analytics, and reporting platform designed specifically for **Ayuryoga International**. It tracks inbound inquiries, responses, bookings, confirmations, and telephony communications with strict PostgreSQL Row Level Security (RLS), an immutable audit ledger, server-side authorized report exports (Excel & PDF), and Indian Ocean/Mauritius timezone synchronization.

---

## 1. Tech Stack & Architecture

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React icons
- **State & Routing**: React Router v7, React Context (`AuthContext`, `ToastContext`)
- **Backend & Database**: Supabase PostgreSQL, Supabase Authentication (JWT, bcrypt/blowfish hashing), Row Level Security (RLS), PL/pgSQL Triggers
- **Privileged Backend**: Supabase Edge Function (`export-reports`) enforcing server-side admin role check
- **Analytics & Data Visualizations**: Recharts (Turnaround area trends, capacity bar charts, channel distribution)
- **Report Export Engine**:
  - **ExcelJS**: Branded `.xlsx` workbooks with `#103B37` headers, white bold typography, thin grid borders, totals row, and auto-adjusted column widths.
  - **jsPDF + jspdf-autotable**: Landscape A4 `.pdf` documents with Ayuryoga International letterhead, period metadata, fitted columns, blank cell formatting (`-`), and confidentiality footers.
- **Testing**: Vitest, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM (20 unit & role permission tests passing)
- **Deployment**: Vercel (`vercel.json` SPA routing) + Supabase Cloud

---

## 2. Design System & Aesthetic

- **Primary Forest Green**: `#103B37`
- **Secondary Teal**: `#23675B`
- **Warm Off-White Background**: `#F7F7EF`
- **Pure White**: `#FFFFFF`
- **Typography**: Plus Jakarta Sans, Inter, system sans-serif
- **Philosophy**: Clean, premium Ayurvedic business dashboard without gimmicky cartoon graphics.

---

## 3. User Roles & Security Matrix

| Capability | Staff (Shilpa) | Staff (Gokul) | Owner / Admin |
| :--- | :---: | :---: | :---: |
| Authenticate & Logout |  |  |  |
| Mandatory Password Change on First Login |  |  |  |
| View Daily Records & KPI Overview |  |  |  |
| Create New Daily Operational Records |  |  |  |
| Edit / Overwrite Daily Records |  *(Within 24 Hours Only)* |  *(Within 24 Hours Only)* |  *(Anytime)* |
| Edit Records After 24 Hours |  *(Locked after 24h)* |  *(Locked after 24h)* |  |
| Delete Records |  |  |  |
| Export Excel / PDF Reports |  *(403 Forbidden)* |  *(403 Forbidden)* |  |
| View Audit History Ledger |  |  |  |
| Manage Staff Users & Roles |  |  |  |

---

## 4. Database Schema & Row Level Security

### Tables
1. **`public.profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `email TEXT NOT NULL`
   - `full_name TEXT NOT NULL`
   - `role TEXT NOT NULL CHECK (role IN ('admin', 'staff'))`
   - `must_change_password BOOLEAN NOT NULL DEFAULT true`
   - `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

2. **`public.daily_reports`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `report_date DATE UNIQUE NOT NULL`
   - `total_enquiries INTEGER CHECK (total_enquiries IS NULL OR total_enquiries >= 0)`
   - `total_responses INTEGER CHECK (total_responses IS NULL OR total_responses >= 0)`
   - `total_confirmations INTEGER CHECK (total_confirmations IS NULL OR total_confirmations >= 0)`
   - `total_bookings INTEGER CHECK (total_bookings IS NULL OR total_bookings >= 0)`
   - `tomorrow_bookings INTEGER CHECK (tomorrow_bookings IS NULL OR tomorrow_bookings >= 0)`
   - `whatsapp_calls_messages INTEGER CHECK (whatsapp_calls_messages IS NULL OR whatsapp_calls_messages >= 0)`
   - `normal_calls INTEGER CHECK (normal_calls IS NULL OR normal_calls >= 0)`
   - `created_by UUID REFERENCES auth.users(id)`
   - `updated_by UUID REFERENCES auth.users(id)`
   - `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

3. **`public.audit_logs`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `table_name TEXT NOT NULL`
   - `record_id UUID NOT NULL`
   - `action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))`
   - `old_data JSONB`, `new_data JSONB`, `changed_fields JSONB`
   - `performed_by UUID REFERENCES auth.users(id)`
   - `performed_by_name TEXT`, `performed_by_role TEXT`
   - `performed_at TIMESTAMPTZ NOT NULL DEFAULT now()`

---

## 5. Executing SQL Migrations in Supabase

You can execute the migrations in Supabase using either the **Supabase Dashboard SQL Editor** or the automated runner script.

### Method A: Supabase Dashboard SQL Editor (Recommended)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/full_setup.sql`.
4. Copy and paste the entire script into the SQL Editor and click **Run**.
   - This idempotently creates all tables, indexes, security helper functions, triggers, RLS policies, and automatically imports the 16 historical records.

### Method B: Migration Runner Script via CLI
Run the bundled Node/TypeScript migration runner with your Supabase direct connection string:
```bash
npx tsx scripts/run-migrations.ts "postgresql://postgres:[YOUR-DB-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

---

## 6. Secure Account Provisioning

Passwords are **never** hardcoded into version control or migrations.

### Method A: Interactive CLI Script
Run the account provisioning utility:
```bash
npx tsx scripts/provision-users.ts
```
The script will prompt for:
- Supabase Project URL & Service Role Key
- Email addresses for:
  1. **Shilpa** (Staff)
  2. **Gokul** (Staff)
  3. **Owner / Admin** (Administrator)
- Temporary password (minimum 8 characters)

All 3 accounts are provisioned with `must_change_password: true`. When each user logs in for the first time, a mandatory security modal intercepts their session and requires setting a private password before accessing the system.

### Method B: SQL Editor Provisioning Template
Open `supabase/provision_users_template.sql`, fill in the email addresses and temporary password, and execute it in the Supabase SQL Editor.

---

## 7. Initial Historical Seed Data & Anomaly Verification

The 16 historical operational records have been imported.

### Date `2027-10-26` Notice:
The source data includes a record with date **`26-10-2027`**, while surrounding dates are in October–November 2026.
- In strict adherence to operational compliance, this date is **preserved as entered** (`2027-10-26`) and **not silently altered**.
- An **Audit Anomaly Badge** is displayed in the Dashboard and Records Explorer alerting administrators of a potential year typo, enabling them to verify or modify the record under full audit tracking.

---

## 8. Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ayurdesk
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase URL and Anon Key in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 9. Multi-Page Website (Pure HTML, CSS, JavaScript)

AyurDesk also includes a native, zero-build multi-page website architecture that can be hosted on any static hosting provider (GitHub Pages, Netlify, Apache, Nginx, Vercel) or opened directly in any modern web browser:

### Multi-Page Structure
- [`index.html`](file:///a:/PROJECTS/ayurdesk/index.html) – Operations Dashboard (Live KPIs, 7d/30d/All filters, Trend & Channel charts, Anomaly alert, recent records)
- [`login.html`](file:///a:/PROJECTS/ayurdesk/login.html) – Authentication & Provisioning (Sign In, Registration, 1-Click Demo Logins for Admin, Shilpa, Gokul)
- [`daily-entry.html`](file:///a:/PROJECTS/ayurdesk/daily-entry.html) – Record Daily Operations (Validation, auto turnaround calculation, confirmation modal)
- [`records.html`](file:///a:/PROJECTS/ayurdesk/records.html) – All Records Ledger (Date search, range filter, pagination, edit modal, delete dialog)
- [`analytics.html`](file:///a:/PROJECTS/ayurdesk/analytics.html) – Performance Insights (Conversion funnel, Chart.js trends, WhatsApp vs phone calls, day-of-week averages)
- [`reports.html`](file:///a:/PROJECTS/ayurdesk/reports.html) – Admin Export Center (Scope filters, ExcelJS `.xlsx` workbook generation, jsPDF `.pdf` landscape report)
- [`users.html`](file:///a:/PROJECTS/ayurdesk/users.html) – User & Staff Management (Team listing, role assignment, password reset requirement toggling)
- [`audit-logs.html`](file:///a:/PROJECTS/ayurdesk/audit-logs.html) – Immutable Audit Trail (Change history, action filters, payload inspection diff modal)
- [`settings.html`](file:///a:/PROJECTS/ayurdesk/settings.html) – Settings & System Profile (Timezone sync, password update, sandbox seed reset)

### Running the Multi-Page Website
You can open any HTML file directly in your browser or run a lightweight local static server:
```bash
# Using Node.js
npx serve .

# Or using Python 3
python -m http.server 8080
```

---

## 10. Vercel Production Deployment

1. Push this repository to GitHub or GitLab.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the `ayurdesk` repository.
4. Framework Preset: **Vite**
5. Root Directory: `./`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_SUPABASE_FUNCTIONS_URL`: Your Supabase Edge Function URL
9. Deploy! The included `vercel.json` ensures client-side routing works for all URLs.

---

## 10. Supabase Edge Function Deployment

To deploy the privileged report export authorization function:
```bash
npx supabase functions deploy export-reports --project-ref <your-project-ref>
```
Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Supabase Function Secrets.
