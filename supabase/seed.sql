-- ====================================================================
-- AyurDesk - Daily Operations Management System
-- Seed Data: seed.sql
-- Organization: Ayuryoga International
-- ====================================================================

-- 16 Historical Operational Records
-- Note: Date 2027-10-26 preserved as per source audit requirements and flagged for verification.
INSERT INTO public.daily_reports (
    report_date,
    total_enquiries,
    total_responses,
    total_confirmations,
    total_bookings,
    tomorrow_bookings,
    whatsapp_calls_messages,
    normal_calls
) VALUES
('2026-10-25', 29, 29, NULL, 11, NULL, 32, 15),
('2027-10-26', 31, 31, NULL, 7,  NULL, 28, 28), -- Flagged for Admin Verification (possible year typo in source data)
('2026-10-27', 47, 47, NULL, 26, NULL, 34, 12),
('2026-10-28', 37, 37, NULL, 28, NULL, 26, 11),
('2026-10-29', 25, 25, NULL, 21, NULL, 48, 10),
('2026-10-30', 34, 34, NULL, 12, NULL, 29, 7),
('2026-10-31', 30, 30, NULL, 14, NULL, 20, 11),
('2026-11-01', 42, 42, NULL, NULL, NULL, 42, 10),
('2026-11-02', 42, 42, NULL, 14, NULL, 29, 12),
('2026-11-03', 46, 46, NULL, 22, NULL, NULL, 25),
('2026-11-04', 32, 32, NULL, 18, NULL, 27, 5),
('2026-11-05', 27, 27, NULL, 10, NULL, 21, NULL),
('2026-11-06', 14, 14, NULL, 10, NULL, NULL, 7),
('2026-11-07', 21, 21, NULL, 11, 28,   15, 7),
('2026-11-08', 24, 24, 13,   NULL, NULL, 21, 3),
('2026-11-09', 2,  2,  2,    2,    NULL, NULL, 1)
ON CONFLICT (report_date) DO UPDATE SET
    total_enquiries = EXCLUDED.total_enquiries,
    total_responses = EXCLUDED.total_responses,
    total_confirmations = EXCLUDED.total_confirmations,
    total_bookings = EXCLUDED.total_bookings,
    tomorrow_bookings = EXCLUDED.tomorrow_bookings,
    whatsapp_calls_messages = EXCLUDED.whatsapp_calls_messages,
    normal_calls = EXCLUDED.normal_calls,
    updated_at = now();
